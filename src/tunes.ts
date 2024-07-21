import { Tune } from "types";

const ALL_TUNES = [
  {
    name: "菩萨蛮",
    tones: "中平中仄平平仄，中平中仄平平仄。中仄仄平平，中平中仄平。\n\n中平平仄仄，中仄中平仄。中仄仄平平，中平中仄平。",
  }
];

export function getAllTunes(): Tune[] {
  return ALL_TUNES;
}

export function getTune(name: string): Tune | undefined {
  return ALL_TUNES.find(t => t.name === name);
}
