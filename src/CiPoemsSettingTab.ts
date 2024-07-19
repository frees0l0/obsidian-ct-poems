import { App, PluginSettingTab, Setting } from 'obsidian';
import CiPoemsPlugin from 'main';

export class CiPoemsSettingTab extends PluginSettingTab {
  plugin: CiPoemsPlugin;

  constructor(app: App, plugin: CiPoemsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

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
