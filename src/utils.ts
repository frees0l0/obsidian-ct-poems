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