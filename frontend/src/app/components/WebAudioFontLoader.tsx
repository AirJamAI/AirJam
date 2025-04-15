// components/WebAudioFontLoader.tsx
"use client";
import { useEffect } from "react";
import {
    drumMappings,
    initWebAudioFont,
    InstrumentMeta,
    instrumentOptions,
} from "../../utils/utils";

export default function WebAudioFontLoader() {
    useEffect(() => {
        initWebAudioFont(
            [...instrumentOptions, ...drumMappings].filter(
                (item): item is InstrumentMeta => "group" in item
            )
        ).catch((err) => {
            console.error("Failed to initialize WebAudioFont globally:", err);
        });
    }, []);

    return null;
}
