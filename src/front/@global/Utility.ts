import { FRONT } from "back/utils/Utility";

export const PROPS = FRONT && eval("window['__PROPS']");
export function getTimeDistance(from: number, to: number = Date.now()) {
  return (to - from) / 60000;
}
