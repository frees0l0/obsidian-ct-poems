import { PATTERN_PINYIN, PATTERN_POEM_HEAD, PATTERN_DOT, PATTERN_SENTENCE, PATTERN_SENTENCE_FULL, PATTERN_SECTION_SEP } from "regexps";
import { Editor, MarkdownPostProcessorContext } from "obsidian";
import { POEM_CODE_TAG, PoemHead, PoemKind, SentencePattern } from "types";

export function getCodeBlock(head: PoemHead): string {
    const block = 
`\`\`\`${POEM_CODE_TAG}

${head.kind}: ${head.title}



\`\`\``;
    return block;
}

export function renderPoem(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) : void {
    // Remove pinyin annotations
    source = source.replace(PATTERN_PINYIN, '');
    const rows = splitLines(source, false);

    const div = el.createDiv({ cls: "poem" });
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const head = extractHead(row);
        if (head) {
            const title = head.subtitle ? `${head.title}·${head.subtitle}` : head.title;
            const headEl = div.createDiv({ cls: "poem-head" });
            headEl.createSpan({ text: title, cls: "poem-title" });
            headEl.createSpan({ text: head.kind, cls: "poem-kind" });
        } else {
            div.createDiv({ text: row, cls: "poem-line" });
        }
    }
}

export function insertPoemInEditor(head: PoemHead, editor: Editor) {
    const codeBlock = getCodeBlock(head);
    const cursor = editor.getCursor();

    editor.transaction({
      changes: [{ from: cursor, text: codeBlock }],
    });
    editor.setCursor({
      line: cursor.line + codeBlock.split('\n').length - 3,
      ch: 0,
    });
}

export function isHead(row: string): boolean {
    return row.trim().match(PATTERN_POEM_HEAD) != null;
}

export function extractHead(row: string): PoemHead | null {
    const match = row.trim().match(PATTERN_POEM_HEAD);
    if (!match || !match.groups) {
        return null;
    }

    const kind = match.groups.kind;
    if (kind != PoemKind.CI && kind != PoemKind.S4 && kind != PoemKind.S8) {
        return null;
    }
    
    let title = match.groups.title ?? '无题';
    let subtitle;
    if (kind == PoemKind.CI) {
        const parts = title.split(PATTERN_DOT);
        if (parts.length > 1) {
            title = parts[0];
            subtitle = parts[1];
        }
    }
    return {
        kind: kind,
        title: title,
        subtitle: subtitle,
    };
}

export function isCodeBlockBoundary(row: string, isStart: boolean | undefined = undefined) {
    row = row.trim();
    // undefined means start or end
    if (isStart == undefined) {
        return row.startsWith('```');
    } else if (isStart) {
        return row.startsWith('```' + POEM_CODE_TAG);
    } else {
        return row == '```';
    }
}

export function splitLines(content: string, keepEmptyLines: boolean): string[] {
    const lines = content.split('\n').map(line => line.trim());
    return keepEmptyLines ? lines : lines.filter(l => l.length > 0);
}

export function splitSections(content: string): string[] {
    const lines = content.split(PATTERN_SECTION_SEP).map(line => line.trim());
    return lines;
}

export function extractSentences(line: string): string[] {
    // Global match returns string[]
    const sents = line.match(PATTERN_SENTENCE);
    return sents ?? [];
}

export function extractSentencePatterns(line: string): SentencePattern[] {
    return Array.from(line.matchAll(PATTERN_SENTENCE_FULL), m => {
        return {
            tones: m.groups?.words ?? '',
            rhymeType: m.groups?.rhymeType ?? '',
            punctuation: m.groups?.punc ?? '',
        }
    });
}
