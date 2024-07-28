import { PoemKind, Sentence, Tune, TuneMatch, SentenceVariant, RhymeType, SentencePattern, SentencesMatch, ToneMatch } from "types";
import { splitLines, extractSentencePatterns, splitSections } from "poemUtil";
import { PATTERN_COLON, PATTERN_TONE_MATCHED } from "regexps";
import { extractSentenceVariants, keyOfTones, matchTone } from "tones";
import { getRhymeGroup, matchRhymeGroup } from "rhymes";

const ALL_TUNES = new Map<string, Tune[]>();
const SENTENCE_VARIANTS = new Map<string, SentenceVariant[]>();

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

export function loadVariants(content: string) {
  const lines = splitLines(content, false);
  for (const line of lines) {
    // Ignore comments
    if (line.startsWith('#')) {
      continue;
    }

    const { normal, variants } = extractSentenceVariants(line);
    if (normal && variants) {
      SENTENCE_VARIANTS.set(normal, variants);
      console.info(`Loaded ${variants.length} variants for ${normal}`)
    }
  }
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

/**
 * Return the modified copies of all the patterns and only the matched sentences.
 */
function matchSentences(sentPatterns: SentencePattern[], composedSents: Sentence[], kind: PoemKind): SentencesMatch {
  const hasVariants = kind == PoemKind.S4 || kind == PoemKind.S8;
  const resultPatterns = hasVariants ? [...sentPatterns] : sentPatterns;
  const resultSents: Sentence[] = [];
  const looseRhymeMatch = kind == PoemKind.CI;

  let curRhymeGroup = null;
  for (let i = 0; i < resultPatterns.length; i++) {
      const sentPattern = resultPatterns[i];
      let composedSent = composedSents[i];
      // Break on unfinished sentence
      if (!composedSent) {
          break;
      }
      
      // Shallow copy composed sentence for modification
      composedSent = Object.assign({}, composedSent);
      
      // Match rhyme only for complete sentence
      if (composedSent.tones.length == sentPattern.tones.length) {
          if (sentPattern.rhymeType == RhymeType.START) {
              curRhymeGroup = getRhymeGroup(composedSent.rhyme);
              composedSent.rhymed = true;
          }
          else if (sentPattern.rhymeType == RhymeType.CONTINUE) {
              const rhymeGroup = getRhymeGroup(composedSent.rhyme);
              composedSent.rhymed = curRhymeGroup != null && matchRhymeGroup(curRhymeGroup, rhymeGroup, looseRhymeMatch);
          }
      }

      // Match sentence's tones with all normal & variant patterns
      const vs = hasVariants ? (SENTENCE_VARIANTS.get(sentPattern.tones) ?? []) : [];
      const vPatterns = vs.map(v => Object.assign({}, sentPattern, {tones: v.tones, patternType: v.patternType}));
      const allPatterns = [sentPattern, ...vPatterns];

      let bestIndex = -1, bestScore = 0, bestTonesMatched = null;
      for (let i = 0; i < allPatterns.length; i++) {
        const tonesMatched = matchSentenceTones(allPatterns[i], composedSent);
        const score = tonesMatched.reduce((value, m) => value + (m == ToneMatch.YES ? 1 : 0), 0);
        if (bestIndex == -1 || score > bestScore) {
          bestIndex = i;
          bestScore = score;
          bestTonesMatched = tonesMatched;
        }
      }
      // Update best pattern to result
      if (bestIndex != 0) {
        const bestPattern = allPatterns[bestIndex];
        resultPatterns[i] = bestPattern;
        console.info(`${composedSent.words}: ${sentPattern.tones} > ${bestPattern.tones}`)
      }
      // Add modified sentence to result
      composedSent.tonesMatched = bestTonesMatched?.join('');
      resultSents.push(composedSent);

      // Break on unmatched sentence's lengths
      if ((i == composedSents.length - 1 && composedSent.tones.length > sentPattern.tones.length) ||
          (i < composedSents.length - 1 && composedSent.tones.length != sentPattern.tones.length)) {
        break;
      }

      // Break on unmatched key of tones only for first and complete sentence
      if (i == 0 && composedSent.tones.length == sentPattern.tones.length &&
          keyOfTones(sentPattern.tones, kind) != keyOfTones(composedSent.tones, kind)) {
        break;
      }
  }
  return {
      patterns: resultPatterns,
      sentences: resultSents,
  };
}

/**
 * Only do matching without changing the composed sentence for now.
 */
function matchSentenceTones(sentPattern: SentencePattern, composedSent: Sentence) {
  const tonesMatched = [];
  for (let i = 0; i < sentPattern.tones.length; i++) {
      const tone = sentPattern.tones[i];
      const composedTone = composedSent.tones[i];
      // Break on unfinished sentence
      if (!composedTone) {
          break;
      }

      const toneOk = matchTone(tone, composedTone);
      tonesMatched.push(toneOk ? ToneMatch.YES : ToneMatch.NO);
  }
  return tonesMatched;
}

/**
 * Calculate score based on already matched sentences.
 */
function matchScore(sents: Sentence[]): number {
  return sents.reduce((score, sent) => {
      if (sent.tonesMatched) {
          const tonesMatched = sent.tonesMatched.match(PATTERN_TONE_MATCHED)?.length ?? 0;
          return tonesMatched && sent.rhymed == false ? score + tonesMatched - 1 : score + tonesMatched;
      } else {
          return score;
      }
  }, 0);
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
