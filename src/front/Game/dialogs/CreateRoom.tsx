import React, { useCallback, useState } from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import RuleSelector from "front/Game/blocks/RuleSelector";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Room } from "front/Game/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";
import { EnumValueIterator } from "../../../common/Utility";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class CreateRoomDialog extends Dialog {
  public static instance = new CreateRoomDialog();

  public override head(): React.ReactElement {
    return <>{L.get("createRoom")}</>;
  }
  public override body(): React.ReactElement {
    const nickname = useStore((state) => state.me.nickname);
    const socket = useStore((state) => state.socket);
    const updateRoom = Room.useStore((state) => state.updateRoom);
    const hide = Dialog.useStore((state) => state.hide);
    const [room, setRoom] = useState<KKuTu.Room.Settings>({
      title: L.get("createRoom_title_default", nickname),
      password: "",
      limit: 8,
      mode: 0,
      round: 5,
      roundTime: 120,
      rules: Object.values(KKuTu.Game.Rule).reduce((prev, curr) => {
        prev[curr] = false;
        return prev;
      }, {} as Record<KKuTu.Game.Rule, boolean>),
    });

    const update = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setRoom({
          ...room,
          [name]: value,
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
              onChange={update}
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
              onChange={update}
            />
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
              onChange={update}
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
              onChange={update}
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
              onChange={update}
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
              onChange={update}
            >
              {CLIENT_SETTINGS.roundTimes.map((roundTime) => (
                <option value={roundTime}>
                  {L.get("unitSecond", roundTime)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-rules">
              {L.get("roomRules")}
            </label>
            <RuleSelector room={room} setter={setRoom} />
          </label>
        </form>
        <div className="footer">
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
              hide(this);
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
