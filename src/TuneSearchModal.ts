import { App, Editor, FuzzySuggestModal, FuzzyMatch } from 'obsidian';
import { Tune } from 'types';
import { getAllTunes } from 'tunes';
import { getCodeBlock } from 'ciPoem';

export class TuneSearchModal extends FuzzySuggestModal<Tune> {
  private editor: Editor;

  constructor(app: App, editor: Editor) {
    super(app);
    this.editor = editor;
  }
  
  getItems(): Tune[] {
    return getAllTunes();
  }

  getItemText(tune: Tune): string {
    return tune.name;
  }

  renderSuggestion(tune: FuzzyMatch<Tune>, el: HTMLElement) {
    el.createEl("div", { text: tune.item.name });
    el.createEl("small", { text: tune.item.tones.substring(0, 20) + '......' });
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
