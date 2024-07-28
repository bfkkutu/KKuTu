import React, { useState } from "react";

import L from "front/@global/Language";
import { Spinner } from "front/@global/Bayadere/Spinner";
import { KKuTu } from "../../../../../common/KKuTu";
import { Database } from "common/Database";

function Delete() {
  const [language, setLanguage] = useState(KKuTu.Game.Language.Korean);

  return (
    <article className="page-databaseWord-delete">
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
      <Delete.ByData language={language} />
    </article>
  );
}

namespace Delete {
  interface Props {
    language: KKuTu.Game.Language;
  }
  export function ByData({ language }: Props) {
    const [input, setInput] = useState("");
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="delete-byData">
        <h2>{L.get("departure4_menu2_title_byData")}</h2>
        <span>{L.render("departure4_menu2_desc_byData")}</span>
        <div>
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <button
            type="button"
            onClick={async () => {
              show();
              const params = new URLSearchParams();
              params.set("language", language);
              params.set("data", input);
              const res = await fetch(`/admin/database/word?${params}`, {
                method: "GET",
              });
              hide();
              if (res.status !== 200) {
                window.alert(L.get(`error_${res.status}`));
                return;
              }
              const word: Database.Word = await res.json();
              if (
                await window.confirm(
                  L.render("departure4_menu2_byData_confirm", word.data)
                )
              ) {
                show();
                const res = await fetch("/admin/database/word", {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    language,
                    id: word.id,
                  }),
                });
                hide();
                if (res.status === 200) {
                  window.alert(L.get("alert_saved"));
                } else {
                  window.alert(L.get(`error_${res.status}`));
                }
              }
            }}
          >
            {L.get("save")}
          </button>
        </div>
      </form>
    );
  }
}

export default Delete;
