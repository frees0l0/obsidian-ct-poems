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

// Types
export type PoemHead = {
  kind: string;
  title: string;
  subtitle: string | null;
};

export type Tune = {
  name: string;
  tones: string;
};

export type ComposedTune = {
  composedTones: string;
} & Tune;
