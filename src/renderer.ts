import { extractPoem } from "poemUtil";
import { needRhyme } from "tones";
import { matchTunes } from "tunes";
import { TuneMatch, PoemKind, SentencePattern, Sentence, RhymeType, ToneMatch, PoemHead } from "types";

/**
 * Render the poem code block in reading view.
 */
export function renderPoem(source: string, el: HTMLElement, renderTones: boolean) {
    const poem = extractPoem(source);
    const tune = poem ? matchTunes(poem.head, poem.sentences, poem.paragraphs, 1)[0] : null;
    if (!poem || !tune) {
        console.error('Failed to get poem from code block', source);
        return;
    }

    el = el.createDiv({ cls: "poem" });
    renderPoemHead(poem.head, tune.displayKind, el);

    const { sentencePatterns, composedSentences, composedParagraphs, sections} = tune;
    let groupStart = 0, sectionSentCount = 0, sectionIndex = 0;
    for (let i = 0; i < composedParagraphs.length; i++) {
        // Render sentence group
        const groupEnd = groupStart + composedParagraphs[i];
        renderSentenceGroup(el, sentencePatterns.slice(groupStart, groupEnd), composedSentences.slice(groupStart, groupEnd), true, renderTones, 'poem-parag');
        groupStart = groupEnd;
        // Add a section seperator if current and non-last section is done
        sectionSentCount += composedParagraphs[i];
        if (sectionIndex < sections.length - 1 && sectionSentCount >= sections[sectionIndex]) {
            el.createDiv({ cls: 'poem-section-sep' });
            sectionSentCount = 0;
            sectionIndex++;
        }
    }
}

/**
 * Render the tune suggestion in editing view.
 */
export function renderTuneSuggestion(tune: TuneMatch, el: HTMLElement, showDesc: boolean) {
    el = el.createDiv( {cls: 'tune'} )

    const name = tune.kind == PoemKind.CI ? tune.name: tune.kind;
    el.createDiv({ text: name, cls: 'tune-title' });

    const { sentencePatterns, composedSentences, sections} = tune;
    let groupStart = 0;
    for (let i = 0; i < sections.length; i++) {
        const groupEnd = groupStart + sections[i];
        renderSentenceGroup(el, sentencePatterns.slice(groupStart, groupEnd), composedSentences.slice(groupStart, groupEnd), false, true, 'tune-section');
        groupStart = groupEnd;
    }
    
    if (showDesc && tune.desc) {
        el.createDiv({text: tune.desc, cls: 'tune-section'});
    }
}

/* Common rendering functions */

function renderPoemHead(head: PoemHead, displayKind: string, poemEl: HTMLElement) {
    const { kind, name, title } = head;
    const nameAndTitle = [name, title].filter(s => s).join('·');
    const headEl = poemEl.createDiv({ cls: "poem-head" });
    headEl.createSpan({ text: nameAndTitle, cls: "poem-title" });
    headEl.createSpan({ text: displayKind || kind, cls: "poem-kind", title: '点击显示或隐藏格律' }, el => {
        el.addEventListener('click', (ev) => {
            const elsOfTones = poemEl.getElementsByClassName('poem-tones');
            for (let i = 0; i < elsOfTones.length; i++) {
                const tonesEl = elsOfTones[i] as HTMLElement;
                tonesEl.style.display = !tonesEl.style.display || tonesEl.style.display == 'block' ? 'none' : 'block';
            }
        });
    });
}

/**
 * Render a group of sentences with tones. The group class can specify font, margin, padding, etc.
 */
function renderSentenceGroup(el: HTMLElement, sents: SentencePattern[], composedSents: Sentence[], renderWords: boolean, renderTones: boolean, groupClass: string) {
    const groupEl = el.createDiv({ cls: ['flex-v', groupClass] });
    if (renderTones) {
        const lineEl = groupEl.createDiv({ cls: 'poem-tones' });
        for (let i = 0; i < sents.length; i++) {
            renderSentenceTones(lineEl, sents[i], composedSents[i]);
        }
    }
    if (renderWords) {
        const lineEl = groupEl.createDiv();
        const s = composedSents.map((sent, i) => {
            return i != composedSents.length - 1 || sent.words.length == sents[i].tones.length ? sent.words + sent.punctuation : sent.words;
        }).join('');
        lineEl.createSpan({ text: s });
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
    el.createSpan({ text: sent.punctuation });
}