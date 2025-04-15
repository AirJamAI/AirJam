"use client";
import { useRef, useState } from "react";
import Instruments, { NoteMap } from "./components/Instruments";
import Webcam from "./components/Webcam";
import { ImgData, WebsocketFrame } from "./types/WebsocketTypes";

export default function Home() {
    const ws = useRef<WebSocket | null>(null);
    const [multi, setMulti] = useState<string>("true");
    const [imgData, setImgData] = useState<ImgData>({
        data: "",
        cols: [],
        time: 0,
    });

    const [selectedInstrument, setSelectedInstrument] = useState(0);
    const noteMapRef = useRef<NoteMap>({});

    const connectWebSocket = () => {
        ws.current = new WebSocket("ws://localhost:8000/ws");

        ws.current.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {
            const res: WebsocketFrame = JSON.parse(event.data);

            setImgData({ data: res.data, cols: res.cols, time: Date.now() });
        };

        ws.current.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
    };

    const sendImage = async (base64: string) => {
        if (!ws.current) {
            connectWebSocket();
            await new Promise((res) => setTimeout(res, 500));
        }

        // Optional: Send as JSON with filename
        const payload = JSON.stringify({
            data: base64,
            multiplayer: multi,
        });

        ws.current!.send(payload);
    };
    return (
        <div className="h-[100vh] w-[100vw] bg-primary text-white">
            <div className="flex flex-row items-start justify-center h-full">
                <div className="flex flex-row items-center justify-center h-full pl-4 py-10">
                    <Webcam
                        ws={ws.current}
                        imgData={imgData}
                        sendImage={sendImage}
                        setInst={setSelectedInstrument}
                        instI={selectedInstrument}
                        noteMapRef={noteMapRef}
                    />
                </div>
                <div className="flex flex-col justify-between w-full py-10">
                    <Instruments
                        noteMapRef={noteMapRef}
                        instI={selectedInstrument ?? 0}
                        imgData={imgData}
                        setMulti={setMulti}
                        multi={multi}
                    />
                </div>
            </div>
        </div>
    );
}
