import { App, EditorSuggestContext } from 'obsidian';
import { POEM_KIND_TUNE, ComposedTune } from 'types';
import { getTune } from 'tunes';
import { extractHead, splitLines } from 'poemUtil';
import { PoemCompositionHint } from 'PoemCompositionHint';

export class TuneCompositionHint extends PoemCompositionHint {
    constructor(app: App) {
        super(app, POEM_KIND_TUNE);
    }

    async getSuggestions(context: EditorSuggestContext): Promise<ComposedTune[]> {
        const lines = splitLines(context.query);
        const head = extractHead(lines[0]);
        if (!head) {
            return [];
        }

        const tuneName = head.title;
        const tune = getTune(tuneName);
        const composedTones = lines.slice(1).join('\n');
        return [{
            name: tuneName,
            tones: tune ? tune.tones : '',
            composedTones: composedTones,
        }];
    }

    renderSuggestion(tune: ComposedTune, el: HTMLElement) {
        el.createDiv({ text: tune.name, cls: "poem-title" });

        const lines = splitLines(tune.tones);
        for (let i = 0; i < lines.length; i++) {
            el.createDiv({ text: lines[i], cls: "poem-line" });
        }
    }
}
