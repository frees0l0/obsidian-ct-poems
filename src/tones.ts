import { pinyin } from "pinyin-pro";
import { PATTERN_WORD_WITH_PINYIN, PATTERN_ENDING_PUNC, PATTERN_PINYIN_TONE_NUM } from "regexps";
import { getRhymeGroup, matchRhymeGroup } from "rhymes";
import { RhymeType, Sentence, SentencePattern, Tone } from "types";

export function getTones(sentences: string[]): Sentence[] {
    return sentences.map(s => {
        // Remove ending punctuation if present
        s = s.replace(PATTERN_ENDING_PUNC, '');
        // Extract words with pinyin annotations
        const words = Array.from(s.matchAll(PATTERN_WORD_WITH_PINYIN), m => {
            return {
                word: m.groups?.word,
                pinyin: m.groups?.pinyin,
            };
        });
        // Get pinyin finals and overwrite those which are annotated
        s = words.map(w => w.word).join('');
        const finals = pinyin(s, { type: 'array', pattern: 'final', toneType: 'num', v: true, nonZh: 'consecutive', segmentit: 1 });
        words.forEach((w, i) => {
            if (w.pinyin) {
                finals[i] = w.pinyin;
            }
        })
        // Get tones and rhyme
        const tones = finals.map(py => toneOfPinyin(py)).join('');
        const rhyme = finals.at(-1)?.replace(PATTERN_PINYIN_TONE_NUM, '') ?? '';
        // The sentence may be incomplete, so do not decide whether rhymed here
        return {
            tones: tones,
            rhyme: rhyme,
            rhymed: undefined,
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
 * Matching result is stored in the given composed sentences.
 */
export function matchRhymes(sentPatterns: SentencePattern[], composedSents: Sentence[], looseRhymeMatch: boolean) {
    let curRhymeGroup = null;
    for (let i = 0; i < sentPatterns.length; i++) {
        const sent = sentPatterns[i];
        const composedSent = composedSents[i];
        // Break on unfinished sentence
        if (!composedSent || composedSent.tones.length < sent.tones.length) {
            break;
        }

        if (sent.rhymeType == RhymeType.START) {
            curRhymeGroup = getRhymeGroup(composedSent.rhyme);
            composedSent.rhymed = true;
        }
        else if (sent.rhymeType == RhymeType.CONTINUE) {
            const rhymeGroup = getRhymeGroup(composedSent.rhyme);
            composedSent.rhymed = curRhymeGroup != null && matchRhymeGroup(curRhymeGroup, rhymeGroup, true);
        }
    }
}