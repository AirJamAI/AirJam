/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Trash } from "lucide-react";
import { RefObject, useEffect, useRef } from "react";
import {
    drumMappings,
    initDrumAudioFont,
    initWebAudioFont,
    InstrumentMeta,
    instrumentOptions,
} from "../../utils/utils";
import { ImgData } from "../types/WebsocketTypes";

const arrayRange = (start: number, stop: number, step = 1) =>
    Array.from(
        { length: Math.ceil((stop - start) / step) + 1 },
        (value, index) => start + index * step
    );

/**
 * Each instrument label -> array of NoteRefData.
 * This prevents collisions when you have multiple instruments
 * that can each have repeating or indefinite notes.
 */
export type NoteMap = Record<string, NoteRefData[]>;

/** For each note, we store indefinite or repeat logic. */
export type NoteRefData = {
    audioCtx: AudioContext | null;
    player: any | null;
    gainNode: GainNode | null;
    noteObj: any | null;
    startTime: number;
    timeoutId: ReturnType<typeof setTimeout> | null;
    colState: 0 | 1 | 2; // 0=release,1=pressed,2=toggle mode
    repeatStage: number; // 0=off,1=1 beat,2=1/2,3=1/4,4=1/8,5=1/16,
    repeatTimer?: number; // the setInterval ID
};

const BPM = 60;
const secPerBeat = 60 / BPM;

const indToNote = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

const indToDrum = [
    "Bass",
    "Snare",
    "Hi-Hat",
    "Crash",
    "Tom 1",
    "Tom 2",
    "Tom 3",
];

// 8 melodic note definitions
const melodyData = [
    { label: "C4", midi: 60 },
    { label: "D4", midi: 62 },
    { label: "E4", midi: 64 },
    { label: "F4", midi: 65 },
    { label: "G4", midi: 67 },
    { label: "A4", midi: 69 },
    { label: "B4", midi: 71 },
    { label: "C5", midi: 72 },
];

// Drums: 7 of them
const drumCount = 7;

export default function Instruments({
    imgData,
    instI,
    noteMapRef,
    setMulti,
    multi,
}: {
    imgData: ImgData;
    instI: number;
    noteMapRef: RefObject<NoteMap>;
    setMulti: any;
    multi: string;
}) {
    // 1) Which instrument index is selected, e.g. 0=Flute, 1=Drums, etc.
    const selectedInstrument = instrumentOptions[instI];

    // 2) Dictionary of instrumentName -> array of references

    // Helper to create a new note reference
    function makeNoteRef(): NoteRefData {
        return {
            audioCtx: null,
            player: null,
            gainNode: null,
            noteObj: null,
            startTime: 0,
            timeoutId: null,
            colState: 0,
            repeatStage: 0,
        };
    }

    // 3) Script loading. We track which instruments are loaded, so we load once per instrument
    const loadedInstrumentsRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        (async () => {
            const label = selectedInstrument.label;
            if (!loadedInstrumentsRef.current[label]) {
                // Not yet loaded => load it
                try {
                    if (label === "Drums") {
                        await initDrumAudioFont(drumMappings);
                    } else {
                        await initWebAudioFont([selectedInstrument]);
                    }
                    loadedInstrumentsRef.current[label] = true;
                } catch (err) {
                    console.error("Error loading scripts for", label, err);
                }
            }
        })();
    }, [instI, selectedInstrument]);

    // 5) Return the references array for a given instrument label
    function getRefsForInstrument(label: string) {
        if (!noteMapRef.current[label]) {
            if (label === "Drums") {
                // 7 references
                noteMapRef.current[label] = Array(drumCount)
                    .fill(null)
                    .map(() => makeNoteRef());
            } else {
                // 8 references for melody
                noteMapRef.current[label] = melodyData.map(() => makeNoteRef());
            }
        }
        return noteMapRef.current[label];
    }

    // 6) Indefinite note logic + repeating toggles

    function handleNoteDown(
        refData: NoteRefData,
        midi: number,
        globalVar: string
    ) {
        // If repeating, ignore normal press
        if (refData.repeatStage > 0) return;

        // kill leftover timer
        if (refData.timeoutId) {
            clearTimeout(refData.timeoutId);
            refData.timeoutId = null;
        }
        // fade out old note
        if (refData.noteObj) {
            fadeOutAndClose(refData, 0.25);
        }

        // new AudioContext
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        refData.audioCtx = ctx;

        // new WebAudioFontPlayer
        const WAFPlayer = (window as any).WebAudioFontPlayer;
        if (!WAFPlayer) return;
        const player = new WAFPlayer();
        refData.player = player;

        // decode
        player.loader.decodeAfterLoading(ctx, globalVar);

        // gain node
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        gainNode.connect(ctx.destination);
        refData.gainNode = gainNode;

        const now = ctx.currentTime;
        const instrData = (window as any)[globalVar];
        if (!instrData) {
            console.warn("No instrumentData for indefinite note", globalVar);
            return;
        }
        refData.noteObj = player.queueWaveTable(
            ctx,
            gainNode,
            instrData,
            now,
            midi,
            9999
        );
        refData.startTime = now;
    }

    function handleNoteUp(refData: NoteRefData) {
        // If there's no indefinite note playing, ignore
        if (!refData.audioCtx || !refData.player || !refData.noteObj) return;

        const ctx = refData.audioCtx;
        const now = ctx.currentTime;
        const hold = now - refData.startTime;
        // If user held >=1s => stop now
        if (hold >= 1) {
            fadeOutAndClose(refData, 0.25);
        } else {
            // else wait leftover time to reach 1s
            const remain = 1 - hold;
            const tid = setTimeout(() => {
                if (refData.noteObj) {
                    fadeOutAndClose(refData, 0.25);
                }
                refData.timeoutId = null;
            }, remain * 1000);
            refData.timeoutId = tid;
        }
    }

    function handleRepeatToggle(
        refData: NoteRefData,
        midi: number,
        globalVar: string
    ) {
        let next = refData.repeatStage + 1;
        if (next > 5) next = 0; // turn off
        if (next === 0) {
            stopRepeating(refData);
        } else {
            startRepeating(refData, next, midi, globalVar);
        }
        refData.repeatStage = next;
    }

    function stopRepeating(refData: NoteRefData) {
        if (refData.repeatTimer) {
            clearInterval(refData.repeatTimer);
            refData.repeatTimer = undefined;
        }
        // If indefinite note is active, fade it out
        if (refData.noteObj) {
            fadeOutAndClose(refData, 0.25);
        }
    }

    function startRepeating(
        refData: NoteRefData,
        stage: number,
        midi: number,
        globalVar: string
    ) {
        stopRepeating(refData);

        // stage=1 => 1 beat => secPerBeat
        // stage=2 => 1/2 => secPerBeat/2
        // stage=3 => 1/4 => secPerBeat/4
        // stage=4 => 1/8 => secPerBeat/8
        // stage=5 => 1/16 => secPerBeat/16
        const divisor = Math.pow(2, stage - 1);
        const intervalMs = (secPerBeat / divisor) * 1000;

        const SHORT_NOTE_DURATION = 0.2;

        // play once immediately
        playShortNote(midi, globalVar, SHORT_NOTE_DURATION);

        refData.repeatTimer = window.setInterval(() => {
            playShortNote(midi, globalVar, SHORT_NOTE_DURATION);
        }, intervalMs);
    }

    function playShortNote(midi: number, globalVar: string, duration: number) {
        // each short note is a brand‐new context
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();

        const WAFPlayer = (window as any).WebAudioFontPlayer;
        if (!WAFPlayer) return;
        const player = new WAFPlayer();
        player.loader.decodeAfterLoading(ctx, globalVar);

        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;
        const instrData = (window as any)[globalVar];
        if (!instrData) {
            console.warn("No instrumentData for repeating note", globalVar);
            return;
        }
        const noteObj = player.queueWaveTable(
            ctx,
            gainNode,
            instrData,
            now,
            midi,
            duration
        );

        // after it ends, forcibly close
        setTimeout(() => {
            if (noteObj.waveSources) {
                for (const w of noteObj.waveSources) {
                    w.source?.stop();
                }
            }
            ctx.close();
        }, duration * 1000);
    }

    function fadeOutAndClose(refData: NoteRefData, fadeSec: number) {
        const ctx = refData.audioCtx;
        if (!ctx) return;

        const now = ctx.currentTime;
        if (refData.gainNode) {
            refData.gainNode.gain.cancelScheduledValues(now);
            refData.gainNode.gain.setValueAtTime(
                refData.gainNode.gain.value,
                now
            );
            refData.gainNode.gain.linearRampToValueAtTime(0, now + fadeSec);
        }
        if (refData.noteObj?.waveSources) {
            for (const waveSrc of refData.noteObj.waveSources) {
                waveSrc.source?.stop(now + fadeSec);
            }
        } else if (typeof refData.noteObj?.stop === "function") {
            refData.noteObj.stop(now + fadeSec);
        }

        setTimeout(() => {
            refData.noteObj = null;
            refData.player = null;
            if (refData.audioCtx) {
                refData.audioCtx.close();
                refData.audioCtx = null;
            }
        }, fadeSec * 1000);
    }
    useEffect(() => {
        const resetCol = imgData.cols.find((col) => col.name === "top");
        if (!resetCol) return;
        if (resetCol.col > 0) {
            // Use a slight delay to let any ongoing state updates complete.
            setTimeout(() => {
                const noteRefs = getRefsForInstrument(selectedInstrument.label);
                noteRefs.forEach((refData) => {
                    // Clear any active interval
                    if (refData.repeatTimer) {
                        clearInterval(refData.repeatTimer);
                        refData.repeatTimer = undefined;
                    }
                    // If there's a note playing, force a quick fade-out and close it.
                    if (refData.noteObj) {
                        fadeOutAndClose(refData, 0.1);
                    }
                    // Reset the state properties completely.
                    refData.repeatStage = 0;
                    refData.colState = 0;
                });
            }, 0);
        }
    }, [imgData.cols, selectedInstrument.label]);

    // 7) When new imgData arrives, interpret it as controlling the currently selected instrument
    useEffect(() => {
        if (!imgData?.cols?.length) return;

        const label = selectedInstrument.label;
        const noteRefs = getRefsForInstrument(label);
        // if Drums => 7 indexes, else 8 for melody
        const maxIndex = label === "Drums" ? drumCount : melodyData.length;

        imgData.cols.forEach((col, i) => {
            if (i < 0 || i >= maxIndex) return;
            const refData = noteRefs[i];
            const oldVal = refData.colState;
            const newVal = col.col as 0 | 1 | 2;

            if (oldVal !== newVal) {
                refData.colState = newVal;
                if (newVal === 1) {
                    // normal press => indefinite hold, unless repeatStage>0
                    if (refData.repeatStage === 0) {
                        const midi =
                            label === "Drums"
                                ? drumMappings[i].midi
                                : melodyData[i].midi;
                        const gv =
                            label === "Drums"
                                ? drumMappings[i].globalVar
                                : selectedInstrument.globalVar;
                        handleNoteDown(refData, midi, gv);
                    }
                } else if (newVal === 0) {
                    // release => only if not repeating
                    if (refData.repeatStage === 0) {
                        handleNoteUp(refData);
                    }
                } else if (newVal === 2) {
                    // repeating toggles
                    const midi =
                        label === "Drums"
                            ? drumMappings[i].midi
                            : melodyData[i].midi;
                    const gv =
                        label === "Drums"
                            ? drumMappings[i].globalVar
                            : selectedInstrument.globalVar;
                    handleRepeatToggle(refData, midi, gv);
                }
            }
        });
    }, [imgData, selectedInstrument]);

    function instHasRepeats(v: InstrumentMeta) {
        let flag = false;
        noteMapRef.current[v.label].map((e) => {
            if (e.repeatStage > 0) flag = true;
        });

        return flag;
    }

    return (
        <div className="px-4 mt-12">
            <div
                className=" flex flex-row w-full justify-center items-start gap-4
            "
            >
                <div className="flex flex-row gap-2 mr-6">
                    <img
                        src="AirJamLogoMin.png"
                        className="size-12 my-auto"
                    ></img>
                    <div className="text-3xl font-bold font-serif">AirJam</div>
                </div>

                <button
                    className={`${
                        multi == "true" ? "bg-secondary" : "bg-teritary"
                    } p-2 rounded-xl transition-colors font-serif shadow w-36 cursor-pointer duration-1000`}
                    onClick={() => {
                        setMulti(multi === "true" ? "false" : "true");
                    }}
                >
                    {`${multi === "true" ? "Multiplayer" : "Singleplayer"}`}
                </button>
            </div>
            <div className="border border-gray-600 my-2" />
            <div className="font-serif text-center">
                One hand to play a note, two to repeat it.
            </div>
            <div className="font-serif text-center">
                Raising your index finger also repeats notes in Singleplayer.
            </div>
            <div className="border border-gray-600 my-2" />
            <div className="text-[24px] font-serif font-bold text-center">
                {selectedInstrument.label}
            </div>
            <div className="text-xl font-serif font-extralight text-center">
                {`~ ${selectedInstrument.group
                    .charAt(0)
                    .toUpperCase()}${selectedInstrument.group.slice(1)} ~`}
            </div>
            {instrumentOptions.some((v) =>
                noteMapRef.current[v.label]?.some((e) => e.repeatStage != 0)
            ) && (
                <>
                    <div className="border border-gray-600 my-2" />
                </>
            )}
            <div className="flex flex-col h-[22vw] overflow-auto">
                {instrumentOptions.map((v) => {
                    if (noteMapRef.current[v.label])
                        return (
                            <div className="flex flex-col" key={v.label}>
                                {instHasRepeats(v) && (
                                    <div className="flex font-bold font-serif flex-row gap-2">
                                        <button
                                            className="bg-secondary cursor-pointer hover:bg-teritary rounded size-5 my-auto p-[2px]"
                                            onClick={() => {
                                                const noteRefs =
                                                    getRefsForInstrument(
                                                        v.label
                                                    );
                                                noteRefs.forEach((refData) => {
                                                    // Clear any active interval
                                                    if (refData.repeatTimer) {
                                                        clearInterval(
                                                            refData.repeatTimer
                                                        );
                                                        refData.repeatTimer =
                                                            undefined;
                                                    }
                                                    // If there's a note playing, force a quick fade-out and close it.
                                                    if (refData.noteObj) {
                                                        fadeOutAndClose(
                                                            refData,
                                                            0.1
                                                        );
                                                    }
                                                    // Reset the state properties completely.
                                                    refData.repeatStage = 0;
                                                    refData.colState = 0;
                                                });
                                            }}
                                        >
                                            <Trash className="size-full" />
                                        </button>
                                        {`${v.label}`}
                                        <div className="font-normal">
                                            {`~ ${v.group.charAt(0).toUpperCase()}${v.group.slice(1)}`}
                                        </div>
                                    </div>
                                )}
                                {noteMapRef.current[v.label].map((e, i) => {
                                    return (
                                        e.repeatStage != 0 && (
                                            <div className="font-bold font-serif">
                                                <div className="font-normal flex flex-row pl-4">
                                                    {`${
                                                        v.label == "Drums"
                                                            ? indToDrum[i]
                                                            : indToNote[i]
                                                    }:`}
                                                    <div className="grid grid-cols-6 gap-1 pl-2 my-auto">
                                                        {arrayRange(
                                                            1,
                                                            5,
                                                            1
                                                        ).map((v) => {
                                                            if (
                                                                v <=
                                                                e.repeatStage
                                                            )
                                                                return (
                                                                    <div
                                                                        className="rounded-full shadow size-[1.2vw] text-transparent bg-secondary"
                                                                        key={v}
                                                                    >
                                                                        #
                                                                    </div>
                                                                );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    );
                                })}
                            </div>
                        );
                })}
            </div>
        </div>
    );
}
