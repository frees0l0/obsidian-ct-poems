import { PoemKind, Tune } from "types";
import { splitLines, matchSentences } from "poemUtil";
import { PATTERN_ENDING_RHYTHM_PUNC } from "regexps";

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
  const fullSentsOfLines = lines.map(line => matchSentences(line, true));
  const fullSents = fullSentsOfLines.flat();
  const sentsWithPuncs = fullSents.map(sent => sent.replace(PATTERN_ENDING_RHYTHM_PUNC, '$<punc>'));
  const rhythms = fullSents.map(sent => sent.match(PATTERN_ENDING_RHYTHM_PUNC)?.groups?.rhythm ?? '');
  const sections = fullSentsOfLines.map(sentTonesOfline => sentTonesOfline.length);
  return {
    kind: kind,
    name: name,
    tones: sentsWithPuncs,
    rhythms: rhythms,
    sections: sections,
  }
}

export function getAllTunes(): Tune[] {
  return CI_TUNES;
}

export function getTune(name: string): Tune | undefined {
  return CI_TUNES.find(t => t.name === name);
}
