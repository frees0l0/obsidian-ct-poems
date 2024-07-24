// Settings
export interface PluginSettings {
  showTonesInReading: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  showTonesInReading: false,
};

// Constants
export const POEM_CODE_TAG = 'poem';

// Types
export enum PoemKind {
    TUNE = '词牌',
    S4 = '绝句',
    S8 = '律诗',
}

export enum Tone {
  PING = '平',
  ZE = '仄',
  BOTH = '中',
}

export type PoemHead = {
  kind: PoemKind; // 类型
  title: string; // 诗题或词牌名
  subtitle: string | null; // 词题
};

export type Tune = {
  /**
   * 词牌名
   */
  name: string;
  /**
   * 包含每个句子平仄的数组
   */
  tones: string[];
  /**
   * 在第几个句子换行（划分上下阕）
   */
  wrapAt: number;
};

export type ComposedTune = {
  /**
   * 包含每个句子填词平仄的数组
   */
  composedTones: string[];
} & Tune;
