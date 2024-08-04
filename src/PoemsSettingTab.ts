import { App, PluginSettingTab, Setting } from 'obsidian';
import CTPoemsPlugin from 'main';
import { DEFAULT_SETTINGS } from 'types';
import { switchRhymes } from 'rhymes';

export class PoemsSettingTab extends PluginSettingTab {
  plugin: CTPoemsPlugin;

  constructor(app: App, plugin: CTPoemsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('诗词韵表')
      .setDesc('诗词格律校验使用的韵表。')
      .addDropdown(component => component
        .addOption('std', '中华通韵')
        .addOption('new', '中华新韵')
        .setValue(this.plugin.settings.rhymesType || DEFAULT_SETTINGS.rhymesType)
        .onChange(async (value) => {
          this.plugin.settings.rhymesType = value;
          await this.plugin.saveSettings();
          switchRhymes(value);
        }));
    
    new Setting(containerEl)
      .setName('编辑时显示诗体或词牌描述')
      .setDesc('是否在编辑时弹出的提示对话框里显示诗体或词牌描述。')
      .addToggle(component => component
        .setValue(this.plugin.settings.showDescInEditing ?? DEFAULT_SETTINGS.showDescInEditing)
        .onChange(async (value) => {
          this.plugin.settings.showDescInEditing = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('阅读视图显示格律')
      .setDesc('是否在阅读视图显示格律（平仄和押韵）。需要重新打开文件以生效。')
      .addToggle(component => component
        .setValue(this.plugin.settings.showTuneInReading ?? DEFAULT_SETTINGS.showTuneInReading)
        .onChange(async (value) => {
          this.plugin.settings.showTuneInReading = value;
          await this.plugin.saveSettings();
        }));
  }
}
