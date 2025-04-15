/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { instrumentOptions } from "@/utils/utils";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { ImgData } from "../types/WebsocketTypes";
import { NoteMap } from "./Instruments";

const arrayRange = (start: number, stop: number, step = 1) =>
    Array.from(
        { length: Math.ceil((stop - start) / step) + 1 },
        (value, index) => start + index * step
    );

type WebcamProps = {
    ws: WebSocket | null;
    imgData: ImgData;
    sendImage: (v: string) => void;
    setInst: React.Dispatch<React.SetStateAction<number>>;
    instI: number;
    noteMapRef: RefObject<NoteMap>;
};
export default function Webcam({
    ws,
    imgData,
    sendImage,
    setInst,
    instI,
    noteMapRef,
}: WebcamProps) {
    const wcRef = useRef<HTMLVideoElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [lbState, setLbState] = useState(false);
    const [tlbState, setTlbState] = useState(false);
    const [rbState, setRbState] = useState(false);
    const [trbState, setTrbState] = useState(false);

    const leftIndex = imgData.cols.findIndex((col) => col.name === "left");
    const rightIndex = imgData.cols.findIndex((col) => col.name === "right");
    const resetIndex = imgData.cols.findIndex((col) => col.name === "top");
    const nextGroupIndex = imgData.cols.findIndex(
        (col) => col.name === "topright"
    );
    const prevGroupIndex = imgData.cols.findIndex(
        (col) => col.name === "topleft"
    );

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

    const w = 320;
    const h = 180;
    useEffect(() => {
        const enableStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { advanced: [{ aspectRatio: { exact: 16 / 9 } }] },
                });

                if (wcRef.current) {
                    wcRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        enableStream();
    }, [wcRef]); // Empty array ensures it runs once on mount

    useEffect(() => {
        if (ws?.readyState != ws?.OPEN) return;

        if (imgRef.current) imgRef.current.src = imgData.data;
        takePicture();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgData.time, ws?.readyState]);

    useEffect(() => {
        setLbState(imgData.cols[leftIndex]?.col > 0);
        setRbState(imgData.cols[rightIndex]?.col > 0);
        setTlbState(imgData.cols[nextGroupIndex]?.col > 0);
        setTrbState(imgData.cols[prevGroupIndex]?.col > 0);
    }, [imgData.cols]);

    useEffect(() => {
        if (lbState) setInst((instI + 1) % instrumentOptions.length);
    }, [lbState]);

    useEffect(() => {
        if (rbState)
            setInst(
                (instI - 1 + instrumentOptions.length) %
                    instrumentOptions.length
            );
    }, [rbState]);

    const groupList = [
        "guitar",
        "strings",
        "brass",
        "pipe",
        "keyboard",
        "percussion",
    ];

    useEffect(() => {
        if (tlbState) {
            const currentGroupIndex = groupList.indexOf(
                instrumentOptions[instI].group
            );
            const prevGroup =
                groupList[
                    (currentGroupIndex - 1 + groupList.length) %
                        groupList.length
                ];
            const firstInPrevGroupIndex = instrumentOptions.findIndex(
                (inst) => inst.group === prevGroup
            );
            setInst(firstInPrevGroupIndex);
        }
    }, [tlbState]);

    useEffect(() => {
        if (trbState) {
            const currentGroupIndex = groupList.indexOf(
                instrumentOptions[instI].group
            );
            const nextGroup =
                groupList[(currentGroupIndex + 1) % groupList.length];
            const firstInNextGroupIndex = instrumentOptions.findIndex(
                (inst) => inst.group === nextGroup
            );
            setInst(firstInNextGroupIndex);
        }
    }, [trbState]);

    function takePicture() {
        const cv = cvRef?.current;
        const context = cv?.getContext("2d");
        if (cv && context && wcRef.current) {
            cv.width = w;
            cv.height = h;
            context.drawImage(wcRef.current, 0, 0, w, h);

            const frame = cv.toDataURL("image/png");

            sendImage(frame);
        }
    }

    return (
        <div>
            <video ref={wcRef} autoPlay playsInline className="hidden" />
            <canvas ref={cvRef} className="hidden -scale-x-[100%]" />
            <div className="flex flex-row">
                <div className="relative w-[75vw] mx-auto">
                    <img
                        ref={imgRef}
                        className="-scale-x-[100%] w-full shadow-xl border-2 border-black rounded-xl"
                    />
                    <div className="absolute flex p-1 flex-row top-0 w-full text-black font-serif h-[24vw]">
                        {/* Left box */}
                        <div
                            className={`h-full w-[7.5vw] rounded-xl flex flex-col items-center justify-center text-2xl ${
                                !imgData.cols[rightIndex]
                                    ? ""
                                    : imgData.cols[rightIndex].col >= 1
                                      ? "bg-[#6F73D275]"
                                      : "bg-[#EFF1ED75]"
                            }`}
                        >
                            <ArrowBigLeft className="size-16" />
                        </div>

                        {/* Center three buttons */}
                        <div className="flex h-[9.5vw] w-[60vw] gap-1 px-1 font-serif">
                            <div
                                className={`w-1/3 h-full flex items-center justify-center rounded-xl text-4xl ${
                                    !imgData.cols[nextGroupIndex]
                                        ? ""
                                        : imgData.cols[nextGroupIndex].col >= 1
                                          ? "bg-[#6F73D275]"
                                          : "bg-[#EFF1ED75]"
                                }`}
                            >
                                Previous Group
                            </div>
                            <div
                                className={`w-1/3 h-full flex items-center text-center justify-center rounded-xl text-4xl ${
                                    !imgData.cols[resetIndex]
                                        ? ""
                                        : imgData.cols[resetIndex].col >= 1
                                          ? "bg-[#6F73D275]"
                                          : "bg-[#EFF1ED75]"
                                }`}
                            >
                                Reset Instrument Tempo
                            </div>
                            <div
                                className={`w-1/3 h-full flex items-center justify-center rounded-xl text-4xl ${
                                    !imgData.cols[prevGroupIndex]
                                        ? ""
                                        : imgData.cols[prevGroupIndex].col >= 1
                                          ? "bg-[#6F73D275]"
                                          : "bg-[#EFF1ED75]"
                                }`}
                            >
                                Next Group
                            </div>
                        </div>

                        {/* Right box */}
                        <div
                            className={`h-full w-[7.5vw] rounded-xl flex flex-col items-center text-2xl justify-center ${
                                !imgData.cols[leftIndex]
                                    ? ""
                                    : imgData.cols[leftIndex].col >= 1
                                      ? "bg-[#6F73D275]"
                                      : "bg-[#EFF1ED75]"
                            }`}
                        >
                            <ArrowBigRight className="size-16" />
                        </div>
                    </div>
                    <div
                        className={`absolute bottom-0 grid pr-[1.2vw] gap-[1vw] grid-cols-8 h-[9vw] w-full`}
                    >
                        {imgData.cols.map((v, i) => {
                            if (
                                i <
                                (instrumentOptions[instI].label == "Drums"
                                    ? 7
                                    : 8)
                            )
                                return (
                                    <div
                                        key={i}
                                        className={`text-black text-5xl shadow flex flex-col text-center rounded-xl m-1
                                        ${
                                            v.col >= 2
                                                ? "bg-[#43aa8b75]"
                                                : v.col == 1
                                                  ? "bg-[#6F73D275]"
                                                  : "bg-[#EFF1ED75]"
                                        }`}
                                    >
                                        <div
                                            className={`my-auto w-full font-serif ${
                                                instrumentOptions[instI]
                                                    .label == "Drums"
                                                    ? "text-2xl"
                                                    : "text-4xl"
                                            }`}
                                        >
                                            {instrumentOptions[instI].label ==
                                            "Drums"
                                                ? indToDrum[i]
                                                : indToNote[i]}
                                        </div>

                                        <div className="grid grid-cols-5 gap-2 pl-2 pr-3 py-2">
                                            {noteMapRef?.current &&
                                            noteMapRef?.current[
                                                instrumentOptions[instI].label
                                            ] &&
                                            noteMapRef?.current[
                                                instrumentOptions[instI].label
                                            ][i].repeatStage > 0 ? (
                                                arrayRange(1, 5, 1).map((v) => {
                                                    if (
                                                        v <=
                                                        noteMapRef?.current[
                                                            instrumentOptions[
                                                                instI
                                                            ].label
                                                        ][i].repeatStage
                                                    )
                                                        return (
                                                            <div
                                                                key={v}
                                                                className="rounded-full shadow border-2 border-primary size-[1.2vw] text-transparent bg-secondary"
                                                            >
                                                                #
                                                            </div>
                                                        );
                                                })
                                            ) : (
                                                <div className="text-transparent size-[1.2vw]">
                                                    #
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
