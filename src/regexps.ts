// 格式："词牌：菩萨蛮" or "词牌：菩萨蛮·秋思"
export const PATTERN_POEM_HEAD = /^(?<kind>\p{L}+)[:：]\s*(?<title>\p{L}+(?:[.·]\p{L}+)?)?$/u;

export const PATTERN_WORD_WITH_PINYIN = /(?<word>[^a-z0-4])(?<pinyin>[a-z]+[0-4])?/gu;
export const PATTERN_PINYIN = /[a-z]+[0-4]/g;
export const PATTERN_PINYIN_TONE_NUM = /[0-4]$/;

export const PATTERN_DOT = /\.|·/;
export const PATTERN_COLON = /:|：/;
export const PATTERN_SECTION_SEP = /[\n|]/;

export const PATTERN_ENDING_PUNC = /[、，：。！？]$/;
export const PATTERN_ENDING_RHYME_PUNC = /(?<rhyme>[<>])?(?<punc>[、，：。！？])$/;

// Full or partial composed sentence with optional punctuation
export const PATTERN_SENTENCE = /[\p{L}0-4]+[、，：。！？]?/gu;
// Full sentence pattern with rhythm (optional) and punctuation
export const PATTERN_SENTENCE_PATTERN = /(?<words>[\p{L}0-4]+)(?<rhymeType>[<>^])?(?<punc>[、，：。！？])/gu;
// Sentence variants mapping
export const PATTERN_SENTENCE_VARIANTS = /^(?<normal>\p{L}+)>(?<variants>[\p{L}/]+)(?:-(?<counterpart>\p{L}+))?$/u;

export const PATTERN_TONE_MATCHED = /1/g;
