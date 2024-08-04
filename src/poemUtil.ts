import { PATTERN_POEM_HEAD, PATTERN_DOT, PATTERN_SENTENCE, PATTERN_SENTENCE_PATTERN, PATTERN_SECTION_SEP, PATTERN_SENTENCE_VARIANTS } from "regexps";
import { Editor } from "obsidian";
import { POEM_CODE_TAG, PatternType, PoemHead, PoemKind, SentencePattern, SentenceVariant } from "types";
import { makeSentences, variationType } from "tones";

export function getCodeBlock(head: PoemHead): string {
    const block = 
`\`\`\`${POEM_CODE_TAG}

${head.kind}: ${head.name}



\`\`\``;
    return block;
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

export function extractPoem(content: string) {
    const lines = splitLines(content, false);
    const head = extractHead(lines[0]);
    if (!head) {
        return null;
    }

    const sentsOfLines = lines.slice(1).map(line => makeSentences(extractSentences(line)));
    const sentences = sentsOfLines.flat();
    const paragraphs = sentsOfLines.map((sents) => sents.length);
    return { head, sentences, paragraphs};
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
    
    let name, title;
    const info = match.groups.info;
    if (kind == PoemKind.CI) {
        const parts = info.split(PATTERN_DOT);
        if (parts.length > 1) {
            name = parts[0];
            title = parts[1];
        }
        else {
            name = info;
            title = '';
        }
    }
    else {
        name = '';
        title = info || '无题';
    }
    return {
        kind: kind,
        name: name,
        title: title,
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
    return Array.from(line.matchAll(PATTERN_SENTENCE_PATTERN), m => {
        return {
            tones: m.groups?.words ?? '',
            rhymeType: m.groups?.rhymeType ?? '',
            punctuation: m.groups?.punc ?? '',
            patternType: PatternType.NORMAL,
            counterpart: undefined,
        }
    });
}

export function extractSentenceVariants(s: string) {
    const m = s.match(PATTERN_SENTENCE_VARIANTS);
    if (m && m.groups) {
        const normal = m.groups.normal;
        const sVariants = m.groups.variants.split('/');
        const counterpart = m.groups.counterpart;
  
        const variants: SentenceVariant[] = [];
        for (let i = 0; i < sVariants.length; i++) {
            const v = sVariants[i];
            // console.log(`${normal} variant ${i}: ${v}`);
  
            variants.push({
              tones: v,
              patternType: variationType(normal, i),
              counterpart: counterpart,
            });
        }
        return { normal, variants };
    }
    return {};
}
