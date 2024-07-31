import { pinyin } from "pinyin-pro";
import { PATTERN_WORD_WITH_PINYIN, PATTERN_ENDING_PUNC, PATTERN_PINYIN_TONE_NUM } from "regexps";
import { PatternType, PoemKind, RhymeType, Sentence, SentencePattern, Tone, ToneMatch } from "types";

export function makeSentences(sentences: string[]): Sentence[] {
    return sentences.map(s => {
        // Remove ending punctuation if present
        s = s.replace(PATTERN_ENDING_PUNC, '');
        // Extract words with pinyin annotations
        const annotatedWords = Array.from(s.matchAll(PATTERN_WORD_WITH_PINYIN), m => {
            return {
                word: m.groups?.word,
                pinyin: m.groups?.pinyin,
            };
        });
        // Get pinyin finals and overwrite the annotated ones
        const words = annotatedWords.map(w => w.word).join('');
        const finals = pinyin(words, { type: 'array', pattern: 'final', toneType: 'num', v: true, nonZh: 'consecutive', segmentit: 1 });
        annotatedWords.forEach((w, i) => {
            if (w.pinyin) {
                finals[i] = w.pinyin;
            }
        })
        // Build sentence
        const tones = finals.map(py => toneOfPinyin(py)).join('');
        const rhyme = finals.at(-1)?.replace(PATTERN_PINYIN_TONE_NUM, '') ?? '';
        // The sentence may be incomplete, so do not decide whether rhymed here
        return {
            words: words,
            tones: tones,
            rhyme: rhyme,
            rhymed: undefined,
            tonesMatched: undefined,
        }
    });
}

export function toneOfPinyin(pinyinOrNonZh: string): string {
    const toneNum = pinyinOrNonZh[pinyinOrNonZh.length - 1];
    return toneNum == '0' || toneNum == '1' || toneNum == '2' ? '平' : (toneNum == '3' || toneNum == '4' ? '仄' : '-');
}

/**
 * Only do matching without changing the composed sentence for now.
 */
export function matchSentenceTones(sentPattern: SentencePattern, composedSent: Sentence) {
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
  
export function matchTone(tone: string, composedTone: string): boolean {
    return tone == Tone.BOTH || tone == composedTone;
}

export function needRhyme(rhymeType: string) {
    return rhymeType == RhymeType.REQUIRED || rhymeType == RhymeType.NEW || rhymeType == RhymeType.RESUME;
}

/**
 * 绝句或律诗：首句起字和收字的平仄，词：首句最后一字的平仄。
 */
export function keyOfTones(tones: string, kind: PoemKind): string {
    return kind == PoemKind.CI ? tones[tones.length - 1] : tones[1] + tones[tones.length - 1];
}

/**
 * The calculation is based on the variation's position in the variants file.
 */
export function variationType(normalTones: string, variationIndex: number): PatternType {
    const normalFeet = normalTones.slice(-2);
    if (normalFeet === Tone.PING+Tone.ZE) {
        if (variationIndex === 0) {
            return PatternType.MINOR;
        }
        if (variationIndex === 1) {
            return PatternType.MAJOR;
        }
        if (variationIndex === 2) {
            return PatternType.BOTH;
        }
    } else if (normalFeet === Tone.ZE+Tone.PING) {
        if (variationIndex === 0) {
            return PatternType.VARIATION;
        }
        if (variationIndex === 1) {
            return PatternType.SINGLE;
        }
    }
    return PatternType.VARIATION;
  }
  
export function needCounterpartCompensation(patternType: PatternType): boolean {
    return patternType === PatternType.MAJOR || patternType === PatternType.BOTH;
}
