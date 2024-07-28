import { Plugin, normalizePath } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS, POEM_CODE_TAG, POEMS_FRONT_MATTER, PoemKind } from 'types';
import { PoemsSettingTab } from 'PoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';
import { renderPoem, insertPoemInEditor } from 'poemUtil';
import { PoemCompositionHint } from 'PoemCompositionHint';
import { verifyOrAddFrontMatter } from 'utils';
import { getTunes, loadTunes } from 'tunes';

export default class CTPoemsPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();
    await this.loadExtraData();
    
    // Add command for inserting a new poems
    this.addCommand({
      id: 'add-four-line-poem',
      name: 'Create Four-line Poem (绝句)',
      editorCallback: (editor, view) => {
        if (view.file) {
          verifyOrAddFrontMatter(this.app, view.file, POEMS_FRONT_MATTER, '');
        }
        const tune = getTunes(PoemKind.S4)[0];
        if (tune) {
          insertPoemInEditor({ kind: tune.kind, title: tune.name, subtitle: undefined }, editor);
        }
      }
    });

    this.addCommand({
      id: 'add-eight-line-poem',
      name: 'Create Eight-line Poem (律诗)',
      editorCallback: (editor, view) => {
        if (view.file) {
          verifyOrAddFrontMatter(this.app, view.file, POEMS_FRONT_MATTER, '');
        }
        const tune = getTunes(PoemKind.S8)[0];
        if (tune) {
          insertPoemInEditor({ kind: tune.kind, title: tune.name, subtitle: undefined }, editor);
        }
      }
    });
    
    this.addCommand({
      id: 'add-ci-poem',
      name: 'Create Ci Poem (词牌)',
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
    const configs = [
      [PoemKind.S4, 's4Patterns.txt'],
      [PoemKind.S8, 's8Patterns.txt'],
      [PoemKind.CI, 'ciPatterns.txt'],
    ];

    for (const config of configs) {
      try {
        const ciFile = normalizePath(`${this.manifest.dir}/${config[1]}`);
        const ciContent = await this.app.vault.adapter.read(ciFile);
        loadTunes(config[0] as PoemKind, ciContent);
      } catch (error) {
        console.error(`Failed to load tunes of ${config[0]}`, error);
      }
    }
  }
}
