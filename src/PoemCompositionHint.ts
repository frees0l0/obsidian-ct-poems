import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import { TuneMatch, Sentence, SentencePattern, ToneMatch, PoemKind } from 'types';
import { extractHead, isCodeBlockBoundary, splitLines, extractSentences } from 'poemUtil';
import { matchTunes } from 'tunes';
import { makeSentences } from 'tones';

const MAX_PEEK_LINES = 100;

export class PoemCompositionHint extends EditorSuggest<TuneMatch> {
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

    async getSuggestions(context: EditorSuggestContext): Promise<TuneMatch[]> {
        const lines = splitLines(context.query, false);
        const head = extractHead(lines[0]);
        if (!head) {
            return [];
        }

        const kind = head.kind;
        const title = head.title;
        const raws = lines.slice(1).flatMap(line => extractSentences(line));
        const sents = makeSentences(raws);
        return matchTunes(kind, title, sents);
    }

    renderSuggestion(tune: TuneMatch, el: HTMLElement) {
        el = el.createDiv( {cls: 'tune'} )

        const title = tune.kind == PoemKind.CI ? tune.name: tune.kind;
        el.createDiv({ text: title, cls: 'tune-title' });

        const sents = tune.sentencePatterns;
        const composedSents = tune.composedSentences;
        const sections = tune.sections;
        let sectionStart = 0;
        for (let i = 0; i < sections.length; i++) {
            const sectionEnd = sectionStart + sections[i];
            this.renderSectionTones(el, sents.slice(sectionStart, sectionEnd), composedSents.slice(sectionStart, sectionEnd))
            sectionStart = sectionEnd;
        }
    }

    renderSectionTones(el: HTMLElement, sents: SentencePattern[], composedSents: Sentence[]) {
        const lineEl = el.createDiv({ cls: 'tune-line' });
        for (let i = 0; i < sents.length; i++) {
            this.renderSentenceTones(lineEl, sents[i], composedSents[i]);
        }
    }

    renderSentenceTones(el: HTMLElement, sent: SentencePattern, composedSent: Sentence | undefined) {
        // console.info('renderSentenceTones', sent.tones, composedSent?.tones);
        const tones = sent.tones;
        const composedTones = composedSent?.tones ?? '';
        const tonesMatched = composedSent?.tonesMatched ?? '';
        for (let i = 0; i < tones.length; i++) {
            // Tones.length >= composedTones.length as composed tones may have not been finished
            if (!composedSent || !composedTones[i]) {
                el.createSpan({ text: tones[i] });
            }
            else {
                const toneOk = tonesMatched[i] == ToneMatch.YES;
                const rhymeNeeded = i == tones.length - 1 && composedSent.rhymed != undefined;
                const rhymeOk = !rhymeNeeded || composedSent.rhymed;
                const cls = toneOk ? ['tone-success'] : ['tone-error'];
                if (rhymeNeeded) {
                    cls.push('rhyme')
                }
                if (!rhymeOk) {
                    cls.push('rhyme-error')
                }
                el.createSpan({ text: tones[i], cls: cls});
            }
        }
        el.createSpan( {text: sent.punctuation} );
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
