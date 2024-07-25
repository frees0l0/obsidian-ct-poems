import { PATTERN_PINYIN, PATTERN_POEM_HEAD, PATTERN_DOT, PATTERN_SENTENCE } from "regexps";
import { MarkdownPostProcessorContext } from "obsidian";
import { POEM_CODE_TAG, PoemHead, PoemKind, Tune } from "types";

export function getCodeBlock(tune: Tune): string {
    const block = 
`\`\`\`${POEM_CODE_TAG}

${PoemKind.CI} ${tune.name}



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
            div.createDiv({ text: title, cls: "poem-title" });
        } else {
            div.createDiv({ text: row, cls: "poem-line" });
        }
    }
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
    
    let title = match.groups.title;
    let subtitle = null;
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

export function splitSentences(line: string): string[] {
    // Global match returns string[]
    const sents = line.match(PATTERN_SENTENCE);
    return sents ?? [];
}

