import { pinyin } from "pinyin-pro";
import { PATTERN_WORD_WITH_PINYIN, PATTERN_ENDING_PUNC, PATTERN_PINYIN_TONE_NUM, PATTERN_TONE_MATCHED } from "regexps";
import { getRhymeGroup, matchRhymeGroup } from "rhymes";
import { PoemKind, RhymeType, Sentence, SentencePattern, SentencesMatch, Tone, ToneMatch } from "types";

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
    return toneNum == '1' || toneNum == '2' ? '平' : (toneNum == '3' || toneNum == '4' ? '仄' : pinyinOrNonZh);
}

export function matchTone(tone: string, composedTone: string): boolean {
    return tone == Tone.BOTH || tone == composedTone;
}

export function needRhyme(rhymeType: string) {
    return rhymeType == RhymeType.START || rhymeType == RhymeType.CONTINUE;
}

/**
 * Return the modified copies of all the patterns and only the matched sentences.
 */
export function matchSentences(sentPatterns: SentencePattern[], composedSents: Sentence[], kind: PoemKind): SentencesMatch {
    const patternsResult = kind == PoemKind.CI ? sentPatterns : [...sentPatterns];
    const sentsResult: Sentence[] = [];
    const looseRhymeMatch = kind == PoemKind.CI;

    let curRhymeGroup = null;
    for (let i = 0; i < patternsResult.length; i++) {
        const sentPattern = patternsResult[i];
        let composedSent = composedSents[i];
        // Break on unfinished sentence
        if (!composedSent) {
            break;
        }
        
        // Shallow copy composed sentence for modification
        composedSent = Object.assign({}, composedSent);

        // Match sentence's rhyme only for complete sentence
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

        // Match sentence's tones
        const tonesMatched = matchSentenceTones(sentPattern, composedSent);
        composedSent.tonesMatched = tonesMatched.join('');

        // Add modified sentence to result
        sentsResult.push(composedSent);

        // Break on sentence with wrong length
        if ((i == composedSents.length - 1 && composedSent.tones.length > sentPattern.tones.length) ||
            (i < composedSents.length - 1 && composedSent.tones.length != sentPattern.tones.length)) {
            break;
        }
    }
    return {
        patterns: patternsResult,
        sentences: sentsResult,
    };
}

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
export function matchScore(sents: Sentence[]): number {
    return sents.reduce((score, sent) => {
        if (sent.tonesMatched) {
            const tonesMatched = sent.tonesMatched.match(PATTERN_TONE_MATCHED)?.length ?? 0;
            return tonesMatched && sent.rhymed == false ? score + tonesMatched - 1 : score + tonesMatched;
        } else {
            return score;
        }
    }, 0);
}