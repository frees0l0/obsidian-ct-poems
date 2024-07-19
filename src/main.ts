import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from 'types';
import { CiPoemsSettingTab } from 'CiPoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';

export default class CiPoemsPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();
    
    // Add command for inserting a new ci poem
    this.addCommand({
      id: 'insert-ci-poem',
      name: 'Insert Ci Poem',
      editorCallback: (editor, view) => {
        new TuneSearchModal(this.app, editor).open();
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
