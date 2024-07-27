import { Plugin, normalizePath } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS, POEM_CODE_TAG, POEMS_FRONT_MATTER, PoemKind } from 'types';
import { PoemsSettingTab } from 'PoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';
import { renderPoem } from 'poemUtil';
import { PoemCompositionHint } from 'PoemCompositionHint';
import { verifyOrAddFrontMatter } from 'utils';
import { loadTunes } from 'tunes';

export default class CTPoemsPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();
    await this.loadExtraData();
    
    // Add command for inserting a new ci poem
    this.addCommand({
      id: 'insert-ci-poem',
      name: 'Insert Ci Poem',
      editorCallback: (editor, view) => {
        if (view.file) {
          verifyOrAddFrontMatter(this.app, view.file, POEMS_FRONT_MATTER, '');
        }
        new TuneSearchModal(this.app, editor).open();
      }
    });

    // Add ci-poem code block processor
    this.registerMarkdownCodeBlockProcessor(POEM_CODE_TAG, renderPoem);

    // Add hint for the composed tune
    this.registerEditorSuggest(new PoemCompositionHint(this.app));

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

  onExternalSettingsChange() {
    this.loadSettings();
  }

  async loadExtraData() {
    // Load tunes for ci poems
    const file = normalizePath(`${this.manifest.dir}/ciPatterns.txt`);
    const content = await this.app.vault.adapter.read(file);
    loadTunes(PoemKind.CI, content);
  }
}
