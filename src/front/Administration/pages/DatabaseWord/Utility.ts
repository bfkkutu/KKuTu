import { LFunction } from "@daldalso/i18n/dist/types";

import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";

export function renderTheme(
  l: LFunction<[typeof lCommon, typeof lAdministration]>,
  theme: string
) {
  return theme === "0" ? l("departure4_noTheme") : l("theme", theme);
}
