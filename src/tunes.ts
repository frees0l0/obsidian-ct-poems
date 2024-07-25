import { PoemKind, Tune } from "types";
import { splitLines, splitSentences } from "poemUtil";

const CI_TUNES = [
  {
    name: "菩萨蛮",
    tones: "中平中仄平平仄，中平中仄平平仄。中仄仄平平，中平中仄平。\n中平平仄仄，中仄中平仄。中仄仄平平，中平中仄平。",
  }
]
.map(tune => {
  return buildTune(PoemKind.CI, tune.name, tune.tones);
});

function buildTune(kind: PoemKind, name: string, tones: string): Tune {
  const lines = splitLines(tones, false);
  const sentTonesOfLines = lines.map(line => splitSentences(line));
  const sentTones = sentTonesOfLines.flat();
  const sections = sentTonesOfLines.map(sentTonesOfline => sentTonesOfline.length);
  return {
    kind: kind,
    name: name,
    tones: sentTones,
    sections: sections,
  }
}

export function getAllTunes(): Tune[] {
  return CI_TUNES;
}

export function getTune(name: string): Tune | undefined {
  return CI_TUNES.find(t => t.name === name);
}
