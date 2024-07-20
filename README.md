## Overview

The main idea is to develop an `Obsidian` plugin which can facilitate the creation of Chinese `ci poems` using the Code Block syntax.

## Commands

The following commands will be provided by this plugin:

### Insert Ci-Poem

This command pops up a suggestions modal for the user to search a specific `tune`([[Ci-Poems Plugin#Tune Search Suggestions]]), then inserts the code block of `ci-poem` for the chosen `tune` at the cursor's position.

## Look & Feel

The basic look and feel of this plugin in different modes would be like:

### Tune Search Suggestions

As used in the **Insert Ci-Poem** command, a suggestions modal will be shown for the user to search a specific `tune`. Thanks to `Obsidian`'s awesome API, fuzzy search is supported out of the box.

### Editing Mode

> [!tip] Editing View
> \```ci-poem
> 
> 词牌: 菩萨蛮
> 
> 平林漠漠烟如织，寒山一带伤心碧。暝色入高楼，有人楼上愁。
> 
> 玉阶空伫立，宿鸟归飞急。何处是归程？长<span style="color:red">路</span>...
> 
> \```

> [!tip] Editior Suggestions
> 
> 菩萨蛮
> 
> <p style="color:green">中平中仄平平仄，中平中仄平平仄。中仄仄平平，中平中仄平。</p>
> <p><span style="color:green">中平平仄仄，中仄中平仄。中仄仄平平，</span><span style="color:green">中</span><span style="color:red">平</span>中仄平。</p>

### Reading Mode

> [!tip] Reading View
> 
> <p style="font-weight: bold">菩萨蛮·无题</p>
> <p style="">平林漠漠烟如织，寒山一带伤心碧。暝色入高楼，有人楼上愁。</p>
> 
> <p style="">玉阶空伫立，宿鸟归飞急。何处是归程？长亭更短亭。</p>

👆🏻**Notes**:
- In `reading mode`, each word which does NOT comply with the expected tone of the tune should also be highlighted with some color like red.

## Tunes Library

All the local tunes are stored in the `tunes.json` file shipped and updated along with the plugin.

In the future, the following mechanisms may be provided:
- a central library shall be maintained in the cloud and can be accessed via `http`.
- local tunes can be automatically synced with the central library each time the plugin is loaded.
- the user can add his or her own tunes locally.
- the user can submitted his or her own tunes to the central library by some way.