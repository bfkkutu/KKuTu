import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";
import ThemePromptDialog from "front/Administration/pages/DatabaseWord/ThemePromptDialog";
import { renderTheme } from "front/Administration/pages/DatabaseWord/Utility";
import { KKuTu } from "../../../../common/KKuTu";
import type { Database } from "common/Database";

type Word = Omit<Database.Word, "id">;
interface Props {
  value: Word;
  onChange: (value: Partial<Word>) => void;
}
export default function WordEditor(props: Props) {
  const { l } = useLexicon(lCommon, lAdministration);

  return (
    <div className="word-editor">
      <ul className="themes">
        <li className="theme-item title">
          <span>{l("departure4_theme")}</span>
          <span>{l("departure4_mean")}</span>
        </li>
        {Object.entries(props.value.means).map(([theme, means], j) => (
          <li key={j} className="theme-item">
            <select
              value={theme}
              onChange={(e) => {
                if (e.currentTarget.value in props.value.means) {
                  window.alert(
                    l("departure4_wordEditor_errorThemeAlreadyExist")
                  );
                  return;
                }
                const means = { ...props.value.means };
                means[e.currentTarget.value] = means[theme];
                delete means[theme];
                props.onChange({ means });
              }}
            >
              {[...KKuTu.Game.THEMES, ...KKuTu.Game.THEMES_WIDE].map(
                (theme, index) => (
                  <option key={index} value={theme}>
                    {renderTheme(l, theme)}
                  </option>
                )
              )}
            </select>
            <ul className="means">
              {means.map((mean, k) => (
                <li key={k} className="mean-item">
                  <input
                    placeholder={l("departure4_wordEditor_meanPlaceholder")}
                    value={mean}
                    onChange={(e) => {
                      const means = { ...props.value.means };
                      means[theme][k] = e.currentTarget.value;
                      props.onChange({
                        means,
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...props.value.means };
                      if (means.length === 1) {
                        if (Object.keys(next).length === 1) {
                          window.alert(
                            l("departure4_wordEditor_errorThemeShouldExist")
                          );
                          return;
                        } else {
                          delete next[theme];
                        }
                      } else {
                        next[theme].splice(k, 1);
                      }
                      props.onChange({
                        means: next,
                      });
                    }}
                  >
                    {l("icon_remove")}
                  </button>
                </li>
              ))}
              <button
                type="button"
                onClick={() =>
                  props.onChange({
                    means: {
                      ...props.value.means,
                      [theme]: [...props.value.means[theme], ""],
                    },
                  })
                }
              >
                {l("departure4_wordEditor_addMean")}
              </button>
            </ul>
          </li>
        ))}
        <button
          type="button"
          onClick={async () => {
            const theme = await selectTheme();
            if (theme === null) {
              return;
            }
            if (theme in props.value.means) {
              window.alert(l("departure4_wordEditor_errorThemeAlreadyExist"));
              return;
            }
            props.onChange({
              means: {
                ...props.value.means,
                [theme]: [""],
              },
            });
          }}
        >
          {l("departure4_wordEditor_addTheme")}
        </button>
      </ul>
    </div>
  );
}

async function selectTheme(): Promise<string | null> {
  const themePromptDialog = new ThemePromptDialog();
  Dialog.useStore.getState().show(themePromptDialog);
  return await themePromptDialog.wait;
}
