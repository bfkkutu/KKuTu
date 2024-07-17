import React, { useCallback, useState } from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import Checkbox from "front/@block/Checkbox";
import { useStore } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import ThemeSelectDialog from "front/KKuTu/dialogs/ThemeSelect";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";
import { EnumValueIterator, reduceToTable } from "../../../common/Utility";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class CreateRoomDialog extends Dialog {
  public static readonly instance = new CreateRoomDialog();

  protected override head(): React.ReactElement {
    return <>{L.get("createRoom")}</>;
  }
  protected override body(): React.ReactElement {
    const [score, nickname] = useStore((state) => [
      state.me.score,
      state.me.nickname,
    ]);
    const socket = useStore((state) => state.socket);
    const updateRoom = Room.useStore((state) => state.updateRoom);
    const show = Dialog.useStore((state) => state.show);
    const [room, setRoom] = useState<KKuTu.Room.Settings>({
      title: L.get("roomSettings_title_default", nickname),
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
              {L.get("roomTitle")}
            </label>
            <input
              type="text"
              id="createRoom-title"
              name="title"
              placeholder={L.get("roomSettings_title_default", nickname)}
              value={room.title}
              onChange={updateField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-password">
              {L.get("roomSettings_password")}
            </label>
            <input
              type="password"
              id="createRoom-password"
              name="password"
              placeholder={L.get("roomSettings_password")}
              value={room.password}
              onChange={updateField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-policy">
              {L.get("roomPolicy")}
            </label>
            <div className="checkbox-group">
              {Object.values(KKuTu.Room.Policy).map((policy, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-policy-${policy}`}
                  tooltip={new Tooltip(L.render(`room_policy_${policy}_desc`))}
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
                  {L.get(`room_policy_${policy}`)}
                </Checkbox>
              ))}
            </div>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-limit">
              {L.get("roomLimit")}
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
              {L.get("roomMode")}
            </label>
            <select
              id="createRoom-mode"
              name="mode"
              value={room.mode}
              onChange={updateIntegerField}
            >
              {EnumValueIterator(KKuTu.Game.Mode).map((mode, index) => (
                <option key={index} value={mode}>
                  {L.get(`game_mode_${mode}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-round">
              {L.get("roomRound")}
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
              {L.get("roomRoundTime")}
            </label>
            <select
              id="createRoom-roundTime"
              name="roundTime"
              value={room.roundTime}
              onChange={updateIntegerField}
            >
              {CLIENT_SETTINGS.roundTimes.map((roundTime, index) => (
                <option key={index} value={roundTime}>
                  {L.get("unitSecond", roundTime)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-rules">
              {L.get("roomRules")}
            </label>
            <div className="checkbox-group">
              {KKuTu.Game.MODES[room.mode].rules.map((rule, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-rules-${rule}`}
                  tooltip={new Tooltip(L.get(`game_rule_${rule}_desc`))}
                  checked={room.rules[rule]}
                  onChange={(e) =>
                    update({
                      rules: { ...room.rules, [rule]: e.currentTarget.checked },
                    })
                  }
                >
                  {L.get(`game_rule_${rule}`)}
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
                {L.get("themeSelect")}
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
              const res = await socket.messageReceiver.wait(
                WebSocketMessage.Type.CreateRoom
              );
              this.hide();
              updateRoom(res.room);
            }}
          >
            {L.get("ok")}
          </button>
        </div>
      </div>
    );
  }
}

