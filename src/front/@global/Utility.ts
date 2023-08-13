import { CLIENT_SETTINGS, FRONT } from "back/utils/Utility";

export const PROPS = FRONT && eval("window['__PROPS']");
export function getTimeDistance(from: number, to: number = Date.now()) {
  return (to - from) / 60000;
}
export function getRequiredScore(level: number) {
  return Math.round(
    (Number(!(level % 5)) * 0.3 + 1) *
      (Number(!(level % 15)) * 0.4 + 1) *
      (Number(!(level % 45)) * 0.5 + 1) *
      (120 +
        Math.floor(level / 5) * 60 +
        Math.floor((level * level) / 225) * 120 +
        Math.floor((level * level) / 2025) * 180)
  );
}
export function getLevel(score: number) {
  for (const idx in CLIENT_SETTINGS.expTable)
    if (score < CLIENT_SETTINGS.expTable[idx]) return idx + 1;
  return 1;
}
