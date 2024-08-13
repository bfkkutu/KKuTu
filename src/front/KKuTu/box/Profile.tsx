import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { getLevel } from "front/@global/Utility";
import { Dialog } from "front/@global/bayadere/Dialog";
import lKKuTu from "front/@global/languages/l.kkutu";
import LevelIcon from "front/@block/LevelIcon";
import Moremi from "front/@block/Moremi";
import Gauge from "front/@block/Gauge";
import { useStore } from "front/KKuTu/Store";
import ProfileDialog from "front/KKuTu/dialogs/Profile";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export namespace Profile {
  export function Box() {
    const { l } = useLexicon(lKKuTu);
    const me = useStore((state) => state.me);
    const toggle = Dialog.useStore((state) => state.toggle);

    const dialog = new ProfileDialog(me);
    const level = getLevel(me.score);
    const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
    const goal = CLIENT_SETTINGS.expTable[level - 1];

    return (
      <section
        id="box-profile"
        className="product"
        onClick={() => toggle(dialog)}
      >
        <h5 className="product-title">{l("profileBox_title")}</h5>
        <div className="product-body">
          <Moremi equipment={me.equipment} />
          <div className="stat">
            <LevelIcon className="level" level={level} />
            <div className="name ellipse">{me.nickname}</div>
            <div className="record">{l("stat_record", 0)}</div>
            <div className="money">{l("stat_money", me.money)}</div>
          </div>
          <div className="level">{l("unitLevel", level)}</div>
          <Gauge
            className="gauge-score"
            value={me.score - prev}
            max={goal - prev}
            width={190}
            height={30}
          />
        </div>
      </section>
    );
  }
}

