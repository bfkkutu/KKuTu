import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { Spinner } from "front/@global/bayadere/Spinner";
import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";
import WordEditor from "front/Administration/pages/DatabaseWord/WordEditor";
import { renderTheme } from "front/Administration/pages/DatabaseWord/Utility";
import { KKuTu } from "../../../../../common/KKuTu";
import { enumValues } from "../../../../../common/Utility";
import API from "../../../../../common/API";
import { Database } from "common/Database";

function Query() {
  const { l } = useLexicon(lAdministration);
  const [language, setLanguage] = useState(KKuTu.Game.Language.Korean);

  return (
    <article className="page-databaseWord query">
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
      <Query.ByData language={language} />
      <Query.Update language={language} />
    </article>
  );
}

namespace Query {
  interface Props {
    language: KKuTu.Game.Language;
  }
  export function ByData({ language }: Props) {
    const { l } = useLexicon(lCommon, lAdministration);
    const [input, setInput] = useState("");
    const [type, setType] = useState(API.QueryType.Exact);
    const [result, setResult] = useState<Database.Word[]>([]);
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="form-byData">
        <h2>{l("departure4_menu1_title_byData")}</h2>
        <div className="query">
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <select
            value={type}
            onChange={(e) =>
              setType(parseInt(e.currentTarget.value) as API.QueryType)
            }
          >
            {enumValues(API.QueryType).map((type, index) => (
              <option key={index} value={type}>
                {l("queryType", type)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={async () => {
              if (input.length === 0) {
                window.alert(l("departure4_menu1_errorNoInput"));
                return;
              }
              show();
              const params = new URLSearchParams();
              params.set("language", language);
              params.set("type", type.toString());
              params.set("data", input);
              const res = await fetch(`/admin/database/words?${params}`, {
                method: "GET",
              });
              hide();
              if (res.status !== 200) {
                window.alert(l("error", res.status));
              }
              setResult(await res.json());
            }}
          >
            {l("departure4_menu1_byData_search")}
          </button>
        </div>
        {result.length === 0 ? (
          <div className="result">{l("departure4_menu1_byData_noResult")}</div>
        ) : (
          <div className="result">
            <div className="result-item title">
              <span>#</span>
              <span>{l("departure4_word")}</span>
              <span>{l("departure4_mean")}</span>
            </div>
            <ul className="result-list">
              {result.map((word, index) => (
                <li key={index} className="result-item">
                  <span>{word.id}</span>
                  <span>{word.data}</span>
                  <ul>
                    {Object.entries(word.means).map(([theme, means], index) => (
                      <li key={index}>
                        <span>〈{renderTheme(l, theme)}〉</span>
                        <ul>
                          {means.map((mean, index) => (
                            <li key={index}>{mean}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    );
  }
  export function Update({ language }: Props) {
    const { l } = useLexicon(lCommon, lAdministration);
    const [input, setInput] = useState("");
    const [word, setWord] = useState<State<Database.Word>>();
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="form-update">
        <h2>{l("departure4_menu1_title_update")}</h2>
        <div className="query">
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <button
            type="button"
            onClick={async () => {
              if (input.length === 0) {
                window.alert(l("departure4_menu1_errorNoInput"));
                return;
              }
              show();
              const params = new URLSearchParams();
              params.set("language", language);
              params.set("data", input);
              params.set("full", "1");
              const res = await fetch(`/admin/database/word?${params}`, {
                method: "GET",
              });
              hide();
              if (res.status !== 200) {
                window.alert(l("error", res.status));
              }
              setWord(await res.json());
            }}
          >
            {l("query")}
          </button>
        </div>
        {word === undefined ? (
          l("departure4_menu1_update_noResult")
        ) : (
          <WordEditor
            value={word}
            onChange={(value) => setWord({ ...word, ...value })}
          />
        )}
        <button
          type="button"
          onClick={async () => {
            if (!(await window.confirm(l("alert_save")))) {
              return;
            }
            show();
            const res = await fetch("/admin/database/word", {
              method: "PUT",
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
}

export default Query;
