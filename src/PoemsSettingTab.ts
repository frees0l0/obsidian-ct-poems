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
      .setDesc('设置诗词格律校验使用的韵表')
      .addDropdown(component => component
        .addOption('std', '中华通韵')
        .addOption('new', '中华新韵')
        .setValue(this.plugin.settings.rhymesType || DEFAULT_SETTINGS.rhymesType)
        .onChange(async (value) => {
          this.plugin.settings.rhymesType = value;
          await this.plugin.saveSettings();
          switchRhymes(value);
        }));
  }
}
