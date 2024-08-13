import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { Spinner } from "front/@global/bayadere/Spinner";
import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";
import Checkbox from "front/@block/Checkbox";
import WordEditor from "front/Administration/pages/DatabaseWord/WordEditor";
import { renderTheme } from "front/Administration/pages/DatabaseWord/Utility";
import { KKuTu } from "../../../../../common/KKuTu";
import API from "common/API";

function Insert() {
  const { l } = useLexicon(lAdministration);
  const [language, setLanguage] = useState(KKuTu.Game.Language.Korean);

  return (
    <article className="page-databaseWord insert">
      <span>{l("departure4_desc_language")}</span>
      <label className="wrapper">
        <label htmlFor="select-language">{l("language")}</label>
        <select
          id="select-language"
          value={language}
          onChange={(e) =>
            setLanguage(e.currentTarget.value as KKuTu.Game.Language)
          }
        >
          {KKuTu.Game.LANGUAGES.map((language, index) => (
            <option key={index} value={language}>
              {l("language", language)}
            </option>
          ))}
        </select>
      </label>
      <Insert.Direct language={language} />
      <Insert.FromList language={language} />
    </article>
  );
}

namespace Insert {
  interface Props {
    language: KKuTu.Game.Language;
  }
  export function Direct({ language }: Props) {
    const { l } = useLexicon(lCommon, lAdministration);
    const [word, setWord] = useState<
      State<API.POST["/admin/database/word"]["word"]>
    >({
      data: "",
      means: { "0": [""] },
    });
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="form-direct">
        <h2>{l("departure4_menu0_title_direct")}</h2>
        <span>{l("departure4_menu0_desc_direct")}</span>
        <input
          placeholder={l("departure4_menu0_direct_wordPlaceholder")}
          value={word.data}
          onChange={(e) => setWord({ ...word, data: e.currentTarget.value })}
        />
        <WordEditor
          value={word}
          onChange={(value) => setWord({ ...word, ...value })}
        />
        <button
          type="button"
          disabled={word.data.length === 0}
          onClick={async () => {
            if (!(await window.confirm(l("alert_save")))) {
              return;
            }
            show();
            const res = await fetch("/admin/database/word", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                language,
                word,
              }),
            });
            hide();
            if (res.status === 200) {
              window.alert(l("alert_saved"));
            } else {
              window.alert(l("error", res.status));
            }
          }}
        >
          {l("save")}
        </button>
      </form>
    );
  }
  export function FromList({ language }: Props) {
    const { l } = useLexicon(lCommon, lAdministration);
    const [theme, setTheme] = useState("0");
    const [legacy, setLegacy] = useState(false);
    const [words, setWords] = useState<string[]>([]);
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="form-fromList">
        <h2>{l("departure4_menu0_title_fromList")}</h2>
        <span>{l("departure4_menu0_desc_fromList")}</span>
        <label className="wrapper">
          <label>{l("departure4_theme")}</label>
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
        </label>
        <Checkbox
          id="checkbox-legacy"
          className="checkbox"
          checked={legacy}
          onChange={(e) => setLegacy(e.currentTarget.checked)}
        >
          {l("departure4_menu0_fromList_legacyView")}
        </Checkbox>
        {legacy ? (
          <textarea
            rows={20}
            value={words.join("\n")}
            onChange={(e) => setWords(e.currentTarget.value.split("\n"))}
          />
        ) : (
          <ul>
            {words.map((word, index) => (
              <li key={index}>
                <input
                  value={word}
                  onChange={(e) => {
                    const next = [...words];
                    next[index] = e.currentTarget.value;
                    setWords(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = [...words];
                    next.splice(index, 1);
                    setWords(next);
                  }}
                >
                  {l("icon_remove")}
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => setWords([...words, ""])}>
                {l("departure4_menu0_fromList_addWord")}
              </button>
            </li>
          </ul>
        )}
        <button
          type="button"
          disabled={words.length === 0}
          onClick={async () => {
            if (!(await window.confirm(l("alert_save")))) {
              return;
            }
            show();
            const res = await fetch("/admin/database/words", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                language,
                theme,
                words,
              }),
            });
            hide();
            if (res.status === 200) {
              window.alert(l("alert_saved"));
            } else {
              window.alert(l("error", res.status));
            }
          }}
        >
          {l("save")}
        </button>
      </form>
    );
  }
}

export default Insert;
