import { pinyin } from "pinyin-pro";
import { PATTERN_WORD_WITH_PINYIN, PATTERN_SENTENCE_PUNC } from "regexps";
import { Tone } from "types";

export function getTones(sentences: string[]): string[] {
    return sentences.map(s => {
        // Remove trailing punctuation
        if (s[s.length - 1].match(PATTERN_SENTENCE_PUNC)) {
            s = s.substring(0, s.length - 1);
        }
        // Handle pinyin annotations: word+pinyin -> pinyin
        s = s.replace(PATTERN_WORD_WITH_PINYIN, '$<pinyin>');
        // Keep annotated pinyin
        const pinyins = pinyin(s, { type: 'array', toneType: 'num', v: true, nonZh: 'consecutive', segmentit: 1 });
        const tones = pinyins.map(py => toneOfPinyin(py));
        return tones.join('');
    });
}

export function toneOfPinyin(pinyinOrNonZh: string): string {
    const toneNum = pinyinOrNonZh[pinyinOrNonZh.length - 1];
    return toneNum == '1' || toneNum == '2' ? '平' : (toneNum == '3' || toneNum == '4' ? '仄' : pinyinOrNonZh);
}

export function matchTone(tone: string, composedTone: string): boolean {
    return tone == Tone.BOTH || tone == composedTone;
}