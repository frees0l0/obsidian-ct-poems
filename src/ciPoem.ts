import { MarkdownPostProcessorContext } from "obsidian";
import { Tune } from "types";

export function getCodeBlock(tune: Tune): string {
    const block = 
`\`\`\`ci-poem

词牌: ${tune.name}



\`\`\``;
    return block;
}

export function processCodeBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) : void {
    const rows = source.split("\n").filter((row) => row.length > 0);

    const div = el.createDiv({ cls: "ci-poem" });
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.startsWith("词牌: ")) {
            const title = row.substring(3).trim().replace(/\./, "·");
            div.createDiv({ text: title, cls: "ci-poem-title" });
        } else {
            div.createDiv({ text: row, cls: "ci-poem-line" });
        }
    }
}