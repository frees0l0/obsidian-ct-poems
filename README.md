# Ci-Poems Plugin

## Overview

The main idea is to develop an `Obsidian` plugin which can facilitate the creation of Chinese ci poems using the Code Block syntax.

## Look & Feel

The basic look and feel of this plugin in different modes would be like:

### Editing Mode

> [!tip] Editing Mode
> \```ci-poem
> 
> tune: 菩萨蛮
> 
> <p style="color:green">中平中仄平平仄，中平中仄平平仄。中仄仄平平，中平中仄平。</p>
> 
> <p><span style="color:green">中平平仄仄，中仄中平仄。中仄仄平平，</span><span style="color:green">中</span><span style="color:red">平</span>中仄平。</p>
> 
> ci: 无题
> 
> 平林漠漠烟如织，寒山一带伤心碧。暝色入高楼，有人楼上愁。
> 
> 玉阶空伫立，宿鸟归飞急。何处是归程？长路...
> 
> \```

👆🏻**Notes**:
- While clicking one tone(平/仄/中) in the `tune`, the cursor should be automatically moved to the corresponding word in the `ci`.

### Reading Mode

> [!tip] Reading Mode
> 
> <p style="font-weight: bold">菩萨蛮·无题</p>
> <p style="">平林漠漠烟如织，寒山一带伤心碧。暝色入高楼，有人楼上愁。</p>
> 
> <p style="">玉阶空伫立，宿鸟归飞急。何处是归程？长亭更短亭。</p>

👆🏻**Notes**:
- Each word which does NOT comply with the expected tone in the tune should be highlighted with some color like red.

## Commands

The following commands will be provided by this plugin:

- **Insert Ci-Poem**: which pops up a modal for the user to input or search a specific `tune`, then inserts the code block of `ci-poem` for the given tune at the cursor's position.

## Suggestions

TBD

## Tunes Library

For now, all available tunes will be stored as a local json file packaged and updated with the released plugin.

And the following mechanisms may be provided in the future:
- upgrade the local tunes library separately without having to updating the plugin.
- the user can add his or her own tunes locally.
- the user can submitted his or her own tunes to the central library by some way.