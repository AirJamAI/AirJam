import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import WebAudioFontLoader from "./components/WebAudioFontLoader";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://play.airjam.studio"),
    title: "AirJam – One Man Band",
    description:
        "Be a one man band, anytime, anywhere. Play up to 30 instruments with nothing but your hands and a web cam.",
    openGraph: {
        title: "AirJam – One Man Band",
        description:
            "Be a one man band, anytime, anywhere. Play up to 30 instruments with nothing but your hands and a web cam.",
        url: "https://play.airjam.studio",
        images: [
            {
                url: "/media-logo.png",
                alt: "AirJam Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AirJam – Your All-In-One Musical Companion",
        description:
            "Be a one man band, anytime, anywhere. Play up to 30 instruments with nothing but your hands and a web cam.",
        images: "/media-logo.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#43AA8B",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <WebAudioFontLoader />
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
