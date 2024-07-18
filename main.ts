import { App, Editor, MarkdownView, FuzzySuggestModal, FuzzyMatch, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
  showTonesInReading: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
  showTonesInReading: false,
}

interface Tune {
  name: string;
  tones: string;
}

const ALL_TUNES = [
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

    // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
    // 	console.log('click', evt);
    // });

    // this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class TuneSearchModal extends FuzzySuggestModal<Tune> {
  getItems(): Tune[] {
    return ALL_TUNES;
  }
  
  getItemText(tune: Tune): string {
    return tune.name;
  }
  
  renderSuggestion(tune: FuzzyMatch<Tune>, el: HTMLElement) {
    el.createEl("div", { text: tune.item.name });
    el.createEl("small", { text: tune.item.tones.substring(0, 20) + '......' });
  }

  onChooseItem(tune: Tune, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${tune.name}`);
  }
}


class CiPoemsSettingTab extends PluginSettingTab {
  plugin: CiPoemsPlugin;

  constructor(app: App, plugin: CiPoemsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Show tones in reading mode')
      .setDesc('Show tones for words of the ci poem in reading mode')
      .addToggle(component => component
        .setValue(this.plugin.settings.showTonesInReading)
        .onChange(async (value) => {
          this.plugin.settings.showTonesInReading = value;
          await this.plugin.saveSettings();
        }));
  }
}
