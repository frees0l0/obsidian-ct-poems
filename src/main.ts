import { MarkdownView, Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from 'types';
import { CiPoemsSettingTab } from 'CiPoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';

export const ALL_TUNES = [
  {
    name: "菩萨蛮",
    tones: "中平中仄平平仄，中平中仄平平仄。中仄仄平平，中平中仄平。\n\n中平平仄仄，中仄中平仄。中仄仄平平，中平中仄平。",
  }
];

export default class CiPoemsPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();
    
    // Add command for inserting a new ci poem
    this.addCommand({
      id: 'insert-ci-poem',
      name: 'Insert Ci Poem',
      checkCallback: (checking: boolean) => {
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          if (!checking) {
            new TuneSearchModal(this.app).open();
          }

          return true;
        }
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new CiPoemsSettingTab(this.app, this));
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
