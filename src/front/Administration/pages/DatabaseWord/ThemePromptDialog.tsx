import React, { useState } from "react";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { renderTheme } from "front/Administration/pages/DatabaseWord/Utility";
import { KKuTu } from "../../../../common/KKuTu";

export default class ThemePromptDialog extends Dialog.Asynchronous<
  string | null
> {
  protected override head(): React.ReactElement {
    return <>{L.get("themePrompt_title")}</>;
  }
  protected override body(): React.ReactElement {
    const [theme, setTheme] = useState("0");

    return (
      <>
        <div className="body dialog-prompt">
          {L.get("themePrompt_body")}
          <select
            value={theme}
            onChange={(e) => setTheme(e.currentTarget.value)}
          >
            {[...KKuTu.Game.THEMES, ...KKuTu.Game.THEMES_WIDE].map(
              (theme, index) => (
                <option key={index} value={theme}>
                  {renderTheme(theme)}
                </option>
              )
            )}
          </select>
        </div>
        <div className="footer buttons">
          <button type="button" onClick={() => this.resolve(theme)}>
            {L.get("ok")}
          </button>
          <button type="button" onClick={() => this.resolve(null)}>
            {L.get("cancel")}
          </button>
        </div>
      </>
    );
  }
}
