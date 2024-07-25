import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import { ComposedTune, PoemKind } from 'types';
import { extractHead, isCodeBlockBoundary, splitLines, splitSentences } from 'poemUtil';
import { getTune } from 'tunes';
import { getTones, matchTone } from 'tones';

const MAX_PEEK_LINES = 100;

export class PoemCompositionHint extends EditorSuggest<ComposedTune> {
    constructor(app: App) {
        super(app);
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

    async getSuggestions(context: EditorSuggestContext): Promise<ComposedTune[]> {
        const lines = splitLines(context.query, false);
        const head = extractHead(lines[0]);
        if (!head) {
            return [];
        }

        const sents = lines.slice(1).flatMap(line => splitSentences(line));
        if (head.kind == PoemKind.CI) {
            const tuneName = head.title;
            const tune = getTune(tuneName);
            
            const tones = tune ? tune.tones : [];
            const sections = tune ? tune.sections : [];
            const composedTones = tune ? getTones(sents) : [];
            return [{
                kind: head.kind,
                name: tuneName,
                tones: tones,
                sections: sections,
                composedTones: composedTones,
            }];
        } else {
            return [];
        }
    }

    renderSuggestion(tune: ComposedTune, el: HTMLElement) {
        el.createDiv({ text: tune.name, cls: 'tune-title' });

        const tones = tune.tones;
        const composedTones = tune.composedTones;
        const sections = tune.sections;

        let sectionStart = 0;
        for (let i = 0; i < sections.length; i++) {
            const sectionEnd = sectionStart + sections[i];
            this.renderSectionTones(el, tones.slice(sectionStart, sectionEnd), composedTones.slice(sectionStart, sectionEnd))
            sectionStart = sectionEnd;
        }
    }

    renderSectionTones(el: HTMLElement, sentTones: string[], composedSentTones: string[]) {
        const lineEl = el.createDiv({ cls: 'tune-line' });
        for (let i = 0; i < sentTones.length; i++) {
            this.renderSentenceTones(lineEl, sentTones[i], composedSentTones[i]);
        }
    }

    renderSentenceTones(el: HTMLElement, tones: string, composedTones: string) {
        // console.info('renderSentenceTones', tones, composedTones);
        composedTones = composedTones ?? '';
        // TODO Merge spans with the same styles
        for (let i = 0; i < tones.length; i++) {
            // Tones ends with punc while composedTones does NOT, so the trailing punc skips the tone matching
            if (!composedTones[i]) {
                el.createSpan({ text: tones[i] });
            }
            else {
                const cls = matchTone(tones[i], composedTones[i]) ? 'tune-success' : 'tune-error';
                el.createSpan({ text: tones[i], cls: cls});
            }
        }
    }
    
    async selectSuggestion(value: ComposedTune, evt: MouseEvent | KeyboardEvent) {
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
