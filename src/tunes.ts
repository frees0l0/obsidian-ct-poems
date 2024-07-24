import { Tune } from "types";
import { splitLines, splitSentences } from "poemUtil";

const ALL_TUNES = [
  {
    name: "菩萨蛮",
    tones: "中平中仄平平仄，中平中仄平平仄。中仄仄平平，中平中仄平。\n中平平仄仄，中仄中平仄。中仄仄平平，中平中仄平。",
  }
]
.map(tune => {
  return buildTune(tune.name, tune.tones);
});

function buildTune(name: string, tones: string): Tune {
  const lines = splitLines(tones, false);
  const sentTonesOfLines = lines.map(line => splitSentences(line));
  const sentTones = sentTonesOfLines.flat();
  const wrapAt = sentTonesOfLines[0].length + 1; // Starting from 1
  return {
    name: name,
    tones: sentTones,
    wrapAt: wrapAt,
  }
}

export function getAllTunes(): Tune[] {
  return ALL_TUNES;
}

export function getTune(name: string): Tune | undefined {
  return ALL_TUNES.find(t => t.name === name);
}
