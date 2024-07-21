export interface PluginSettings {
  showTonesInReading: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  showTonesInReading: false,
};

export type Tune = {
  name: string;
  tones: string;
};

export type ComposedTune = {
  composedTones: string;
} & Tune;
