import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";
import { renderTheme } from "front/Administration/pages/DatabaseWord/Utility";
import { KKuTu } from "../../../../common/KKuTu";

export default class ThemePromptDialog extends Dialog.Asynchronous<
  string | null
> {
  protected override head(): React.ReactElement {
    const { l } = useLexicon(lAdministration);

    return <>{l("themePrompt_title")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lAdministration);
    const [theme, setTheme] = useState("0");

    return (
      <>
        <div className="body dialog-prompt">
          {l("themePrompt_body")}
          <select
            value={theme}
            onChange={(e) => setTheme(e.currentTarget.value)}
          >
            {[...KKuTu.Game.THEMES, ...KKuTu.Game.THEMES_WIDE].map(
              (theme, index) => (
                <option key={index} value={theme}>
                  {renderTheme(l, theme)}
                </option>
              )
            )}
          </select>
        </div>
        <div className="footer buttons">
          <button type="button" onClick={() => this.resolve(theme)}>
            {l("ok")}
          </button>
          <button type="button" onClick={() => this.resolve(null)}>
            {l("cancel")}
          </button>
        </div>
      </>
    );
  }
}
