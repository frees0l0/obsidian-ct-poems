import { TuneMatch, PoemKind, Sentence, Tune } from "types";
import { splitLines, extractSentencePatterns, splitSections } from "poemUtil";
import { PATTERN_COLON } from "regexps";
import { matchSentences, matchScore } from "tones";

const ALL_TUNES: Tune[] = [];

export function loadTunes(kind: PoemKind, content: string) {
  const lines = splitLines(content, false);
  for (const line of lines) {
    const parts = line.split(PATTERN_COLON);
    if (parts.length == 2) {
      const name = parts[0].trim();
      const tones = parts[1].trim();
      const tune = buildTune(kind, name, tones);

      ALL_TUNES.push(tune);
    }
  }
  console.info(`Loaded ${ALL_TUNES.length} ci tunes`)
}

export function getTunes(kind: PoemKind | undefined = undefined): Tune[] {
  return kind ? ALL_TUNES.filter(tune => tune.kind == kind) : ALL_TUNES;
}

export function matchTunes(kind: PoemKind, name: string | undefined, composedSents: Sentence[]): TuneMatch[] {
  const tunes = ALL_TUNES.filter(tune => tune.kind == kind && (!name || tune.name === name));
  return tunes.map(tune => {
    const sents = matchSentences(tune.sentences, composedSents, tune.kind == PoemKind.CI);
    const score = matchScore(sents);
    const tuneMatch: TuneMatch = Object.assign({}, tune, {composedSentences: sents, score: score});
    return tuneMatch;
  }).sort((a, b) => -(a.score - b.score));
}

function buildTune(kind: PoemKind, name: string, tones: string): Tune {
  const sections = splitSections(tones);
  const sentsOfSections = sections.map(line => extractSentencePatterns(line));
  const sents = sentsOfSections.flat();
  const lensOfSections = sentsOfSections.map(sentTonesOfline => sentTonesOfline.length);
  return {
    kind: kind,
    name: name,
    sentences: sents,
    sections: lensOfSections,
  }
}
