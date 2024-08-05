import { Tone } from "types";

abstract class Rhymes {
    private looseRhymeMatches;
    
    constructor(looseRhymeMatches: string[][]) {
        this.looseRhymeMatches = looseRhymeMatches;
    }
    
    abstract getRhymeGroup(finalAndToneNum: string, word: string | undefined): string;

    abstract getTone(finalAndToneNum: string, word: string | undefined): Tone;

    matchRhymeGroup(r1: string, r2: string, looseMatch: boolean): boolean {
        if (r1 === r2) {
            return true;
        }

        if (looseMatch && this.looseRhymeMatches.find(m => m.contains(r1) && m.contains(r2))) {
            return true;
        }

        return false;
    }
}

abstract class SimpleRhymes extends Rhymes {
    private rhymeGroupIndex;

    constructor(rhymeGroups: [string, string[]][], looseRhymeMatches: string[][]) {
        super(looseRhymeMatches);
        this.rhymeGroupIndex = this.buildRhymeGroupIndex(rhymeGroups);
    }

    private buildRhymeGroupIndex(rhymeGroups: [string, string[]][]): { [key: string]: string } {
        const index: { [key: string]: string } = {};
        for (const [group, pinyins] of rhymeGroups) {
            for (const pinyin of pinyins) {
                index[pinyin] = group;
            }
        }
        return index;
    }

    getRhymeGroup(finalAndToneNum: string, word: string | undefined): string {
        const final = finalAndToneNum.substring(0, finalAndToneNum.length - 1);
        const group = this.rhymeGroupIndex[final];
        if (!group) {
            console.log(`Rhyme group not found: ${finalAndToneNum}`);
        }
        return group || '-';
    }

    getTone(finalAndToneNum: string, word: string | undefined): Tone {
        const toneNum = finalAndToneNum.at(-1);
        return toneNum == '0' || toneNum == '1' || toneNum == '2' ? Tone.PING : (toneNum == '3' || toneNum == '4' || toneNum == '5' ? Tone.ZE : Tone.UNKNOWN);
    }
}

/**
 * 中华新韵
 */
class ChineseNewRhymes extends SimpleRhymes {
    constructor() {
        super(
            [
                ["一麻", ["a", "ia", "ua"]],
                ["二波", ["o", "e", "uo"]],
                ["三皆", ["ie", "ve"]],
                ["四开", ["ai", "uai"]],
                ["五微", ["ei", "ui", "uei"]],
                ["六豪", ["ao", "iao"]],
                ["七尤", ["ou", "iu", "iou"]],
                ["八寒", ["an", "ian", "uan", "van"]],
                ["九文", ["en", "in", "un", "vn", "uen"]],
                ["十唐", ["ang", "iang", "uang"]],
                ["十一庚", ["eng", "ing", "ong", "iong", "ueng"]],
                ["十二齐", ["i", "er", "v"]],
                ["十三支", ["-i"]],
                ["十四姑", ["u"]],
            ],
            [
                ["四开", "五微", "十二齐", "十三支"],
            ]
        );
    }
}

/**
 * 中华通韵
 */
class ChineseStandardRhymes extends SimpleRhymes {
    constructor() {
        super(
            [
                ["一啊", ["a", "ia", "ua"]],
                ["二喔", ["o", "uo"]],
                ["三鹅", ["e", "ie", "ue", "ve"]],
                ["四衣", ["i"]],
                ["五乌", ["u"]],
                ["六迂", ["v"]],
                ["七哀", ["ai", "uai"]],
                ["八诶", ["ei", "ui", "uei"]],
                ["九敖", ["ao", "iao"]],
                ["十欧", ["ou", "iu", "iou"]],
                ["十一安", ["an", "ian", "uan", "van"]],
                ["十二恩", ["en", "in", "un", "vn", "uen"]],
                ["十三昂", ["ang", "iang", "uang"]],
                ["十四英", ["ing", "eng", "ueng"]],
                ["十五雍", ["ong", "iong"]],
                ["十六儿", ["er"]],
            ],
            [
                ["四衣", "七哀", "八诶"],
                ["五乌", "六迂"],
                ["十四英", "十五雍"],
            ]
        );
    }
}

const NEW_RHYMES = new ChineseNewRhymes()
const STD_RHYMES = new ChineseStandardRhymes();
let current: Rhymes = STD_RHYMES;

export function getRhymeGroup(finalAndToneNum: string, word: string | undefined): string {
    return current.getRhymeGroup(finalAndToneNum, word);
}

export function getTone(finalAndToneNum: string, word: string | undefined): Tone {
    return current.getTone(finalAndToneNum, word);
}

export function matchRhymeGroup(r1: string, r2: string, looseMatch: boolean): boolean {
    return current.matchRhymeGroup(r1, r2, looseMatch);
}

export function switchRhymes(type: string) {
    current = type == 'new' ? NEW_RHYMES : STD_RHYMES;
}
