import React, { useCallback, useState } from "react";
import { useLexicon } from "@daldalso/i18n";
import sha256 from "sha256";

import { Dialog } from "front/@global/bayadere/Dialog";
import { Tooltip } from "front/@global/bayadere/Tooltip";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import Checkbox from "front/@block/Checkbox";
import { useSocket, useStore } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import ThemeSelectDialog from "front/KKuTu/dialogs/ThemeSelect";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";
import { enumValues, reduceToTable } from "../../../common/Utility";

export default class CreateRoomDialog extends Dialog {
  public static readonly instance = new CreateRoomDialog();

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);

    return <>{l("createRoom")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const [score, nickname] = useStore((state) => [
      state.me.score,
      state.me.nickname,
    ]);
    const updateRoom = Room.useStore((state) => state.update);
    const show = Dialog.useStore((state) => state.show);
    const [room, setRoom] = useState<State<KKuTu.Room.Settings>>({
      title: l("roomSettings_title_default", nickname),
      password: "",
      policy: reduceToTable(Object.values(KKuTu.Room.Policy), () => false),
      limit: 8,
      mode: 0,
      round: 5,
      roundTime: 120,
      rules: reduceToTable(Object.values(KKuTu.Game.Rule), () => false),
      themes: [],
    });

    const themeSelectDialog = new ThemeSelectDialog(room.themes, (themes) =>
      update({ themes })
    );

    const update = useCallback(
      (settings: Partial<KKuTu.Room.Settings>) =>
        setRoom({ ...room, ...settings }),
      [room]
    );
    const updateField = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.currentTarget;
      update({
        [name]: value,
      });
    };
    const updateIntegerField = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.currentTarget;
      update({
        [name]: parseInt(value),
      });
    };

    return (
      <div className="dialog-createRoom">
        <form className="body">
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-title">
              {l("roomTitle")}
            </label>
            <input
              type="text"
              id="createRoom-title"
              name="title"
              placeholder={l("roomSettings_title_default", nickname)}
              value={room.title}
              onChange={updateField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-password">
              {l("roomSettings_password")}
            </label>
            <input
              type="password"
              id="createRoom-password"
              name="password"
              placeholder={l("roomSettings_password")}
              value={room.password}
              onChange={updateField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-policy">
              {l("roomPolicy")}
            </label>
            <div className="checkbox-group">
              {Object.values(KKuTu.Room.Policy).map((policy, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-policy-${policy}`}
                  tooltip={new Tooltip(l(`room_policy_${policy}_desc`))}
                  checked={room.policy[policy]}
                  onChange={(e) =>
                    update({
                      policy: {
                        ...room.policy,
                        [policy]: e.currentTarget.checked,
                      },
                    })
                  }
                  disabled={
                    policy === KKuTu.Room.Policy.Newbie &&
                    score >= KKuTu.NEWBIE_SCORE
                  }
                >
                  {l(`room_policy_${policy}`)}
                </Checkbox>
              ))}
            </div>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-limit">
              {l("roomLimit")}
            </label>
            <input
              type="number"
              id="createRoom-limit"
              name="limit"
              min={2}
              max={8}
              value={room.limit}
              onChange={updateIntegerField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-mode">
              {l("roomMode")}
            </label>
            <select
              id="createRoom-mode"
              name="mode"
              value={room.mode}
              onChange={updateIntegerField}
            >
              {enumValues(KKuTu.Game.Mode).map((mode, index) => (
                <option key={index} value={mode}>
                  {l("game_mode", mode)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-round">
              {l("roomRound")}
            </label>
            <input
              type="number"
              id="createRoom-round"
              name="round"
              min={1}
              max={10}
              value={room.round}
              onChange={updateIntegerField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-roundTime">
              {l("roomRoundTime")}
            </label>
            <select
              id="createRoom-roundTime"
              name="roundTime"
              value={room.roundTime}
              onChange={updateIntegerField}
            >
              {KKuTu.Game.ROUND_TIMES.map((roundTime, index) => (
                <option key={index} value={roundTime}>
                  {l("unitSecond", roundTime)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-rules">
              {l("roomRules")}
            </label>
            <div className="checkbox-group">
              {KKuTu.Game.MODES[room.mode].rules.map((rule, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-rules-${rule}`}
                  tooltip={new Tooltip(l("game_rule_desc", rule))}
                  checked={room.rules[rule]}
                  onChange={(e) =>
                    update({
                      rules: { ...room.rules, [rule]: e.currentTarget.checked },
                    })
                  }
                >
                  {l("game_rule", rule)}
                </Checkbox>
              ))}
            </div>
          </label>
          {KKuTu.Game.MODES[room.mode].themeSelect ? (
            <label className="item-wrapper">
              <label
                className="dialog-desc"
                htmlFor="createRoom-themes"
              ></label>
              <button
                type="button"
                id="createRoom-themes"
                onClick={() => show(themeSelectDialog)}
              >
                {l("themeSelect")}
              </button>
            </label>
          ) : null}
        </form>
        <div className="footer buttons">
          <button
            type="button"
            onClick={async () => {
              socket.send(WebSocketMessage.Type.CreateRoom, {
                room: {
                  ...room,
                  password: sha256(room.password),
                },
              });
              try {
                const res = await socket.messageReceiver.wait(
                  WebSocketMessage.Type.CreateRoom
                );
                this.hide();
                updateRoom(res.room);
              } catch (e) {
                window.alert(l("error_roomInvalid"));
              }
            }}
          >
            {l("ok")}
          </button>
        </div>
      </div>
    );
  }
}

