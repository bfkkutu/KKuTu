import React from "react";

import L from "front/@global/Language";
import LevelIcon from "front/@block/LevelIcon";
import Moremi from "front/@block/Moremi";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import { useStore } from "front/Game/Store";
import { getLevel } from "front/@global/Utility";
import { createProfileDialog } from "front/Game/dialogs/Profile";
import Gauge from "front/@block/Gauge";
import { Dialog } from "front/@global/Bayadere/Dialog";

export namespace Profile {
  export function Box() {
    const me = useStore((state) => state.me);
    const toggle = Dialog.useStore((state) => state.toggle);
    const dialog = createProfileDialog(me);

    const level = getLevel(me.score);
    const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
    const goal = CLIENT_SETTINGS.expTable[level - 1];

    return (
      <section
        id="box-profile"
        className="product"
        onClick={() => toggle(dialog)}
      >
        <h5 className="product-title">{L.render("profileBox_title")}</h5>
        <div className="product-body">
          <Moremi equipment={me.equipment} />
          <div className="stat">
            <LevelIcon className="level" level={level} />
            <div className="name ellipse">{me.nickname}</div>
            <div className="record">{L.render("stat_record", 0)}</div>
            <div className="money">{L.render("stat_money", me.money)}</div>
          </div>
          <div className="level">
            {L.get("level")} {level}
          </div>
          <Gauge value={me.score - prev} max={goal - prev} />
        </div>
      </section>
    );
  }
}
