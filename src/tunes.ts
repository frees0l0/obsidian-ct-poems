import { PoemKind, RhymeType, Sentence, SentenceVariant, SentencePattern, SentencesMatch, TuneMatch, ToneMatch, Tune, TuneData, PoemHead } from "types";
import { extractSentencePatterns, extractSentenceVariants, splitSections } from "poemUtil";
import { PATTERN_TONE_MATCHED } from "regexps";
import { keyOfTones, matchSentenceTones } from "tones";
import { getRhymes } from "rhymes";
import { argmax } from "utils";

const ALL_TUNES = new Map<string, Tune[]>();
const SENTENCE_VARIANTS = new Map<string, SentenceVariant[]>();

export function loadTunes(kind: PoemKind, tuneDatas: TuneData[]): Tune[] {
  const tunes = tuneDatas.flatMap(data => {
    const name = kind == PoemKind.CI ? data.name : '';
    return data.patterns.map(pattern => buildTune(kind, name, pattern, data.desc))
  })
  ALL_TUNES.set(kind, tunes);
  console.info(`Loaded ${tunes.length} tunes of ${kind}`)
  return tunes;
}

export function loadVariants(lines: string[]) {
  for (const line of lines) {
    const { normal, variants } = extractSentenceVariants(line);
    if (normal && variants) {
      SENTENCE_VARIANTS.set(normal, variants);
      // console.info(`Loaded ${variants.length} variants for ${normal}`)
    }
  }
}

export function getTunes(kind: PoemKind): Tune[] {
  return ALL_TUNES.get(kind) || [];
}

export function getTune(kind: PoemKind, name: string | undefined): Tune | undefined {
  const tunes = ALL_TUNES.get(kind) || [];
  return name ? tunes.find(e => e.name == name) : tunes[0];
}

export function matchTunes(head: PoemHead, composedSents: Sentence[], composedParagraphs: number[], maxCount = 2): TuneMatch[] {
  const { kind, name, title } = head;
  let tunes = getTunes(kind);
  if (kind == PoemKind.CI) {
    tunes = tunes.filter(tune => tune.name == name);
  }

  const matches = tunes.map(tune => {
    const result = matchSentences(tune.sentencePatterns, composedSents, head);
    const score = computeScore(result.sentences);
    // Overwrite tune's props with matched result
    const tuneMatch: TuneMatch = Object.assign({}, tune, {
      title: title,
      sentencePatterns: result.patterns,
      composedSentences: result.sentences,
      composedParagraphs: composedParagraphs,
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
function matchSentences(sentPatterns: SentencePattern[], composedSents: Sentence[], head: PoemHead): SentencesMatch {
  const { kind, rhymes } = head;
  const hasVariants = kind == PoemKind.S4 || kind == PoemKind.S8;
  const resultPatterns = hasVariants ? [...sentPatterns] : sentPatterns;
  const resultSents: Sentence[] = [];
  const looseRhymeMatch = kind == PoemKind.CI;

  const rhymesDict = getRhymes(rhymes);
  const rhymeGroups: string[] = [];
  let successiveTones = null;
  for (let i = 0; i < resultPatterns.length; i++) {
    const sentPattern = resultPatterns[i];
    let composedSent = composedSents[i];
    // Break on unfinished sentence
    if (!composedSent) {
      break;
    }

    // Break on unmatched sentence's lengths: disabled as it will make such sentences not accessible in reading view
    // if ((i == composedSents.length - 1 && composedSent.tones.length > sentPattern.tones.length) ||
    //   (i < composedSents.length - 1 && composedSent.tones.length != sentPattern.tones.length)) {
    //   break;
    // }

    // Break on unmatched keys of tones only for first and complete sentence of four/eight-line poems
    if (hasVariants && i == 0 && composedSent.tones.length == sentPattern.tones.length &&
      keyOfTones(sentPattern.tones, kind) != keyOfTones(composedSent.tones, kind)) {
      break;
    }

    // Shallow copy composed sentence for modification
    composedSent = Object.assign({}, composedSent);

    // Match rhyme only for complete sentence
    let curRhymeGroup;
    if (composedSent.tones.length == sentPattern.tones.length) {
      const rhymeGroup = sentPattern.rhymeType != RhymeType.NONE ? rhymesDict.getRhymeGroup(composedSent.rhyme, composedSent.words.at(-1) ?? '') : '';
      if (sentPattern.rhymeType == RhymeType.NEW || (sentPattern.rhymeType == RhymeType.REQUIRED && rhymeGroups.length == 0)) {
        rhymeGroups.push(rhymeGroup);
        composedSent.rhymed = true;
      }
      else if (sentPattern.rhymeType == RhymeType.REQUIRED && (curRhymeGroup = rhymeGroups.at(-1))) {
        composedSent.rhymed = rhymesDict.matchRhymeGroup(curRhymeGroup, rhymeGroup, looseRhymeMatch);
      }
      else if (sentPattern.rhymeType == RhymeType.RESUME && (curRhymeGroup = rhymeGroups.at(-2))) {
        rhymeGroups.push(curRhymeGroup);
        composedSent.rhymed = rhymesDict.matchRhymeGroup(curRhymeGroup, rhymeGroup, looseRhymeMatch);
      }
    }

    // Match sentence's tones with all normal & variant patterns or counterpart
    let bestPattern, bestTonesMatched;
    if (successiveTones) {
      bestPattern = sentPattern;
      bestTonesMatched = matchSentenceTones(bestPattern, composedSent);
    }
    else {
      const vs = hasVariants ? (SENTENCE_VARIANTS.get(sentPattern.tones) ?? []) : [];
      // Copy needed attributes from normal pattern to variants
      const vPatterns = vs.map(v => Object.assign({}, sentPattern, { tones: v.tones, patternType: v.patternType, counterpart: v.counterpart }));
      const allPatterns = [sentPattern, ...vPatterns];

      const toneMatches = allPatterns.map(p => matchSentenceTones(p, composedSent))
      const bestIndex = argmax(toneMatches, ms => ms.reduce((v, m) => v + (m == ToneMatch.YES ? 1 : 0), 0));
      bestPattern = allPatterns[bestIndex];
      bestTonesMatched = toneMatches[bestIndex];
    }

    // Update matched pattern and counterpart (if specified) to result
    resultPatterns[i] = bestPattern;
    successiveTones = bestPattern.counterpart;
    if (successiveTones && i != resultPatterns.length - 1) {
      resultPatterns[i + 1] = Object.assign({}, resultPatterns[i + 1], { tones: successiveTones });
    }
    // console.info(`${composedSent.words}: ${sentPattern.tones}>${bestPattern.tones}` + (successiveTones ? `-${successiveTones}` : ''));
    // Add modified sentence to result
    composedSent.tonesMatched = bestTonesMatched?.join('');
    resultSents.push(composedSent);
  }
  return {
    patterns: resultPatterns,
    sentences: resultSents,
  };
}

/**
 * Calculate score based on already matched sentences.
 */
function computeScore(sents: Sentence[]): number {
  return sents.reduce((score, sent) => {
    if (sent.tonesMatched) {
      const tonesMatched = sent.tonesMatched.match(PATTERN_TONE_MATCHED)?.length ?? 0;
      return tonesMatched && sent.rhymed == false ? score + tonesMatched - 1 : score + tonesMatched;
    } else {
      return score;
    }
  }, 0);
}

function buildTune(kind: PoemKind, name: string, tones: string, desc?: string): Tune {
  const sections = splitSections(tones);
  const sentsOfSections = sections.map(line => extractSentencePatterns(line));
  const sents = sentsOfSections.flat();
  const lensOfSections = sentsOfSections.map(sentTonesOfline => sentTonesOfline.length);
  const displayKind = getDisplayKind(kind, sents);
  return {
    kind: kind,
    name: name,
    title: '',
    sentencePatterns: sents,
    sections: lensOfSections,
    displayKind: displayKind,
    desc: desc,
  }
}

function getDisplayKind(kind: PoemKind, sents: SentencePattern[]): string {
  if (kind == PoemKind.CI) {
    const wordCount = sents.reduce((count, s) => count += s.tones.length, 0);
    return wordCount <=58 ? '小令' : (wordCount <=90 ? '中调' : '长调');
  }
  return kind;
}
