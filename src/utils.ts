/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, TFile } from "obsidian";

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