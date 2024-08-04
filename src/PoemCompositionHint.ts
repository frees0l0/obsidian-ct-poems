import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import { TuneMatch, PluginSettings } from 'types';
import { extractHead, isCodeBlockBoundary, extractPoem } from 'poemUtil';
import { matchTunes } from 'tunes';
import { renderTuneSuggestion } from 'renderer';

const MAX_PEEK_LINES = 100;

export class PoemCompositionHint extends EditorSuggest<TuneMatch> {
    private settings;

    constructor(app: App, settings: PluginSettings) {
        super(app);
        this.settings = settings;
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const frontMatter = fileCache?.frontmatter;
        if (!frontMatter || !('poems' in frontMatter)) {
            return null;
        }

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

    async getSuggestions(context: EditorSuggestContext): Promise<TuneMatch[]> {
        const poem = extractPoem(context.query);
        return poem ? matchTunes(poem.head, poem.sentences, poem.paragraphs) : [];
    }

    renderSuggestion(tune: TuneMatch, el: HTMLElement) {
        renderTuneSuggestion(tune, el);
    }
    
    async selectSuggestion(value: TuneMatch, evt: MouseEvent | KeyboardEvent) {
        this.close();
    }

    getPoemStart(curLineNo: number, editor: Editor): number {
        let start = -1;
        let codeBlockFound = false;
        let peeks = 0;
        while (curLineNo >= 0 && ++peeks <= MAX_PEEK_LINES) {
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
        let peeks = 0;
        while (curLineNo <= editor.lastLine() && ++peeks <= MAX_PEEK_LINES) {
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
