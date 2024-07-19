import { FuzzySuggestModal, FuzzyMatch, Notice } from 'obsidian';
import { Tune } from 'types';
import { ALL_TUNES } from 'main';

export class TuneSearchModal extends FuzzySuggestModal<Tune> {
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
