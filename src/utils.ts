/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, TFile } from "obsidian";

export function isMobile(app: App): boolean {
    return (app as any)?.isMobile;
}

export async function verifyOrAddFrontMatter(
    app: App,
    file: TFile,
    fieldName: string,
    fieldValue: string,
    skipIfExists = true
): Promise<boolean> {
    let locationAdded = false;
    await app.fileManager.processFrontMatter(file, (frontmatter: any) => {
        if (fieldName in frontmatter && skipIfExists) {
            locationAdded = false;
            return;
        }
        frontmatter[fieldName] = fieldValue;
        locationAdded = true;
    });
    return locationAdded;
}

export function argmax<T>(arr: T[], fn: (o: T) => number): number {
    if (arr.length == 0) {
        return -1;
    }

    let maxIndex = 0;
    let maxValue = fn(arr[0]);
    for (let i = 1; i < arr.length; i++) {
        const value = fn(arr[i]);
        if (value > maxValue) {
            maxIndex = i;
            maxValue = value;
        }
    }
    return maxIndex;
}

export function isChinese(char: string) {
    // Check if the character falls within the basic Chinese or extended Chinese ranges
    return (/[\u4E00-\u9FFF\u3400-\u4DBF]/).test(char);
}