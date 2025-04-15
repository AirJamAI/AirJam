// utils.ts

export type InstrumentMeta = {
  label: string;
  scriptUrl: string;
  globalVar: string;
  group: string;
};

export const instrumentOptions: InstrumentMeta[] = [
  {
    label: "Acoustic Guitar",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0240_JCLive_sf2_file.js",
    globalVar: "_tone_0240_JCLive_sf2_file",
    group: "guitar",
  },
  {
    label: "Electric Guitar (Jazz)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0260_JCLive_sf2_file.js",
    globalVar: "_tone_0260_JCLive_sf2_file",
    group: "guitar",
  },
  {
    label: "Electric Guitar (Distorted)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0300_JCLive_sf2_file.js",
    globalVar: "_tone_0300_JCLive_sf2_file",
    group: "guitar",
  },
  {
    label: "Electric Guitar (Overdriven)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0290_JCLive_sf2_file.js",
    globalVar: "_tone_0290_JCLive_sf2_file",
    group: "guitar",
  },
  {
    label: "Violin",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0400_JCLive_sf2_file.js",
    globalVar: "_tone_0400_JCLive_sf2_file",
    group: "strings",
  },
  {
    label: "Cello",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0420_JCLive_sf2_file.js",
    globalVar: "_tone_0420_JCLive_sf2_file",
    group: "strings",
  },
  {
    label: "Viola",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0410_JCLive_sf2_file.js",
    globalVar: "_tone_0410_JCLive_sf2_file",
    group: "strings",
  },
  {
    label: "Contrabass",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0430_JCLive_sf2_file.js",
    globalVar: "_tone_0430_JCLive_sf2_file",
    group: "strings",
  },
  {
    label: "Orchestral Harp",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0460_JCLive_sf2_file.js",
    globalVar: "_tone_0460_JCLive_sf2_file",
    group: "strings",
  },
  {
    label: "Trumpet",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0560_JCLive_sf2_file.js",
    globalVar: "_tone_0560_JCLive_sf2_file",
    group: "brass",
  },
  {
    label: "Trombone",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0570_JCLive_sf2_file.js",
    globalVar: "_tone_0570_JCLive_sf2_file",
    group: "brass",
  },
  {
    label: "Tuba",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0580_JCLive_sf2_file.js",
    globalVar: "_tone_0580_JCLive_sf2_file",
    group: "brass",
  },
  {
    label: "French Horn",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0600_JCLive_sf2_file.js",
    globalVar: "_tone_0600_JCLive_sf2_file",
    group: "brass",
  },
  {
    label: "Flute",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0730_JCLive_sf2_file.js",
    globalVar: "_tone_0730_JCLive_sf2_file",
    group: "pipe",
  },
  {
    label: "Piccolo",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0720_JCLive_sf2_file.js",
    globalVar: "_tone_0720_JCLive_sf2_file",
    group: "pipe",
  },
  {
    label: "Recorder",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0740_JCLive_sf2_file.js",
    globalVar: "_tone_0740_JCLive_sf2_file",
    group: "pipe",
  },
  {
    label: "Pan Flute",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0750_JCLive_sf2_file.js",
    globalVar: "_tone_0750_JCLive_sf2_file",
    group: "pipe",
  },
  {
    label: "Whistle",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0780_JCLive_sf2_file.js",
    globalVar: "_tone_0780_JCLive_sf2_file",
    group: "pipe",
  },
  {
    label: "Ocarina",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0790_JCLive_sf2_file.js",
    globalVar: "_tone_0790_JCLive_sf2_file",
    group: "pipe",
  },
  {
    label: "Piano",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js",
    globalVar: "_tone_0000_JCLive_sf2_file",
    group: "keyboard",
  },
  {
    label: "Synth (Calliope)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0820_JCLive_sf2_file.js",
    globalVar: "_tone_0820_JCLive_sf2_file",
    group: "keyboard",
  },
  {
    label: "Synth (New Age)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0880_JCLive_sf2_file.js",
    globalVar: "_tone_0880_JCLive_sf2_file",
    group: "keyboard",
  },
  {
    label: "Synth (Warm)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0890_JCLive_sf2_file.js",
    globalVar: "_tone_0890_JCLive_sf2_file",
    group: "keyboard",
  },
  {
    label: "Synth (Sweep)",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0950_JCLive_sf2_file.js",
    globalVar: "_tone_0950_JCLive_sf2_file",
    group: "keyboard",
  },
  {
    label: "Drums",
    scriptUrl: "",
    globalVar: "",
    group: "percussion",
  },
  {
    label: "Tinkle Bell",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/0950_JCLive_sf2_file.js",
    globalVar: "_tone_0950_JCLive_sf2_file",
    group: "percussion",
  },
  {
    label: "Woodblock",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/1150_JCLive_sf2_file.js",
    globalVar: "_tone_1150_JCLive_sf2_file",
    group: "percussion",
  },
  {
    label: "Taiko Drum",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/1160_JCLive_sf2_file.js",
    globalVar: "_tone_1160_JCLive_sf2_file",
    group: "percussion",
  },
  {
    label: "Melodic Tom",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/1170_JCLive_sf2_file.js",
    globalVar: "_tone_1170_JCLive_sf2_file",
    group: "percussion",
  },
  {
    label: "Synth Drum",
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/1180_JCLive_sf2_file.js",
    globalVar: "_tone_1180_JCLive_sf2_file",
    group: "percussion",
  },
];

interface DrumMappings {
  label: string;
  midi: number;
  scriptUrl: string;
  globalVar: string;
}
export const drumMappings: DrumMappings[] = [
  {
    label: "Bass",
    midi: 35,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12835_17_JCLive_sf2_file.js",
    globalVar: "_drum_35_17_JCLive_sf2_file",
  },
  {
    label: "Snare",
    midi: 40,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12840_1_JCLive_sf2_file.js",
    globalVar: "_drum_40_1_JCLive_sf2_file",
  },
  {
    label: "Hi-Hat",
    midi: 42,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12842_1_JCLive_sf2_file.js",
    globalVar: "_drum_42_1_JCLive_sf2_file",
  },
  {
    label: "Crash",
    midi: 51,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12851_1_JCLive_sf2_file.js",
    globalVar: "_drum_51_1_JCLive_sf2_file",
  },
  {
    label: "Tom 1",
    midi: 50,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12850_1_JCLive_sf2_file.js",
    globalVar: "_drum_50_1_JCLive_sf2_file",
  },
  {
    label: "Tom 2",
    midi: 48,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12848_1_JCLive_sf2_file.js",
    globalVar: "_drum_48_1_JCLive_sf2_file",
  },
  {
    label: "Tom 3",
    midi: 41,
    scriptUrl:
      "https://surikov.github.io/webaudiofontdata/sound/12841_1_JCLive_sf2_file.js",
    globalVar: "_drum_41_1_JCLive_sf2_file",
  },
];

export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

export const initWebAudioFont = async (instruments: InstrumentMeta[]) => {
  await loadScript(
    "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js",
  );
  for (const inst of instruments) {
    await loadScript(inst.scriptUrl);
  }
};

export const initDrumAudioFont = async (instruments: DrumMappings[]) => {
  await loadScript(
    "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js",
  );
  for (const inst of instruments) {
    await loadScript(inst.scriptUrl);
  }
};
