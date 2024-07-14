import React, { useEffect, useRef, useState } from "react";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import Checkbox from "front/@block/Checkbox";
import { KKuTu } from "../../../common/KKuTu";

type OnSave = (themes: string[]) => void;
export default class ThemeSelectDialog extends Dialog {
  private readonly initialValues: string[];
  private readonly onSave: OnSave;

  constructor(initialValues: string[], onSave: OnSave) {
    super();

    this.initialValues = initialValues;
    this.onSave = onSave;
  }

  protected override head(): React.ReactElement {
    return <>{L.get("themeSelect")}</>;
  }
  protected override body(): React.ReactElement {
    const [themes, setThemes] = useState(new Set(this.initialValues));

    const $common = useRef<HTMLInputElement>(null);
    const $wide = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if ($common.current !== null) {
        $common.current.indeterminate =
          !$common.current.checked &&
          KKuTu.Game.THEMES.some((theme) => themes.has(theme));
      }
      if ($wide.current !== null) {
        $wide.current.indeterminate =
          !$wide.current.checked &&
          KKuTu.Game.THEMES_WIDE.some((theme) => themes.has(theme));
      }
    }, [themes]);

    return (
      <div className="dialog-themeSelect">
        <div className="body">
          <label className="title" htmlFor="themes-common">
            <input
              ref={$common}
              id="themes-common"
              type="checkbox"
              checked={
                KKuTu.Game.THEMES.every((theme) =>
                  themes.has(theme)
                ) /* Set.prototype.isSubsetOf */
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  for (const theme of KKuTu.Game.THEMES) {
                    themes.add(theme);
                  }
                } else {
                  for (const theme of KKuTu.Game.THEMES) {
                    themes.delete(theme);
                  }
                }
                setThemes(new Set(themes));
              }}
            />
            {L.get("themeSelect_common")}
          </label>
          <section>
            {KKuTu.Game.THEMES.map((theme, index) => (
              <Checkbox
                key={index}
                id={`theme_${theme}`}
                checked={themes.has(theme)}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    themes.add(theme);
                  } else {
                    themes.delete(theme);
                  }
                  setThemes(new Set(themes));
                }}
              >
                {L.get(`theme_${theme}`)}
              </Checkbox>
            ))}
          </section>
          <label className="title" htmlFor="themes-wide">
            <input
              ref={$wide}
              id="themes-wide"
              type="checkbox"
              checked={
                KKuTu.Game.THEMES_WIDE.every((theme) =>
                  themes.has(theme)
                ) /* Set.prototype.isSubsetOf */
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  for (const theme of KKuTu.Game.THEMES_WIDE) {
                    themes.add(theme);
                  }
                } else {
                  for (const theme of KKuTu.Game.THEMES_WIDE) {
                    themes.delete(theme);
                  }
                }
                setThemes(new Set(themes));
              }}
            />
            {L.get("themeSelect_wide")}
          </label>
          <section>
            {KKuTu.Game.THEMES_WIDE.map((theme, index) => (
              <Checkbox
                key={index}
                id={`theme_${theme}`}
                checked={themes.has(theme)}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    themes.add(theme);
                  } else {
                    themes.delete(theme);
                  }
                  setThemes(new Set(themes));
                }}
              >
                {L.get(`theme_${theme}`)}
              </Checkbox>
            ))}
          </section>
        </div>
        <div className="footer buttons">
          <button
            type="button"
            onClick={() => {
              this.onSave([...themes]);
              this.hide();
            }}
          >
            {L.get("ok")}
          </button>
        </div>
      </div>
    );
  }
}
