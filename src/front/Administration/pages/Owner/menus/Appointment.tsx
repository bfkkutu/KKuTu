import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { Spinner } from "front/@global/bayadere/Spinner";
import lCommon from "front/@global/languages/l.common";
import lAdministration from "front/@global/languages/l.administration";
import { Database } from "../../../../../common/Database";
import { enumValues } from "../../../../../common/Utility";
import Checkbox from "front/@block/Checkbox";

export default function Appointment() {
  const { l } = useLexicon(lCommon, lAdministration);
  const [id, setId] = useState("");
  const [departures, setDepartures] = useState<number>(Database.Departure.None);
  const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

  return (
    <article className="page-owner appointment">
      <h2>{l("departure1_menu0")}</h2>
      <form>
        <div className="query">
          <input value={id} onChange={(e) => setId(e.currentTarget.value)} />
          <button
            type="button"
            onClick={async () => {
              show();
              const params = new URLSearchParams();
              params.set("id", id);
              const res = await fetch(`/admin/owner/appointment?${params}`, {
                method: "GET",
              });
              hide();
              if (res.status !== 200) {
                window.alert(l("error", res.status));
              }
              const { departures } = await res.json();
              setDepartures(departures);
            }}
          >
            {l("query")}
          </button>
        </div>
        <label className="checkbox-group">
          {enumValues(Database.Departure).map((departure, index) => {
            if (departure === Database.Departure.None) {
              return null;
            }

            return (
              <Checkbox
                key={index}
                id={`checkbox-departure${departure}`}
                className="checkbox"
                checked={Boolean(departures & departure)}
                onChange={(e) =>
                  setDepartures(
                    e.currentTarget.checked
                      ? departures | departure
                      : departures ^ departure
                  )
                }
              >
                {l("departure", departure)}
              </Checkbox>
            );
          })}
        </label>
        <button
          type="button"
          onClick={async () => {
            show();
            const res = await fetch("/admin/owner/appointment", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id,
                departures,
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
    </article>
  );
}
