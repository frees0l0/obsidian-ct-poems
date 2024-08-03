// Settings
export interface PluginSettings {
  rhymesType: string
  showDescInEditing: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  // showTonesInReading: false,
  rhymesType: 'std',
  showDescInEditing: true,
};

// Constants
export const POEM_CODE_TAG = 'poem';
export const POEMS_FRONT_MATTER = 'poems'

// Types
export enum PoemKind {
    CI = '词牌',
    S4 = '绝句',
    S8 = '律诗',
}

export enum Tone {
  PING = '平',
  ZE = '仄',
  BOTH = '中',
}

export enum ToneMatch {
  YES = '1',
  NO = '0',
}

export enum RhymeType {
  /**
   * 押韵
   */
  REQUIRED = '>',
  /**
   * 换韵
   */
  NEW = '<',
  /**
   * 错叶韵
   */
  RESUME = '^',
  /**
   * 不押韵
   */
  NONE = '',
}

export enum PatternType {
  NORMAL = "正格",
  VARIATION = "变格",
  SINGLE = "孤平",
  MINOR = "小拗",
  MAJOR = "大拗",
  BOTH = "大小拗",
}

export type PoemHead = {
  /**
   * 类型
   */
  kind: PoemKind;
  /**
   * 词牌名或空
   */
  name: string;
  /**
   * 标题
   */
  title: string;
}

export type SentencePattern = {
  tones: string;
  rhymeType: string;
  punctuation: string;
  patternType: PatternType;
  counterpart: string | undefined;
}

export type SentenceVariant = {
  tones: string;
  counterpart: string;
  patternType: PatternType;
}

export type Sentence = {
  words: string;
  tones: string;
  rhyme: string;
  punctuation: string;
  rhymed: boolean | undefined;
  tonesMatched: string | undefined;
}

export type SentencesMatch = {
  patterns: SentencePattern[];
  sentences: Sentence[];
}

export type Tune = {
  /**
   * 类型
   */
  kind: PoemKind;
  /**
   * 词牌名或空
   */
  name: string;
  /**
   * 包含每个句子平仄的数组
   */
  sentencePatterns: SentencePattern[];
  /**
   * 包含各段句子数量的数组
   */
  sections: number[];
  /**
   * 描述
   */
  desc: string | undefined;
}

export type TuneMatch = {
  /**
   * 包含每个句子填词平仄的数组
   */
  composedSentences: Sentence[];
  /**
   * 匹配字数
   */
  score: number;
} & Tune;

export interface TuneData {
  name: string;
  patterns: string[];
  desc: string | undefined
}