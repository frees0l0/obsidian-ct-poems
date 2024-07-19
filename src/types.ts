export interface PluginSettings {
  showTonesInReading: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  showTonesInReading: false,
};

export interface Tune {
  name: string;
  tones: string;
}
