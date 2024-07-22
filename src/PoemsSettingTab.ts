import { App, PluginSettingTab, Setting } from 'obsidian';
import CTPoemsPlugin from 'main';

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
      .setName('Show tones in reading mode')
      .setDesc('Show tones for words of the poem in reading mode')
      .addToggle(component => component
        .setValue(this.plugin.settings.showTonesInReading)
        .onChange(async (value) => {
          this.plugin.settings.showTonesInReading = value;
          await this.plugin.saveSettings();
        }));
  }
}
