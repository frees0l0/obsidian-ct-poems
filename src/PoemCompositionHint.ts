import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import { ComposedTune, PoemKind } from 'types';
import { extractHead, isCodeBlockBoundary } from 'poemUtil';

export abstract class PoemCompositionHint extends EditorSuggest<ComposedTune> {
    private kind: PoemKind;

    constructor(app: App, kind: PoemKind) {
        super(app);
        this.kind = kind;
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        const curLineNo = cursor.line;
        const curLine = editor.getLine(curLineNo)?.trim();

        if (!curLine || isCodeBlockBoundary(curLine)) {
            return null;
        }

        const startLineNo = this.getPoemStart(curLineNo, editor);
        if (startLineNo < 0) {
            return null;
        }

        const endLineNo = this.getPoemEnd(curLineNo, editor);
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

    async selectSuggestion(value: ComposedTune, evt: MouseEvent | KeyboardEvent) {
        // Do nothing
    }

    getPoemStart(curLineNo: number, editor: Editor): number {
        let start = -1;
        let codeBlockFound = false;
        while (curLineNo >= 0) {
            const curLine = editor.getLine(curLineNo);
            const head = extractHead(curLine);
            if (head && head.kind == this.kind) {
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

    getPoemEnd(curLineNo: number, editor: Editor): number {
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
