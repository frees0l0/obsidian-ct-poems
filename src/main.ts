import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from 'types';
import { CiPoemsSettingTab } from 'CiPoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';
import { viewCodeBlock } from 'ciPoem';
import { ComposedTuneHint } from 'ComposedTuneHint';

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

    // Add ci-poem code block processor
    this.registerMarkdownCodeBlockProcessor('ci-poem', viewCodeBlock);

    // Add hint for the composed tune
    this.registerEditorSuggest(new ComposedTuneHint(this.app));

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
