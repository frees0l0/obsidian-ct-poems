import { App, Editor, FuzzySuggestModal, FuzzyMatch } from 'obsidian';
import { PoemKind, Tune } from 'types';
import { getTunes } from 'tunes';
import { insertPoemInEditor } from 'poemUtil';

export class TuneSearchModal extends FuzzySuggestModal<Tune> {
  private editor: Editor;

  constructor(app: App, editor: Editor) {
    super(app);
    this.limit = 250;
    this.editor = editor;
  }
  
  getItems(): Tune[] {
    return getTunes(PoemKind.CI);
  }

  getItemText(tune: Tune): string {
    return tune.name;
  }

  renderSuggestion(match: FuzzyMatch<Tune>, el: HTMLElement) {
    const tune = match.item;
    const tip = tune.sentencePatterns.slice(0, 4).map(s => s.tones + s.punctuation).join('');
    el.createEl("div", { text: tune.name });
    el.createEl("small", { text: tip + '......', attr: { 'style': 'color: #999;' } });
  }

  onChooseItem(tune: Tune, evt: MouseEvent | KeyboardEvent) {
    insertPoemInEditor({ kind: tune.kind, name: tune.name, title: '' }, this.editor);
  }
}
