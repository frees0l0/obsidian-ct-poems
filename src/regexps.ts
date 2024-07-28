// 格式："词牌：菩萨蛮" or "词牌：菩萨蛮·秋思"
export const PATTERN_POEM_HEAD = /^(?<kind>\p{L}+)[:：]\s*(?<title>\p{L}+(?:[.·]\p{L}+)?)?$/u;

export const PATTERN_WORD_WITH_PINYIN = /(?<word>[^a-z1-4])(?<pinyin>[a-z]+[1-4])?/gu;
export const PATTERN_PINYIN = /[a-z]+[1-4]/g;
export const PATTERN_PINYIN_TONE_NUM = /[1-4]$/;

export const PATTERN_DOT = /\.|·/;
export const PATTERN_COLON = /:|：/;
export const PATTERN_SECTION_SEP = /[\n|]/;

export const PATTERN_ENDING_PUNC = /[、，：。！？]$/;
export const PATTERN_ENDING_RHYME_PUNC = /(?<rhyme>[<>])?(?<punc>[、，：。！？])$/;

// Full or partial sentence with optional punctuation
export const PATTERN_SENTENCE = /[\p{L}1-4]+[、，：。！？]?/gu;
// Full sentence with rhythm (optional) and punctuation
export const PATTERN_SENTENCE_FULL = /(?<words>[\p{L}1-4]+)(?<rhymeType>[<>])?(?<punc>[、，：。！？])/gu;

export const PATTERN_TONE_MATCHED = /1/g;
