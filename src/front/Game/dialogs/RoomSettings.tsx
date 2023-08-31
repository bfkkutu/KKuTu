import React, { useCallback, useState } from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { WebSocketMessage } from "../../../common/WebSocket";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { Game } from "../../../common/Game";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import { EnumValueIterator } from "../../../common/Utility";
import { useRoomStore } from "front/Game/box/Room/Store";

export const createRoomSettingsDialog = (config: Game.RoomSettings) => {
  const dialog = new DialogTuple(L.get("roomSettings"), () => {
    const nickname = useStore((state) => state.me.nickname);
    const socket = useStore((state) => state.socket);
    const updateRoom = useRoomStore((state) => state.updateRoom);
    const hide = useDialogStore((state) => state.hide);
    const [room, setRoom] = useState(config);

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
      <>
        <div className="body dialog-createRoom">
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-input-title">
              {L.get("createRoom_title")}
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
              {L.get("createRoom_limit")}
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
              {L.get("createRoom_mode")}
            </label>
            <select
              id="createRoom-select-mode"
              name="mode"
              value={room.mode}
              onChange={update}
            >
              {EnumValueIterator(Game.Mode).map((mode) => (
                <option value={mode}>{L.get(`game_mode_${mode}`)}</option>
              ))}
            </select>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="createRoom-input-round">
              {L.get("createRoom_round")}
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
              {L.get("createRoom_roundTime")}
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
              {L.get("createRoom_rules")}
            </label>
            <div className="checkbox-wrapper">
              {Game.availableRules[room.mode].map((rule) => (
                <label>
                  <input
                    type="checkbox"
                    id={`createRoom-checkbox-${rule}`}
                    checked={room.rules[rule]}
                    onChange={(e) =>
                      setRoom({
                        ...room,
                        rules: {
                          ...room.rules,
                          [rule]: e.currentTarget.checked,
                        },
                      })
                    }
                  />
                  <label htmlFor={`createRoom-checkbox-${rule}`}>
                    {L.get(`game_rule_${rule}`)}
                  </label>
                </label>
              ))}
            </div>
          </label>
        </div>
        <div className="footer">
          <button
            type="button"
            onClick={async () => {
              socket.send(WebSocketMessage.Type.UpdateRoom, {
                room: {
                  ...room,
                  password: sha256(room.password),
                },
              });
              await socket.messageReceiver.wait(
                WebSocketMessage.Type.UpdateRoom
              );
              hide(dialog);
            }}
          >
            {L.get("ok")}
          </button>
        </div>
      </>
    );
  });
  return dialog;
};
