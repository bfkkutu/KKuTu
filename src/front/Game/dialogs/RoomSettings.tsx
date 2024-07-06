import React, { useCallback, useRef, useState } from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import Checkbox from "front/@block/Checkbox";
import { useStore } from "front/Game/Store";
import { Room } from "front/Game/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";
import { EnumValueIterator } from "../../../common/Utility";
import { CLIENT_SETTINGS } from "back/utils/Utility";

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
    const socket = useStore((state) => state.socket);
    const nickname = useStore((state) => state.me.nickname);
    const room = Room.useStore((state) => state.room!);
    const [settings, setSettings] = useState<KKuTu.Room.Settings>({
      title: room.title,
      password: "",
      policy: room.policy,
      limit: room.limit,
      mode: room.mode,
      round: room.round,
      roundTime: room.roundTime,
      rules: room.rules,
    });

    const changed = useRef(new Set<string>());

    const updateIntegerField = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        changed.current.add(name);
        setSettings({
          ...settings,
          [name]: parseInt(value),
        });
      },
      [settings]
    );

    return (
      <div className="dialog-roomSettings">
        <form className="body">
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-input-title">
              {L.get("roomTitle")}
            </label>
            <input
              type="text"
              id="createRoom-input-title"
              name="title"
              placeholder={L.get("createRoom_title_default", nickname)}
              value={settings.title}
              onChange={(e) => {
                changed.current.add("title");
                setSettings({ ...settings, title: e.currentTarget.value });
              }}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-button-password">
              {L.get("createRoom_password")}
            </label>
            <button
              type="button"
              id="createRoom-button-password"
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
                setSettings({ ...settings, password: sha256(password) });
              }}
            >
              {L.get("change")}
            </button>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-policy">
              {L.get("roomPolicy")}
            </label>
            <div className="checkbox-group">
              {KKuTu.Room.POLICY_CHANGEABLE.map((policy, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-policy-${policy}`}
                  tooltip={new Tooltip(L.render(`room_policy_${policy}_desc`))}
                  checked={settings.policy[policy]}
                  onChange={(e) => {
                    changed.current.add("policy");
                    setSettings({
                      ...settings,
                      policy: {
                        ...settings.policy,
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
            <label className="dialog-desc" htmlFor="createRoom-input-limit">
              {L.get("roomLimit")}
            </label>
            <input
              type="number"
              id="createRoom-input-limit"
              name="limit"
              min={2}
              max={8}
              value={settings.limit}
              onChange={updateIntegerField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-select-mode">
              {L.get("roomMode")}
            </label>
            <select
              id="createRoom-select-mode"
              name="mode"
              value={settings.mode}
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
            <label className="dialog-desc" htmlFor="createRoom-input-round">
              {L.get("roomRound")}
            </label>
            <input
              type="number"
              id="createRoom-input-round"
              name="round"
              min={1}
              max={10}
              value={settings.round}
              onChange={updateIntegerField}
            />
          </label>
          <label className="item-wrapper">
            <label
              className="dialog-desc"
              htmlFor="createRoom-select-roundTime"
            >
              {L.get("roomRoundTime")}
            </label>
            <select
              id="createRoom-select-roundTime"
              name="roundTime"
              value={settings.roundTime}
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
              {KKuTu.Game.modes[settings.mode].rules.map((rule, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-rules-${rule}`}
                  tooltip={new Tooltip(L.get(`game_rule_${rule}_desc`))}
                  checked={settings.rules[rule]}
                  onChange={(e) => {
                    changed.current.add("rules");
                    setSettings({
                      ...settings,
                      rules: {
                        ...settings.rules,
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
        </form>
        <div className="footer buttons">
          <button
            type="button"
            onClick={async () => {
              if (changed.current.size !== 0) {
                socket.send(WebSocketMessage.Type.UpdateRoom, {
                  settings: Object.fromEntries(
                    Object.entries(settings).filter(([key]) =>
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

