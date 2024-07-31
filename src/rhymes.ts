class Rhymes {
    private rhymeGroupIndex;
    private looseRhymeMatches;

    constructor(rhymeGroups: [string, string[]][], looseRhymeMatches: string[][]) {
        this.rhymeGroupIndex = this.buildRhymeGroupIndex(rhymeGroups);
        this.looseRhymeMatches = looseRhymeMatches;
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

    getRhymeGroup(pinyinFinal: string): string {
        const group = this.rhymeGroupIndex[pinyinFinal];
        if (!group) {
            console.log(`Rhyme group not found: ${pinyinFinal}`);
        }
        return group || '-';
    }

    matchRhymeGroup(r1: string, r2: string, looseMatch: boolean): boolean {
        if (r1 === r2) {
            return true;
        }

        if (looseMatch && this.looseRhymeMatches.find(m => r1 in m && r2 in m)) {
            return true;
        }

        return false;
    }
}

/**
 * 中华新韵
 */
/* class ChineseNewRhymes extends Rhymes {
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
} */

/**
 * 中华通韵
 */
class ChineseStandardRhymes extends Rhymes {
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

const RHYMES = new ChineseStandardRhymes();

export function getRhymeGroup(pinyinFinal: string): string {
    return RHYMES.getRhymeGroup(pinyinFinal);
}

export function matchRhymeGroup(r1: string, r2: string, looseMatch: boolean): boolean {
    return RHYMES.matchRhymeGroup(r1, r2, looseMatch);
}