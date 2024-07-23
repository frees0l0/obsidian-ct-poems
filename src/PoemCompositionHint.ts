import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import { ComposedTune, POEM_KIND_TUNE } from 'types';
import { extractHead, isCodeBlockBoundary, splitLines } from 'poemUtil';
import { getTune } from 'tunes';
import { getTones } from 'tones';

export class PoemCompositionHint extends EditorSuggest<ComposedTune> {
    constructor(app: App) {
        super(app);
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

    async getSuggestions(context: EditorSuggestContext): Promise<ComposedTune[]> {
        const lines = splitLines(context.query);
        const head = extractHead(lines[0]);
        if (!head) {
            return [];
        }

        const content = lines.slice(1);
        if (head.kind == POEM_KIND_TUNE) {
            const tuneName = head.title;
            const tune = getTune(tuneName);
            const tones = tune ? tune.tones : [];
            const composedTones = getTones(content);
            return [{
                name: tuneName,
                tones: tones,
                composedTones: composedTones,
            }];
        } else {
            return [];
        }
    }

    renderSuggestion(tune: ComposedTune, el: HTMLElement) {
        el.createDiv({ text: tune.name, cls: "poem-title" });

        const tones = tune.tones;
        for (let i = 0; i < tones.length; i++) {
            el.createDiv({ text: tones[i], cls: "poem-line" });
        }
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
            if (head) {
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
