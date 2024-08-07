import { CI_RHYME_GROUPS } from "data/ciRhymes";
import { PINGSHUI_RHYMES } from "data/psRhymes";
import { RhymeGroupData, RhymeGroupKey, Tone } from "types";

export const RHYME_GROUP_UNKNOWN = '-';

abstract class Rhymes {
    looseRhymeGroups;
    
    constructor(looseRhymeGroups: [string, string[]][], errorOnAbsent: boolean) {
        this.looseRhymeGroups = new LooseRhymeGroups(looseRhymeGroups, errorOnAbsent);
    }

    static toneOfPinyin(finalAndToneNum: string) {
        const toneNum = finalAndToneNum.at(-1);
        return toneNum == '0' || toneNum == '1' || toneNum == '2' ? Tone.PING : (toneNum == '3' || toneNum == '4' || toneNum == '5' ? Tone.ZE : Tone.UNKNOWN);
    }
    
    abstract getRhymeGroup(finalAndToneNum: string, word: string, looseMatch: boolean): string;

    abstract getTone(finalAndToneNum: string, word: string): Tone;

    getLooseRhymeGroup(rhymeGroup: string): string | undefined {
        return this.looseRhymeGroups.getLooseRhymeGroup(rhymeGroup);
    }

    matchRhymeGroup(r1: string, r2: string): boolean {
        return r1 == r2;
    }
}

class LooseRhymeGroups {
    // Rhyme group name -> loose group name
    private groupIndex = new Map<string, string>();
    private errorOnAbsent;

    constructor(matches: [string, string[]][], errorOnAbsent: boolean) {
        for (const [lg, gs] of matches) {
            for (const g of gs) {
                this.groupIndex.set(g, lg);
            }
        }
        this.errorOnAbsent = errorOnAbsent;
    }

    /**
     * Return the loose rhyme group or undefined if not present.
     */
    getLooseRhymeGroup(rhymeGroup: string): string | undefined {
        const group = this.groupIndex.get(rhymeGroup);
        if (!group && this.errorOnAbsent) {
            console.error('Loose rhyme group not found', rhymeGroup);
        }
        return group;
    }
}

abstract class PinyinRhymes extends Rhymes {
    // Pinyin -> rhyme group
    private rhymeGroupIndex = new Map<string, string>();

    constructor(rhymeGroups: [string, string[]][], looseRhymeMatches: [string, string[]][]) {
        super(looseRhymeMatches, false);
        this.buildRhymeGroupIndex(rhymeGroups);
    }

    private buildRhymeGroupIndex(rhymeGroups: [string, string[]][]) {
        for (const [group, pinyins] of rhymeGroups) {
            for (const pinyin of pinyins) {
                this.rhymeGroupIndex.set(pinyin, group);
            }
        }
    }

    getRhymeGroup(finalAndToneNum: string, word: string, looseMatch: boolean): string {
        const final = finalAndToneNum.substring(0, finalAndToneNum.length - 1);
        const group = this.rhymeGroupIndex.get(final);
        if (!group) {
            console.warn(`Rhyme group not found: ${finalAndToneNum}`);
            return RHYME_GROUP_UNKNOWN;
        }
        // Loose group can be null here
        return looseMatch ? (this.getLooseRhymeGroup(group) ?? group) : group;
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
                ["第一部", ["四开", "五微", "十二齐", "十三支"]],
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
                ["第一部", ["四衣", "七哀", "八诶"]],
                ["第二部", ["五乌", "六迂"]],
                ["第三部", ["十四英", "十五雍"]],
            ]
        );
    }
}

/**
 * Pingshui & Cilin rhymes.
 */
class PSRhymes extends Rhymes {
    private rhymeGroupIndex = new Map<string, RhymeGroupKey[]>();
    private defaultRhymeGroups: LooseRhymeGroups;

    constructor(rhymes: RhymeGroupData[], ciRhymeGroups: [string, string[]][]) {
        super(ciRhymeGroups, true);
        this.buildRhymeGroupIndex(rhymes);
    }

    getRhymeGroup(finalAndToneNum: string, word: string, looseMatch: boolean): string {
        const matcher = looseMatch ? this.looseRhymeGroups : this.defaultRhymeGroups;
        const groups = this.rhymeGroupIndex.get(word);
        // Return multiple group names as a workaround for now
        if (groups) {
            return groups.map(k => matcher.getLooseRhymeGroup(k.name) ?? k.name).join('|');
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

    matchRhymeGroup(r1: string, r2: string): boolean {
        // Match multiple group names as a workaround for now
        const as = r1.split('|');
        const bs = r2.split('|');
        for (const a of as) {
            for (const b of bs) {
                if (a == b) {
                    return true;
                }
            }
        }
        return false;
    }

    normalizedTone(tone: string): Tone {
        return tone == '平声' ? Tone.PING : Tone.ZE;
    }

    buildRhymeGroupIndex(rhymes: RhymeGroupData[]) {
        const defaultRhymeMatches: [string, string[]][] = [];
        for (const rhyme of rhymes) {
            const { name, tone, words } = rhyme;
            const wordsList = words.split('|');
            // Handle rhyme group with two halves
            if (wordsList.length > 1) {
                const names = [name+'(上)', name+'(下)'];
                for (let i = 0; i < names.length; i++) {
                    this.indexWords(names[i], tone, wordsList[i]);
                }
                // Two halves match each other in pingshui, but not in cilin
                defaultRhymeMatches.push([name, names]);
            }
            else {
                this.indexWords(name, tone, wordsList[0]);
            }
        }
        this.defaultRhymeGroups = new LooseRhymeGroups(defaultRhymeMatches, false);
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
const PS_RHYMES = new PSRhymes(PINGSHUI_RHYMES, CI_RHYME_GROUPS);
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
