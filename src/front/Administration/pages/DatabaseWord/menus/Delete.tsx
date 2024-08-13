import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";
import { Spinner } from "front/@global/bayadere/Spinner";
import { KKuTu } from "../../../../../common/KKuTu";
import { Database } from "common/Database";

function Delete() {
  const { l } = useLexicon(lAdministration);
  const [language, setLanguage] = useState(KKuTu.Game.Language.Korean);

  return (
    <article className="page-databaseWord delete">
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
      <Delete.ByData language={language} />
    </article>
  );
}

namespace Delete {
  interface Props {
    language: KKuTu.Game.Language;
  }
  export function ByData({ language }: Props) {
    const { l } = useLexicon(lCommon, lAdministration);
    const [input, setInput] = useState("");
    const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

    return (
      <form className="form-byData">
        <h2>{l("departure4_menu2_title_byData")}</h2>
        <span>{l("departure4_menu2_desc_byData")}</span>
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
                window.alert(l("error", res.status));
                return;
              }
              const word: Database.Word = await res.json();
              if (
                await window.confirm(
                  l("departure4_menu2_byData_confirm", word.data)
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
                  window.alert(l("alert_saved"));
                } else {
                  window.alert(l("error", res.status));
                }
              }
            }}
          >
            {l("save")}
          </button>
        </div>
      </form>
    );
  }
}

export default Delete;
