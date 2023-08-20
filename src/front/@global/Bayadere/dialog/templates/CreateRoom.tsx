import React, { useCallback, useState } from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { WebSocketMessage } from "../../../../../common/WebSocket";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { Game } from "../../../../../common/Game";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import {
  EnumKeyIterator,
  EnumValueIterator,
} from "../../../../../common/Utility";

export const CreateRoomDialog = new DialogTuple(L.get("createRoom"), () => {
  const me = useStore((state) => state.me);
  const socket = useStore((state) => state.socket);
  const hide = useDialogStore((state) => state.hide);
  const [room, setRoom] = useState<Game.RoomConfig>({
    title: L.get("createRoom_title_default", me.nickname),
    password: "",
    limit: 8,
    mode: 0,
    round: 5,
    roundTime: 150,
    rules: Object.values(Game.Rule).reduce((prev, curr) => {
      prev[curr] = false;
      return prev;
    }, {} as Record<Game.Rule, boolean>),
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
            placeholder={L.get("createRoom_title_default", me.nickname)}
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
          <label className="dialog-desc" htmlFor="createRoom-select-roundTime">
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
                      rules: { ...room.rules, [rule]: e.currentTarget.checked },
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
        <button type="button" onClick={() => {}}>
          {L.get("ok")}
        </button>
      </div>
    </>
  );
});
