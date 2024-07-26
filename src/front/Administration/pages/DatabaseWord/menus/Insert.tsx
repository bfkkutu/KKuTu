import React, { useState } from "react";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Spinner } from "front/@global/Bayadere/Spinner";
import { KKuTu } from "../../../../../common/KKuTu";
import API from "common/API";

function Insert() {
  return (
    <article className="page-databaseWord-insert">
      <Insert.Direct />
      <h2>{L.get("departure4_menu0_title_fromList")}</h2>
    </article>
  );
}

namespace Insert {
  export function Direct() {
    const [language, setLanguage] = useState(KKuTu.Game.Language.Korean);
    const [word, setWord] = useState<API.POST["/admin/database/word"]["word"]>({
      data: "",
      means: { "0": [""] },
    });
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form>
        <h2>{L.get("departure4_menu0_title_direct")}</h2>
        <label className="wrapper">
          <label htmlFor="select-language">{L.get("language")}</label>
          <select
            id="select-language"
            value={language}
            onChange={(e) =>
              setLanguage(e.currentTarget.value as KKuTu.Game.Language)
            }
          >
            {KKuTu.Game.LANGUAGES.map((language, index) => (
              <option key={index} value={language}>
                {L.get(`language_${language}`)}
              </option>
            ))}
          </select>
        </label>
        <input
          placeholder={L.get("departure4_menu0_direct_wordPlaceholder")}
          value={word.data}
          onChange={(e) => setWord({ ...word, data: e.currentTarget.value })}
        />
        <ul className="themes">
          <li className="theme-item">
            <span>{L.get("departure4_theme")}</span>
            <span>{L.get("departure4_mean")}</span>
          </li>
          {Object.entries(word.means).map(([theme, means], j) => (
            <li key={j} className="theme-item">
              <select
                value={theme}
                onChange={(e) => {
                  if (e.currentTarget.value in word.means) {
                    window.alert(
                      L.render("departure4_menu0_errorAlreadyExist")
                    );
                    return;
                  }
                  const next = { ...word };
                  next.means[e.currentTarget.value] = next.means[theme];
                  delete next.means[theme];
                  setWord(next);
                }}
              >
                {[...KKuTu.Game.THEMES, ...KKuTu.Game.THEMES_WIDE].map(
                  (theme, index) => (
                    <option key={index} value={theme}>
                      {L.get(`theme_${theme}`)}
                    </option>
                  )
                )}
              </select>
              <ul className="means">
                {means.map((mean, k) => (
                  <li key={k} className="mean-item">
                    <input
                      placeholder={L.get(
                        "departure4_menu0_direct_meanPlaceholder"
                      )}
                      value={mean}
                      onChange={(e) => {
                        const next = { ...word };
                        next.means[theme][k] = e.currentTarget.value;
                        setWord(next);
                      }}
                    />
                    <button
                      type="button"
                      disabled={means.length === 1}
                      onClick={() => {
                        const next = [...word.means[theme]];
                        next.splice(k, 1);
                        setWord({
                          ...word,
                          means: {
                            ...word.means,
                            [theme]: next,
                          },
                        });
                      }}
                    >
                      {L.render("departure4_menu0_direct_remove")}
                    </button>
                  </li>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setWord({
                      ...word,
                      means: {
                        ...word.means,
                        [theme]: [...word.means[theme], ""],
                      },
                    })
                  }
                >
                  {L.render("departure4_menu0_direct_addMean")}
                </button>
              </ul>
            </li>
          ))}
          <button
            type="button"
            onClick={async () => {
              const theme = await prompt();
              if (theme === null) {
                return;
              }
              if (theme in word.means) {
                window.alert(L.render("departure4_menu0_errorAlreadyExist"));
                return;
              }
              setWord({
                ...word,
                means: {
                  ...word.means,
                  [theme]: [""],
                },
              });
            }}
          >
            {L.render("departure4_menu0_direct_addTheme")}
          </button>
        </ul>
        <button
          type="button"
          disabled={word.data.length === 0}
          onClick={async () => {
            if (!(await window.confirm(L.render("alert_save")))) {
              return;
            }
            show();
            try {
              await fetch("/admin/database/word", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  language,
                  word,
                }),
              });
              window.alert(L.get("alert_saved"));
            } catch (e) {
              const { status } = e as Response;
              window.alert(L.render(`error_${status}`));
            } finally {
              hide();
            }
          }}
        >
          {L.get("save")}
        </button>
      </form>
    );
  }
  export function FromList() {}

  async function prompt() {
    const themePromptDialog = new ThemePromptDialog();
    Dialog.useStore.getState().show(themePromptDialog);
    return await themePromptDialog.wait;
  }
  class ThemePromptDialog extends Dialog.Asynchronous<string | null> {
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
                    {L.get(`theme_${theme}`)}
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
}

export default Insert;
