import React, { useState } from "react";

import L from "front/@global/Language";
import { Spinner } from "front/@global/Bayadere/Spinner";
import { renderTheme } from "front/Administration/pages/DatabaseWord/Utility";
import { KKuTu } from "../../../../../common/KKuTu";
import { EnumValueIterator } from "../../../../../common/Utility";
import API from "../../../../../common/API";
import { Database } from "common/Database";

function Query() {
  const [language, setLanguage] = useState(KKuTu.Game.Language.Korean);

  return (
    <article className="page-databaseWord-query">
      <span>{L.get("departure4_desc_language")}</span>
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
    const [input, setInput] = useState("");
    const [type, setType] = useState(API.QueryType.Exact);
    const [result, setResult] = useState<Database.Word[]>([]);
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="query-byData">
        <h2>{L.get("departure4_menu1_title_byData")}</h2>
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
            {EnumValueIterator(API.QueryType).map((type, index) => (
              <option key={index} value={type}>
                {L.get(`queryType${type}`)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={async () => {
              if (input.length === 0) {
                window.alert(L.get("departure4_menu1_errorNoInput"));
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
                window.alert(L.render(`error_${res.status}`));
              }
              setResult(await res.json());
            }}
          >
            {L.get("departure4_menu1_byData_search")}
          </button>
        </div>
        {result.length === 0 ? (
          <div className="result">
            {L.get("departure4_menu1_byData_noResult")}
          </div>
        ) : (
          <div className="result">
            <div className="result-item title">
              <span>#</span>
              <span>{L.get("departure4_word")}</span>
              <span>{L.get("departure4_mean")}</span>
            </div>
            <ul className="result-list">
              {result.map((word, index) => (
                <li key={index} className="result-item">
                  <span>{word.id}</span>
                  <span>{word.data}</span>
                  <ul>
                    {Object.entries(word.means).map(([theme, means], index) => (
                      <li key={index}>
                        <span>〈{renderTheme(theme)}〉</span>
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
    return (
      <form className="query-update">
        <h2>{L.get("departure4_menu1_title_update")}</h2>
      </form>
    );
  }
}

export default Query;
