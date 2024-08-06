import React, { useCallback, useRef, useState } from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import Checkbox from "front/@block/Checkbox";
import { useSocket, useStore } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import ThemeSelectDialog from "front/KKuTu/dialogs/ThemeSelect";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";
import { enumValues } from "../../../common/Utility";

export default class RoomSettingsDialog extends Dialog {
  public static readonly instance = new RoomSettingsDialog();

  public override initialize(): void {
    super.initialize();

    const unsubscribe = Room.useStore.subscribe((state) => {
      if (state.room === undefined) {
        this.hide();
        unsubscribe();
      }
    });
  }
  protected override head(): React.ReactElement {
    return <>{L.get("roomSettings")}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useSocket((state) => state.socket);
    const nickname = useStore((state) => state.me.nickname);
    const data = Room.useStore((state) => state.room!);
    const show = Dialog.useStore((state) => state.show);
    const [room, setRoom] = useState<State<KKuTu.Room.Settings>>({
      title: data.title,
      password: "",
      policy: data.policy,
      limit: data.limit,
      mode: data.mode,
      round: data.round,
      roundTime: data.roundTime,
      rules: data.rules,
      themes: data.themes,
    });

    const changed = useRef(new Set<string>());

    const themeSelectDialog = new ThemeSelectDialog(room.themes, (themes) => {
      changed.current.add("themes");
      update({ themes });
    });

    const update = useCallback(
      (settings: Partial<KKuTu.Room.Settings>) =>
        setRoom({ ...room, ...settings }),
      [room]
    );
    const updateIntegerField = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.currentTarget;
      changed.current.add(name);
      update({
        [name]: parseInt(value),
      });
    };

    return (
      <div className="dialog-roomSettings">
        <form className="body">
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-title">
              {L.get("roomTitle")}
            </label>
            <input
              type="text"
              id="roomSettings-title"
              name="title"
              placeholder={L.get("roomSettings_title_default", nickname)}
              value={room.title}
              onChange={(e) => {
                changed.current.add("title");
                update({ title: e.currentTarget.value });
              }}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-password">
              {L.get("roomSettings_password")}
            </label>
            <button
              type="button"
              id="roomSettings-password"
              onClick={async () => {
                const password = await window.prompt(
                  L.render("prompt_title_changePassword"),
                  L.render("prompt_changePassword"),
                  "password"
                );
                if (password === null) {
                  return;
                }
                changed.current.add("password");
                update({ password: sha256(password) });
              }}
            >
              {L.get("change")}
            </button>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-policy">
              {L.get("roomPolicy")}
            </label>
            <div className="checkbox-group">
              {KKuTu.Room.POLICY_CHANGEABLE.map((policy, index) => (
                <Checkbox
                  key={index}
                  id={`roomSettings-policy-${policy}`}
                  tooltip={new Tooltip(L.render(`room_policy_${policy}_desc`))}
                  checked={room.policy[policy]}
                  onChange={(e) => {
                    changed.current.add("policy");
                    update({
                      policy: {
                        ...room.policy,
                        [policy]: e.currentTarget.checked,
                      },
                    });
                  }}
                >
                  {L.get(`room_policy_${policy}`)}
                </Checkbox>
              ))}
            </div>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-limit">
              {L.get("roomLimit")}
            </label>
            <input
              type="number"
              id="roomSettings-limit"
              name="limit"
              min={2}
              max={8}
              value={room.limit}
              onChange={updateIntegerField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-mode">
              {L.get("roomMode")}
            </label>
            <select
              id="roomSettings-mode"
              name="mode"
              value={room.mode}
              onChange={updateIntegerField}
            >
              {enumValues(KKuTu.Game.Mode).map((mode, index) => (
                <option key={index} value={mode}>
                  {L.get(`game_mode_${mode}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-round">
              {L.get("roomRound")}
            </label>
            <input
              type="number"
              id="roomSettings-round"
              name="round"
              min={1}
              max={10}
              value={room.round}
              onChange={updateIntegerField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-roundTime">
              {L.get("roomRoundTime")}
            </label>
            <select
              id="roomSettings-roundTime"
              name="roundTime"
              value={room.roundTime}
              onChange={updateIntegerField}
            >
              {KKuTu.Game.ROUND_TIMES.map((roundTime, index) => (
                <option key={index} value={roundTime}>
                  {L.get("unitSecond", roundTime)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="roomSettings-rules">
              {L.get("roomRules")}
            </label>
            <div className="checkbox-group">
              {KKuTu.Game.MODES[room.mode].rules.map((rule, index) => (
                <Checkbox
                  key={index}
                  id={`roomSettings-rules-${rule}`}
                  tooltip={new Tooltip(L.get(`game_rule_${rule}_desc`))}
                  checked={room.rules[rule]}
                  onChange={(e) => {
                    changed.current.add("rules");
                    update({
                      rules: {
                        ...room.rules,
                        [rule]: e.currentTarget.checked,
                      },
                    });
                  }}
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
                htmlFor="roomSettings-themes"
              ></label>
              <button
                type="button"
                id="roomSettings-themes"
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
              if (changed.current.size !== 0) {
                socket.send(WebSocketMessage.Type.UpdateRoom, {
                  settings: Object.fromEntries(
                    Object.entries(room).filter(([key]) =>
                      changed.current.has(key)
                    )
                  ),
                });
                await socket.messageReceiver.wait(
                  WebSocketMessage.Type.UpdateRoom
                );
              }
              this.hide();
            }}
          >
            {L.get("ok")}
          </button>
        </div>
      </div>
    );
  }
}

