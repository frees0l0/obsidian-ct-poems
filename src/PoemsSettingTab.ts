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
      .setName('诗词韵典')
      .setDesc('诗词格律校验使用的韵典。选择平水韵时，词的韵典会使用词林正韵；选择中华通韵或新韵时，词的韵典会使用类似词林正韵的宽韵。')
      .addDropdown(component => component
        .addOption('通韵', '中华通韵')
        .addOption('新韵', '中华新韵')
        .addOption('平水韵', '平水韵')
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
  }
}
