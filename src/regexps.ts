// 格式："词牌：菩萨蛮" or "词牌：菩萨蛮·秋思"
export const PATTERN_POEM_HEAD = /^(?<kind>\p{L}+)[:：]\s*(?<title>\p{L}+(?:[.·]\p{L}+)?)$/u;

export const PATTERN_WORD_WITH_PINYIN = /\p{L}(?<pinyin>[a-z]+[1-4])/gu;
export const PATTERN_PINYIN = /[a-z]+[1-4]/g;

export const PATTERN_DOT = /\.|·/;

export const PATTERN_ENDING_PUNC = /[、，：。！？]$/;
export const PATTERN_ENDING_RHYTHM_PUNC = /(?<rhythm>[<>])?(?<punc>[、，：。！？])$/;

// Full or partial sentence with optional punctuation
export const PATTERN_SENTENCE = /[\p{L}1-4]+[、，：。！？]?/gu;
// Full sentence with rhythm (optional) and punctuation
export const PATTERN_SENTENCE_FULL = /[\p{L}1-4]+[<>]?[、，：。！？]/gu;
