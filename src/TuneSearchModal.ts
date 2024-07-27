import { App, Editor, FuzzySuggestModal, FuzzyMatch } from 'obsidian';
import { PoemKind, Tune } from 'types';
import { getTunes } from 'tunes';
import { getCodeBlock } from 'poemUtil';

export class TuneSearchModal extends FuzzySuggestModal<Tune> {
  private editor: Editor;

  constructor(app: App, editor: Editor) {
    super(app);
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
    const tip = tune.sentences.slice(0, 4).map(s => s.tones + s.punctuation).join('');
    el.createEl("div", { text: tune.name });
    el.createEl("small", { text: tip + '......' });
  }

  onChooseItem(tune: Tune, evt: MouseEvent | KeyboardEvent) {
    const codeBlock = getCodeBlock(tune);
    const cursor = this.editor.getCursor();

    this.editor.transaction({
      changes: [{ from: cursor, text: codeBlock }],
    });
    this.editor.setCursor({
      line: cursor.line + codeBlock.split('\n').length - 3,
      ch: 0,
    });
  }
}
