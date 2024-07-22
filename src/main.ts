import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from 'types';
import { PoemsSettingTab } from 'PoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';
import { viewCodeBlock } from 'poemUtil';
import { TuneCompositionHint } from 'TuneCompositionHint';

export default class CTPoemsPlugin extends Plugin {
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
    this.registerEditorSuggest(new TuneCompositionHint(this.app));

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new PoemsSettingTab(this.app, this));
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
