## Overview

The main idea is to develop an `Obsidian` plugin which can facilitate the composition of Chinese traditional poems by instantly suggesting and validating the `tones` & `rhymes` patterns for each line of the poems. The supported poem types include Chinese traditional `four-line poems`, `eight-line poems` and `ci poems`.

## Commands

The following commands will be provided by this plugin:

### Create Ci-Poem

This command pops up a suggestions modal for the user to search a specific `tune`, then inserts the code block of `poem` for the chosen `tune` at the cursor's position, containing a head line indicating the poem type.

### Create Four-line or Eight-line Poem

Each of these two commands inserts a code block of `poem` containing a head line indicating the poem type.

## Look & Feel

The basic look and feel of this plugin in different modes would be like:

### Tune Search Suggestions

As used in the **Create Ci-Poem** command, a suggestions modal will be shown for the user to search a specific `tune`.

<img width="700" alt="ci-tune-search" src="https://github.com/user-attachments/assets/794a6417-a70b-4406-8261-88475a48edac">

### Editing Mode

#### Editing & Suggestions

The Code Block syntax is used for editing poems. While editing the poem, a dialog will pop up and instantly show the most suitable `tones` & `rhymes` patterns and validate the inputted words against such patterns.

<img width="706" alt="poem-editing" src="https://github.com/user-attachments/assets/e6cd23e2-9a1f-4231-847c-c13206a98d86">

#### Pinyin Annotations

We can even annotate a word with `pinyin` to handle special cases like polyphones.

<img width="706" alt="poem-editing-pinyin" src="https://github.com/user-attachments/assets/90f55eee-e325-4556-9a02-4f06d90a9259">

### Reading Mode

The reading view just renders the poem using the proper format.

<img width="706" alt="poem-reading" src="https://github.com/user-attachments/assets/a2e4a8ef-7f3b-4f70-b2e2-2f311eeb1f40">
