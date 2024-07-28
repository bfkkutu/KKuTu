import React, { useState } from "react";

import L from "front/@global/Language";
import { Spinner } from "front/@global/Bayadere/Spinner";
import { Database } from "../../../../../common/Database";
import { EnumValueIterator } from "../../../../../common/Utility";
import Checkbox from "front/@block/Checkbox";

export default function Appointment() {
  const [id, setId] = useState("");
  const [departures, setDepartures] = useState<number>(Database.Departure.None);
  const [show, hide] = Spinner.useStore((state) => [state.show, state.hide]);

  return (
    <article className="page-owner-appointment">
      <h2>{L.get("departure1_menu0")}</h2>
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
                window.alert(L.get(`error_${res.status}`));
              }
              const { departures } = await res.json();
              setDepartures(departures);
            }}
          >
            {L.get("query")}
          </button>
        </div>
        <label className="checkbox-group">
          {EnumValueIterator(Database.Departure).map((departure, index) => {
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
                {L.get(`departure${departure}`)}
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
              window.alert(L.get("alert_saved"));
            } else {
              window.alert(L.get(`error_${res.status}`));
            }
          }}
        >
          {L.get("save")}
        </button>
      </form>
    </article>
  );
}
