import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS, POEM_CODE_TAG, POEMS_FRONT_MATTER, PoemKind, TuneData } from 'types';
import { PoemsSettingTab } from 'PoemsSettingTab';
import { TuneSearchModal } from 'TuneSearchModal';
import { insertPoemInEditor } from 'poemUtil';
import { PoemCompositionHint } from 'PoemCompositionHint';
import { verifyOrAddFrontMatter } from 'utils';
import { getTunes, loadTunes, loadVariants } from 'tunes';
import { switchRhymes } from 'rhymes';
import { S4_PATTERNS, S8_PATTERNS, VARIANTS_PATTERNS } from 'poemPatterns';
import { CI_PATTERNS } from 'ciPatterns';
import { renderPoem } from 'renderer';

export default class CTPoemsPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();
    await this.loadExtraData();

    // Initialize with settings
    switchRhymes(this.settings.rhymesType);
    
    // Add command for inserting a new poems
    this.addCommand({
      id: 'add-four-line-poem',
      name: 'Create four-line poem (创作绝句)',
      editorCallback: (editor, view) => {
        if (view.file) {
          verifyOrAddFrontMatter(this.app, view.file, POEMS_FRONT_MATTER, '');
        }
        const tune = getTunes(PoemKind.S4)[0];
        if (tune) {
          insertPoemInEditor({ kind: tune.kind, name: tune.name, title: '' }, editor);
        }
      }
    });

    this.addCommand({
      id: 'add-eight-line-poem',
      name: 'Create eight-line poem (创作律诗)',
      editorCallback: (editor, view) => {
        if (view.file) {
          verifyOrAddFrontMatter(this.app, view.file, POEMS_FRONT_MATTER, '');
        }
        const tune = getTunes(PoemKind.S8)[0];
        if (tune) {
          insertPoemInEditor({ kind: tune.kind, name: tune.name, title: '' }, editor);
        }
      }
    });
    
    this.addCommand({
      id: 'add-ci-poem',
      name: 'Create ci poem (填写词牌)',
      editorCallback: (editor, view) => {
        if (view.file) {
          verifyOrAddFrontMatter(this.app, view.file, POEMS_FRONT_MATTER, '');
        }
        new TuneSearchModal(this.app, editor).open();
      }
    });

    // Add ci-poem code block processor
    this.registerMarkdownCodeBlockProcessor(POEM_CODE_TAG, (souce, el, ctx) => {
      renderPoem(souce, el, true);
    });

    // Add hint for the composed tune
    this.registerEditorSuggest(new PoemCompositionHint(this.app, this.settings));

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
      [PoemKind.S4, S4_PATTERNS],
      [PoemKind.S8, S8_PATTERNS],
      [PoemKind.CI, CI_PATTERNS],
    ];

    for (const config of configs) {
      try {
        const kind = config[0] as PoemKind;
        const tuneDatas = config[1] as TuneData[];
        loadTunes(kind, tuneDatas);
      } catch (error) {
        console.error(`Failed to load tunes of ${config[0]}`, error);
      }
    }

    try {
      loadVariants(VARIANTS_PATTERNS);
    } catch (error) {
      console.error(`Failed to load variants`, error);
    }
  }
}
