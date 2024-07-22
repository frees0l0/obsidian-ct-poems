import { MarkdownPostProcessorContext } from "obsidian";
import { POEM_CODE_TAG, POEM_KIND_S4, POEM_KIND_S8, POEM_KIND_TUNE, PoemHead, Tune } from "types";

// 格式："词牌：菩萨蛮" or "词牌：菩萨蛮·秋思"
const PATTERN_POEM_HEAD = /^(?<kind>\p{L}+)[:：]\s*(?<title>\p{L}+(?:[.·]\p{L}+)?)$/u;
const PATTERN_DOT_SEP = /\.|·/;

export function getCodeBlock(tune: Tune): string {
    const block = 
`\`\`\`${POEM_CODE_TAG}

${POEM_KIND_TUNE} ${tune.name}



\`\`\``;
    return block;
}

export function renderPoem(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) : void {
    const rows = splitLines(source);

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
    if (kind != POEM_KIND_TUNE && kind != POEM_KIND_S4 && kind != POEM_KIND_S8) {
        return null;
    }
    
    let title = match.groups.title;
    let subtitle = null;
    if (kind == POEM_KIND_TUNE) {
        const parts = title.split(PATTERN_DOT_SEP);
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

export function splitLines(content: string): string[] {
    return content.split("\n").map(row => row.trim()).filter(row => row.length > 0);
}
