import Express from "express";
import ALP from "accept-language-parser";

import { SETTINGS } from "back/utils/System";

const LANGUAGE_SUPPORT = Object.keys(SETTINGS["languageSupport"]);

export function getLocale(req: Express.Request): string {
  let R: string =
    req.session.profile === undefined ? "ko-KR" : req.session.profile.locale;

  if (!SETTINGS.languageSupport[R]) {
    R =
      ALP.pick(LANGUAGE_SUPPORT, String(req.headers["accept-language"])) ||
      LANGUAGE_SUPPORT[0];
  }
  return R;
}
