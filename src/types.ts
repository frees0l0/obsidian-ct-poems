// Settings
export interface PluginSettings {
  showTonesInReading: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  showTonesInReading: false,
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
  START = '<',
  CONTINUE = '>',
  NONE = '',
}

export type PoemHead = {
  kind: PoemKind; // 类型
  title: string; // 诗题或词牌名
  subtitle: string | null; // 词题
};

export type SentencePattern = {
  tones: string;
  rhymeType: string;
  punctuation: string;
}

export type Sentence = {
  words: string;
  tones: string;
  rhyme: string;
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
   * 诗题或词牌名
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
};

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
