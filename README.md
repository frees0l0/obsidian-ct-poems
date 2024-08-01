## Overview

This plugin aims to facilitate the composition of Chinese traditional poems by instantly suggesting and validating the `tones`(平仄) & `rhymes`(韵) patterns for each line of the poems. The supported poem types include Chinese traditional `four-line poems`(绝句), `eight-line poems`(律诗) and `ci poems`(词).

## Commands

The following commands will be provided by this plugin:

### Create Ci-Poem(词)

This command pops up a suggestions modal for the user to search a specific `tune`(词牌), then inserts the code block of `poem` for the chosen `tune`(词牌) at the cursor's position, containing a head line indicating the poem type.

### Create Four-line Poem(绝句) / Eight-line Poem(律诗)

Each of these two commands inserts a code block of `poem` containing a head line indicating the poem type.

## Look & Feel

The basic look and feel of this plugin in different modes would be like:

### Tune(词牌) Search

As used in the **Create Ci-Poem** command, a suggestions modal will be shown for the user to search a specific `tune`(词牌). For now more than 200 popular `tunes`(词牌) are supported out-of-the-box.

<img width="700" alt="ci-tune-search" src="https://github.com/user-attachments/assets/7932f4c6-8320-4658-822c-50c93a3688a3">

### Editing Mode

#### Editing & Suggestions

The Code Block syntax is used for editing poems. While editing the poem, a dialog will pop up and instantly show the most suitable `tones`(平仄) & `rhymes`(韵) patterns and validate the inputted words against such patterns.

<img width="706" alt="poem-editing" src="https://github.com/user-attachments/assets/e6cd23e2-9a1f-4231-847c-c13206a98d86">

#### Pinyin Annotations

We can even annotate a word with `pinyin` to handle special cases like polyphones.

<img width="706" alt="poem-editing-pinyin" src="https://github.com/user-attachments/assets/90f55eee-e325-4556-9a02-4f06d90a9259">

### Reading Mode

The reading view just renders the poem using the proper format.

<img width="706" alt="poem-reading" src="https://github.com/user-attachments/assets/a2e4a8ef-7f3b-4f70-b2e2-2f311eeb1f40">

## Rhymes Table

Currently [中华新韵](https://baike.baidu.com/item/%E4%B8%AD%E5%8D%8E%E6%96%B0%E9%9F%B5) and [中华通韵](https://baike.baidu.com/item/%E4%B8%AD%E5%8D%8E%E9%80%9A%E9%9F%B5)(default) are supported as the rhymes table.
