import { MarkdownPostProcessorContext } from "obsidian";
import { Tune } from "types";

const CI_POEM_CODE_TAG = 'ci-poem'
const CI_POEM_HEAD_TAG = '词牌:'

export function getCodeBlock(tune: Tune): string {
    const block = 
`\`\`\`${CI_POEM_CODE_TAG}

${CI_POEM_HEAD_TAG} ${tune.name}



\`\`\``;
    return block;
}

export function viewCodeBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) : void {
    const rows = splitLines(source);

    const div = el.createDiv({ cls: "ci-poem" });
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (isHead(row)) {
            const title = extractTuneNameAndTitle(row);
            div.createDiv({ text: title, cls: "ci-poem-title" });
        } else {
            div.createDiv({ text: row, cls: "ci-poem-line" });
        }
    }
}

export function extractTuneNameAndTitle(row: string) {
    return row.substring(CI_POEM_HEAD_TAG.length).trim().replace(/\./, "·");
}

export function extractTuneName(row: string): string {
    return row.substring(CI_POEM_HEAD_TAG.length).trim().split(/\.|·/)[0];
}

export function isHead(row: string): boolean {
    return row.trim().startsWith(CI_POEM_HEAD_TAG);
}

export function isCodeBlockBoundary(row: string, isStart: boolean | undefined = undefined) {
    row = row.trim();
    // undefined means start or end
    if (isStart == undefined) {
        return row.startsWith('```');
    } else if (isStart) {
        return row.startsWith('```' + CI_POEM_CODE_TAG);
    } else {
        return row == '```';
    }
}

export function splitLines(content: string): string[] {
    return content.split("\n").map(row => row.trim()).filter(row => row.length > 0);
}
