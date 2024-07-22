import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import { ComposedTune } from 'types';
import { getTune } from 'tunes';
import { isTuneHead, isCodeBlockBoundary, splitLines, extractTuneName } from 'poemUtil';

export class TuneCompositionHint extends EditorSuggest<ComposedTune> {
    constructor(app: App) {
        super(app);
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        const curLineNo = cursor.line;
        const curLine = editor.getLine(curLineNo)?.trim();

        if (!curLine || isCodeBlockBoundary(curLine)) {
            return null;
        }

        const startLineNo = this.getTuneStart(curLineNo, editor);
        if (startLineNo < 0) {
            return null;
        }

        const endLineNo = this.getTuneEnd(curLineNo, editor);
        if (endLineNo < 0) {
            return null;
        }

        const start = { line: startLineNo, ch: 0 };
        const end = { line: endLineNo, ch: editor.getLine(endLineNo).length - 1 };
        const query = editor.getRange(start, end);
        return {
            start: start,
            end: end,
            query: query,
        };
    }

    async getSuggestions(context: EditorSuggestContext): Promise<ComposedTune[]> {
        const lines = splitLines(context.query);
        const tuneName = extractTuneName(lines[0]);
        const tune = getTune(tuneName);
        const composedTones = lines.slice(1).join('\n');
        return [{
            name: tuneName,
            tones: tune ? tune.tones : '',
            composedTones: composedTones,
        }];
    }

    renderSuggestion(tune: ComposedTune, el: HTMLElement) {
        el.createDiv({ text: tune.name, cls: "ci-poem-title" });

        const lines = splitLines(tune.tones);
        for (let i = 0; i < lines.length; i++) {
            el.createDiv({ text: lines[i], cls: "ci-poem-line" });
        }
    }

    async selectSuggestion(value: ComposedTune, evt: MouseEvent | KeyboardEvent) {
        // Do nothing
    }

    getTuneStart(curLineNo: number, editor: Editor): number {
        let start = -1;
        let codeBlockFound = false;
        while (curLineNo >= 0) {
            const curLine = editor.getLine(curLineNo);
            if (isTuneHead(curLine)) {
                start = curLineNo;
            }
            else if (isCodeBlockBoundary(curLine, true)) {
                codeBlockFound = true;
                break;
            }
            else if (isCodeBlockBoundary(curLine, false)) {
                // Not within a code block
                break;
            }

            curLineNo--;
        }
        // Always check code block before returning start
        return codeBlockFound ? start : -1;
    }

    getTuneEnd(curLineNo: number, editor: Editor): number {
        while (curLineNo <= editor.lastLine()) {
            const curLine = editor.getLine(curLineNo);
            if (isCodeBlockBoundary(curLine, false)) {
                // Return the previous line
                return curLineNo - 1;
            }
            else if (isCodeBlockBoundary(curLine, true)) {
                // Not within a code block
                break;
            }

            curLineNo++;
        }
        return -1;
    }
}
