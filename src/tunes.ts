import { TuneMatch, PoemKind, Sentence, Tune } from "types";
import { splitLines, extractSentencePatterns, splitSections } from "poemUtil";
import { PATTERN_COLON } from "regexps";
import { matchSentences, matchScore } from "tones";

const ALL_TUNES = new Map<string, Tune[]>();

export function loadTunes(kind: PoemKind, content: string): Tune[] {
  const lines = splitLines(content, false);
  const tunes = [];
  for (const line of lines) {
    // Ignore comments
    if (line.startsWith('#')) {
      continue;
    }

    const parts = line.split(PATTERN_COLON);
    if (parts.length == 2) {
      const key = parts[0].trim();
      const tones = parts[1].trim();
      if (kind == PoemKind.CI || key == kind) {
        const name = kind == PoemKind.CI ? key : '';
        const tune = buildTune(kind, name, tones);
        tunes.push(tune);
      }
    }
  }
  ALL_TUNES.set(kind, tunes);
  console.info(`Loaded ${tunes.length} tunes of ${kind}`)
  return tunes;
}

export function getTunes(kind: PoemKind): Tune[] {
  return ALL_TUNES.get(kind) || [];
}

export function matchTunes(kind: PoemKind, name: string | undefined, composedSents: Sentence[], maxCount = 2): TuneMatch[] {
  let tunes = getTunes(kind);
  if (kind == PoemKind.CI) {
    tunes = tunes.filter(tune => tune.name == name);
  }

  const matches = tunes.map(tune => {
    const result = matchSentences(tune.sentencePatterns, composedSents, tune.kind);
    const score = matchScore(result.sentences);
    // Overwrite tune's props with matched result
    const tuneMatch: TuneMatch = Object.assign({}, tune, {
      sentencePatterns: result.patterns,
      composedSentences: result.sentences,
      score: score,
    });
    return tuneMatch;
  });

  const maxScore = Math.max(...matches.map(m => m.score));
  return matches.filter(m => m.score == maxScore).slice(0, maxCount);
}

function buildTune(kind: PoemKind, name: string, tones: string): Tune {
  const sections = splitSections(tones);
  const sentsOfSections = sections.map(line => extractSentencePatterns(line));
  const sents = sentsOfSections.flat();
  const lensOfSections = sentsOfSections.map(sentTonesOfline => sentTonesOfline.length);
  return {
    kind: kind,
    name: name,
    sentencePatterns: sents,
    sections: lensOfSections,
  }
}
