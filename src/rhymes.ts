import { PINGSHUI_RHYMES } from "data/psRhymes";
import { RhymeGroup, RhymeGroupKey, Tone } from "types";

export const RHYME_GROUP_UNKNOWN = '-';

abstract class Rhymes {
    looseRhymeMatcher;
    
    constructor(looseRhymeMatches: string[][]) {
        this.looseRhymeMatcher = new RhymeGroupMatcher(looseRhymeMatches);
    }

    static toneOfPinyin(finalAndToneNum: string) {
        const toneNum = finalAndToneNum.at(-1);
        return toneNum == '0' || toneNum == '1' || toneNum == '2' ? Tone.PING : (toneNum == '3' || toneNum == '4' || toneNum == '5' ? Tone.ZE : Tone.UNKNOWN);
    }
    
    abstract getRhymeGroup(finalAndToneNum: string, word: string): string;

    abstract getTone(finalAndToneNum: string, word: string): Tone;

    matchRhymeGroup(r1: string, r2: string, looseMatch: boolean): boolean {
        if (r1 === r2) {
            return true;
        }
        return looseMatch ? this.looseRhymeMatcher.matchRhymeGroup(r1, r2) : false;
    }
}

class RhymeGroupMatcher {
    // Rhyme group name -> category no.
    private categoryIndex = new Map<string, number>();

    constructor(matches: string[][]) {
        for (let i = 0; i < matches.length; i++) {
            matches[i].forEach(name => this.categoryIndex.set(name, i+1));
        }
    }

    matchRhymeGroup(r1: string, r2: string): boolean {
        const c1 = this.categoryIndex.get(r1);
        const c2 = this.categoryIndex.get(r2);
        return c1 && c2 ? c1 == c2 : false;
    }
}

abstract class PinyinRhymes extends Rhymes {
    // Pinyin -> rhyme group
    private rhymeGroupIndex = new Map<string, string>();

    constructor(rhymeGroups: [string, string[]][], looseRhymeMatches: string[][]) {
        super(looseRhymeMatches);
        this.buildRhymeGroupIndex(rhymeGroups);
    }

    private buildRhymeGroupIndex(rhymeGroups: [string, string[]][]) {
        for (const [group, pinyins] of rhymeGroups) {
            for (const pinyin of pinyins) {
                this.rhymeGroupIndex.set(pinyin, group);
            }
        }
    }

    getRhymeGroup(finalAndToneNum: string, word: string): string {
        const final = finalAndToneNum.substring(0, finalAndToneNum.length - 1);
        const group = this.rhymeGroupIndex.get(final);
        if (!group) {
            console.log(`Rhyme group not found: ${finalAndToneNum}`);
        }
        return group || RHYME_GROUP_UNKNOWN;
    }

    getTone(finalAndToneNum: string, word: string): Tone {
        return Rhymes.toneOfPinyin(finalAndToneNum);
    }
}

/**
 * 中华新韵
 */
class ChineseNewRhymes extends PinyinRhymes {
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
class ChineseStandardRhymes extends PinyinRhymes {
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

/**
 * Pingshui & Cilin rhymes.
 */
class PSRhymes extends Rhymes {
    private static CI_RHYME_MATCHES = [
        []
    ];

    private rhymeGroupIndex = new Map<string, RhymeGroupKey[]>();
    private defaultRhymeMatcher: RhymeGroupMatcher;

    constructor(rhymes: RhymeGroup[]) {
        super(PSRhymes.CI_RHYME_MATCHES);
        this.buildRhymeGroupIndex(rhymes);
    }

    getRhymeGroup(finalAndToneNum: string, word: string): string {
        const groups = this.rhymeGroupIndex.get(word);
        // Return multiple group names as a workaround for now
        if (groups) {
            return groups.map(g => g.name).join('|');
        }
        return RHYME_GROUP_UNKNOWN;
    }

    getTone(finalAndToneNum: string, word: string): Tone {
        const groups = this.rhymeGroupIndex.get(word);
        // Use pingshui if not a polyphone, otherwise fall back to pinyin 
        if (groups && groups.length == 1) {
            return this.normalizedTone(groups[0].tone);
        }
        return Rhymes.toneOfPinyin(finalAndToneNum);
    }

    matchRhymeGroup(r1: string, r2: string, looseMatch: boolean): boolean {
        const matcher = looseMatch ? this.looseRhymeMatcher : this.defaultRhymeMatcher;
        // Match multiple group names as a workaround for now
        const as = r1.split('|');
        const bs = r2.split('|');
        for (const a of as) {
            for (const b of bs) {
                if (a == b || matcher.matchRhymeGroup(a, b)) {
                    return true;
                }
            }
        }
        return false;
    }

    normalizedTone(tone: string): Tone {
        return tone == '平声' ? Tone.PING : Tone.ZE;
    }

    buildRhymeGroupIndex(rhymes: RhymeGroup[]) {
        const defaultRhymeMatches = [];
        for (const rhyme of rhymes) {
            const { name, tone, words } = rhyme;
            const wordsList = words.split('|');
            // Handle rhyme group with two halves
            if (wordsList.length > 1) {
                const names = [name+'-上', name+'-下'];
                for (let i = 0; i < names.length; i++) {
                    this.indexWords(names[i], tone, wordsList[i]);
                }
                // Two halves match each other in pingshui, but not in cilin
                defaultRhymeMatches.push(names);
            }
            else {
                this.indexWords(name, tone, wordsList[0]);
            }
        }
        this.defaultRhymeMatcher = new RhymeGroupMatcher(defaultRhymeMatches);
    }

    indexWords(name: string, tone: string, words: string) {
        const group = { name, tone };
        for (const word of words) {
            const groups = this.rhymeGroupIndex.get(word);
            if (groups) {
                groups.push(group);
            }
            else {
                this.rhymeGroupIndex.set(word, [group]);
            }
        }
    }
}

// Globals
const NEW_RHYMES = new ChineseNewRhymes()
const STD_RHYMES = new ChineseStandardRhymes();
const PS_RHYMES = new PSRhymes(PINGSHUI_RHYMES);
let current_rhymes: Rhymes = STD_RHYMES;

export function switchRhymes(type: string) {
    current_rhymes = _getRhymes(type);
}

export function getRhymes(type?: string): Rhymes {
    return type ? _getRhymes(type) : current_rhymes;
}

function _getRhymes(type: string): Rhymes {
    switch(type) {
        case '新韵':
            return NEW_RHYMES;
        case '通韵':
            return STD_RHYMES;
        case '平水韵':
            return PS_RHYMES;
        default:
            return STD_RHYMES;
    }
}
