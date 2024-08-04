import { MarkdownPostProcessorContext } from "obsidian";
import { splitLines, extractHead } from "poemUtil";
import { PATTERN_PINYIN } from "regexps";
import { needRhyme } from "tones";
import { TuneMatch, PoemKind, SentencePattern, Sentence, RhymeType, ToneMatch } from "types";

/**
 * Render the poem code block in reading view.
 */
export function renderPoem(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) : void {
    // Remove pinyin annotations
    source = source.replace(PATTERN_PINYIN, '');
    const rows = splitLines(source, false);

    const div = el.createDiv({ cls: "poem" });
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const head = extractHead(row);
        if (head) {
            const { kind, name, title } = head;
            const nameAndTitle = [name, title].filter(s => s).join('·');
            const headEl = div.createDiv({ cls: "poem-head" });
            headEl.createSpan({ text: nameAndTitle, cls: "poem-title" });
            headEl.createSpan({ text: kind, cls: "poem-kind" });
        } else {
            div.createDiv({ text: row, cls: "poem-line" });
        }
    }
}

/**
 * Render the tune suggestion in editing view.
 */
export function renderTuneSuggestion(tune: TuneMatch, el: HTMLElement) {
    el = el.createDiv( {cls: 'tune'} )

    const name = tune.kind == PoemKind.CI ? tune.name: tune.kind;
    el.createDiv({ text: name, cls: 'tune-title' });

    if (this.settings.showDescInEditing && tune.desc) {
        el.createDiv({text: tune.desc, cls: 'tune-section'});
    }

    const { sentencePatterns, composedSentences, sections} = tune;
    let sectionStart = 0;
    for (let i = 0; i < sections.length; i++) {
        const sectionEnd = sectionStart + sections[i];
        renderSectionTones(el, sentencePatterns.slice(sectionStart, sectionEnd), composedSentences.slice(sectionStart, sectionEnd))
        sectionStart = sectionEnd;
    }
}

function renderSectionTones(el: HTMLElement, sents: SentencePattern[], composedSents: Sentence[]) {
    const lineEl = el.createDiv({ cls: 'tune-section' });
    for (let i = 0; i < sents.length; i++) {
        renderSentenceTones(lineEl, sents[i], composedSents[i]);
    }
}

function renderSentenceTones(el: HTMLElement, sent: SentencePattern, composedSent: Sentence | undefined) {
    // console.info('renderSentenceTones', sent.tones, composedSent?.tones);
    const tones = sent.tones;
    const composedTones = composedSent?.tones ?? '';
    const tonesMatched = composedSent?.tonesMatched ?? '';
    for (let i = 0; i < tones.length; i++) {
        // Decoration based on rhyme type
        const rhymeNeeded = i == tones.length - 1 && needRhyme(sent.rhymeType);
        const cls = [];
        if (rhymeNeeded) {
            cls.push('rhyme');
            if (sent.rhymeType == RhymeType.NEW) {
                cls.push('rhyme-new');
            }
            else if (sent.rhymeType == RhymeType.RESUME) {
                cls.push('rhyme-resume');
            }
        }
        // The composed tones may have not been finished
        if (!composedSent || !composedTones[i]) {
            el.createSpan({ text: tones[i], cls: cls });
        }
        else {
            // Decoration based on tone & rhyme matching
            const toneOk = tonesMatched[i] == ToneMatch.YES;
            const rhymeOk = !rhymeNeeded || composedSent.rhymed;
            cls.push(toneOk ? 'tone-success' : 'tone-error');
            if (!rhymeOk) {
                cls.push('rhyme-error')
            }
            el.createSpan({ text: tones[i], cls: cls});
        }
    }
    el.createSpan( {text: sent.punctuation} );
}