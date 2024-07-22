// Settings
export interface PluginSettings {
  showTonesInReading: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  showTonesInReading: false,
};

// Constants
export const POEM_CODE_TAG = 'poem';
export const POEM_KIND_TUNE = '词牌';
export const POEM_KIND_S4 = '绝句';
export const POEM_KIND_S8 = '律诗';

// Types
export type PoemKind = '词牌' | '绝句' | '律诗';

export type PoemHead = {
  kind: PoemKind;
  title: string; // 诗题或词牌名
  subtitle: string | null; // 词题
};

export type Tune = {
  name: string;
  tones: string;
};

export type ComposedTune = {
  composedTones: string;
} & Tune;
