import React, { useCallback, useState } from "react";
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
import { getLevel } from "front/@global/Utility";

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
    const [room, setRoom] = useState<KKuTu.Room.Settings>({
      title: L.get("createRoom_title_default", nickname),
      password: "",
      policy: Object.values(KKuTu.Room.Policy).reduce((prev, curr) => {
        prev[curr] = false;
        return prev;
      }, {} as Record<KKuTu.Room.Policy, boolean>),
      limit: 8,
      mode: 0,
      round: 5,
      roundTime: 120,
      rules: Object.values(KKuTu.Game.Rule).reduce((prev, curr) => {
        prev[curr] = false;
        return prev;
      }, {} as Record<KKuTu.Game.Rule, boolean>),
    });

    const updateField = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setRoom({
          ...room,
          [name]: value,
        });
      },
      [room]
    );
    const updateIntegerField = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setRoom({
          ...room,
          [name]: parseInt(value),
        });
      },
      [room]
    );

    return (
      <div className="dialog-createRoom">
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
              value={room.title}
              onChange={updateField}
            />
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-input-password">
              {L.get("createRoom_password")}
            </label>
            <input
              type="password"
              id="createRoom-input-password"
              name="password"
              placeholder={L.get("createRoom_password")}
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
                    setRoom({
                      ...room,
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
            <label className="dialog-desc" htmlFor="createRoom-input-limit">
              {L.get("roomLimit")}
            </label>
            <input
              type="number"
              id="createRoom-input-limit"
              name="limit"
              min={2}
              max={8}
              value={room.limit}
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
            <label className="dialog-desc" htmlFor="createRoom-input-round">
              {L.get("roomRound")}
            </label>
            <input
              type="number"
              id="createRoom-input-round"
              name="round"
              min={1}
              max={10}
              value={room.round}
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
              {KKuTu.Game.modes[room.mode].rules.map((rule, index) => (
                <Checkbox
                  key={index}
                  id={`createRoom-rules-${rule}`}
                  tooltip={new Tooltip(L.get(`game_rule_${rule}_desc`))}
                  checked={room.rules[rule]}
                  onChange={(e) =>
                    setRoom({
                      ...room,
                      rules: { ...room.rules, [rule]: e.currentTarget.checked },
                    })
                  }
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

