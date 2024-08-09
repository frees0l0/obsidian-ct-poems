import { App, Modal } from "obsidian";
import { RhymeDictType } from "types";
import { getRhymes, toneOfPinyin } from "rhymes";
import { getFinals } from "tones";

export class RhymeSearchModal extends Modal {
  private word;

  constructor(app: App, word: string) {
    super(app);
    this.word = word;
  }

  onOpen() {
    const groups = this.searchRhymeGroups();
    const { contentEl } = this;
    const el = contentEl.createDiv({
      attr: { 'style': 'margin: 0px 15px 10px 15px;' },
    });
    el.createDiv({
      text: this.word,
      attr: { 'style': 'margin-bottom: 5px; font-size: 112.5%; font-weight: bold;' },
    });
    for (const group of groups) {
      const row = el.createDiv({
        attr: { 'style': 'margin-top: 5px; display: flex; flex-direction: row;' },
      });

      row.createDiv({
        attr: { 'style': 'width: 100px; color: #5c5c5c; text-align: left;' },
      })
      .createSpan({ text: group.type+'：' });

      row.createDiv()
      .createSpan({ text: group.groups.join(' | ') });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  searchRhymeGroups() {
    const allGroups = [];
     // Standard and new rhymes
    const finals = getFinals(this.word, true);
    for (const type of [RhymeDictType.STANDARD, RhymeDictType.NEW]) {
      const rhymes = getRhymes(type);
      let groups = finals.map(final => toneOfPinyin(final) + '声' + ' ' + rhymes.getRhymeGroup(final, this.word, false));
      groups = [...new Set(groups)];
      allGroups.push({ type, groups });
    }
    // Pingshui rhymes
    const type = RhymeDictType.PINGSHUI;
    const rhymes = getRhymes(type);
    const groups = rhymes.getRhymeGroup('', this.word, false).split('|').map(g => rhymes.getOriginalTone(g) + ' ' + g);
    allGroups.push({ type, groups });
    // Cilin rhymes == Pingshui rhymes with loose option
    const looseGroups = rhymes.getRhymeGroup('', this.word, true).split('|');
    allGroups.push({ type: '词林正韵', groups: looseGroups });

    return allGroups;
  }
}