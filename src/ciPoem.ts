import { Tune } from "types";

export function getCodeBlock(tune: Tune): string {
    const block = 
`\`\`\`ci-poem

tune: ${tune.name}
${tune.tones}

ci: 


\`\`\``;
    return block;
}