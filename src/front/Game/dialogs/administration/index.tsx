import React from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { Database } from "../../../../common/Database";

import ManagementDialog from "front/Game/dialogs/administration/Management";
import DatabaseWordDialog from "front/Game/dialogs/administration/DatabaseWord";
import DatabaseShopDialog from "front/Game/dialogs/administration/DatabaseShop";

export default class AdministrationDialog extends Dialog {
  public static instance = new AdministrationDialog();

  public override head(): React.ReactElement {
    return <>{L.render("administration_title")}</>;
  }
  public override body(): React.ReactElement {
    const departures = useStore((state) => state.me.departures);
    const toggle = Dialog.useStore((state) => state.toggle);

    return (
      <ul className="dialog-administration">
        {departures & Database.Departure.Management ? (
          <li>
            <label>{L.get("administration_management")}</label>
            <button
              onClick={async () => {
                if (ManagementDialog.instance === undefined) {
                  try {
                    const { ws } = await (
                      await window.fetch("/administration/management")
                    ).json();
                    ManagementDialog.instance = new ManagementDialog(ws);
                  } catch (e) {
                    window.alert(L.get("administration_failedToConnect"));
                    return;
                  }
                }
                toggle(ManagementDialog.instance);
              }}
            >
              {L.get("open")}
            </button>
          </li>
        ) : null}
        {departures & Database.Departure.DatabaseWord ? (
          <li>
            <label>{L.get("administration_databaseWord")}</label>
            <button
              onClick={async () => {
                if (DatabaseWordDialog.instance === undefined) {
                  try {
                    const { ws } = await (
                      await window.fetch("/administration/word")
                    ).json();
                    DatabaseWordDialog.instance = new DatabaseWordDialog(ws);
                  } catch (e) {
                    window.alert(L.get("administration_failedToConnect"));
                    return;
                  }
                }
                toggle(DatabaseWordDialog.instance);
              }}
            >
              {L.get("open")}
            </button>
          </li>
        ) : null}
        {departures & Database.Departure.DatabaseShop ? (
          <li>
            <label>{L.get("administration_databaseShop")}</label>
            <button
              onClick={async () => {
                if (DatabaseShopDialog.instance === undefined) {
                  try {
                    const { ws } = await (
                      await window.fetch("/administration/shop")
                    ).json();
                    DatabaseShopDialog.instance = new DatabaseShopDialog(ws);
                  } catch (e) {
                    window.alert(L.get("administration_failedToConnect"));
                    return;
                  }
                }
                toggle(DatabaseShopDialog.instance);
              }}
            >
              {L.get("open")}
            </button>
          </li>
        ) : null}
      </ul>
    );
  }
}
