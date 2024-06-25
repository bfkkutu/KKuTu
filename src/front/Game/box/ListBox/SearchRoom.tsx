import React, { useEffect, useState } from "react";

import { useStore } from "front/Game/Store";
import L from "front/@global/Language";
import Mode from "front/@block/Mode";
import { Icon, IconType } from "front/@block/Icon";
import { Room } from "front/Game/box/Room";
import { WebSocketMessage } from "../../../../common/WebSocket";
import { KKuTu } from "../../../../common/KKuTu";
import { EnumValueIterator } from "../../../../common/Utility";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default function SearchRoom() {
  const socket = useStore((state) => state.socket);
  const updateRoom = Room.useStore((state) => state.updateRoom);
  const [rooms, updateRoomList] = useStore((state) => [
    state.rooms,
    state.updateRoomList,
  ]);
  const [room, setRoom] = useState<KKuTu.Room.SearchOptions>({
    title: "",
    mode: 0,
    round: [1, 10],
    roundTime: [10, 150],
    rules: Object.values(KKuTu.Game.Rule).reduce((prev, curr) => {
      prev[curr] = false;
      return prev;
    }, {} as Record<KKuTu.Game.Rule, boolean>),
  });

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoomList,
      ({ rooms }) => updateRoomList(rooms)
    );
    return () =>
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoomList);
  }, []);

  const result = rooms.filter((v: KKuTu.Room.Summarized) => {
    for (const key of KKuTu.Game.modes[v.mode].rules)
      if (room.rules[key] && !v.rules[key]) return false;
    return (
      v.title.includes(room.title) &&
      v.mode === room.mode &&
      room.round[0] <= v.round &&
      v.round <= room.round[1] &&
      room.roundTime[0] <= v.roundTime &&
      v.roundTime <= room.roundTime[1]
    );
  });
  return (
    <section id="box-search-room" className="product">
      <h5 className="product-title">{L.render("searchRoomBox_title")}</h5>
      <div className="product-body">
        <form className="search-form">
          <div className="options">
            <label className="item-wrapper">
              <label className="dialog-desc" htmlFor="searchRoom-input-title">
                {L.get("roomTitle")}
              </label>
              <input
                type="text"
                id="searchRoom-input-title"
                value={room.title}
                onChange={({ currentTarget: target }) =>
                  setRoom({ ...room, title: target.value })
                }
              />
            </label>
            <label className="item-wrapper">
              <label className="dialog-desc" htmlFor="searchRoom-select-mode">
                {L.get("roomMode")}
              </label>
              <select
                id="searchRoom-select-mode"
                value={room.mode}
                onChange={({ currentTarget: target }) =>
                  setRoom({ ...room, mode: parseInt(target.value) })
                }
              >
                {EnumValueIterator(KKuTu.Game.Mode).map((mode, index) => (
                  <option key={index} value={mode}>
                    {L.get(`game_mode_${mode}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="item-wrapper">
              <label className="dialog-desc">{L.get("roomRound")}</label>
              <label className="range">
                <input
                  type="number"
                  id="searchRoom-input-round-begin"
                  min={1}
                  max={room.round[1]}
                  value={room.round[0]}
                  onChange={({ currentTarget: target }) =>
                    setRoom({
                      ...room,
                      round: [parseInt(target.value), room.round[1]],
                    })
                  }
                />
                <input
                  type="number"
                  id="searchRoom-input-round-end"
                  min={room.round[0]}
                  max={10}
                  value={room.round[1]}
                  onChange={({ currentTarget: target }) =>
                    setRoom({
                      ...room,
                      round: [room.round[0], parseInt(target.value)],
                    })
                  }
                />
              </label>
            </label>
            <label className="item-wrapper">
              <label
                className="dialog-desc"
                htmlFor="searchRoom-select-roundTime-begin"
              >
                {L.get("roomRoundTime")}
              </label>
              <label className="range">
                <select
                  id="searchRoom-select-roundTime-begin"
                  value={room.roundTime[0]}
                  onChange={({ currentTarget: target }) =>
                    setRoom({
                      ...room,
                      roundTime: [parseInt(target.value), room.roundTime[1]],
                    })
                  }
                >
                  {CLIENT_SETTINGS.roundTimes
                    .filter((v) => v <= room.roundTime[1])
                    .map((roundTime, index) => (
                      <option key={index} value={roundTime}>
                        {L.get("unitSecond", roundTime)}
                      </option>
                    ))}
                </select>
                <select
                  id="searchRoom-select-roundTime-end"
                  value={room.roundTime[1]}
                  onChange={({ currentTarget: target }) =>
                    setRoom({
                      ...room,
                      roundTime: [room.roundTime[0], parseInt(target.value)],
                    })
                  }
                >
                  {CLIENT_SETTINGS.roundTimes
                    .filter((v) => room.roundTime[0] <= v)
                    .map((roundTime, index) => (
                      <option key={index} value={roundTime}>
                        {L.get("unitSecond", roundTime)}
                      </option>
                    ))}
                </select>
              </label>
            </label>
          </div>
          <div className="options-rules">
            <label className="dialog-desc" htmlFor="searchRoom-rules">
              {L.get("roomRules")}
            </label>
            <div id="searchRoom-rules" className="checkbox-wrapper">
              {KKuTu.Game.modes[room.mode].rules.map((rule, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    id={`searchRoom-checkbox-${rule}`}
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
                  <label htmlFor={`searchRoom-checkbox-${rule}`}>
                    {L.get(`game_rule_${rule}`)}
                  </label>
                </label>
              ))}
            </div>
          </div>
        </form>
        <div className="result-list">
          {result.length === 0 ? (
            <div>{L.get("error_noResult")}</div>
          ) : (
            result.map((room, index) => (
              <div
                key={index}
                className={`item ${room.isGaming ? "gaming" : "waiting"}`}
                onClick={async () => {
                  socket.send(WebSocketMessage.Type.JoinRoom, {
                    target: room.id,
                  });
                  const res = await socket.messageReceiver.wait(
                    WebSocketMessage.Type.InitializeRoom
                  );
                  updateRoom(res.room);
                }}
              >
                <div className="id">{room.id}</div>
                <div className="title ellipse">{room.title}</div>
                <div className="limit">
                  {room.members} / {room.limit}
                </div>
                <div className="game-settings">
                  <div className="mode">
                    <Mode room={room} />
                  </div>
                  <div className="round">{L.get("unitRound", room.round)}</div>
                  <div className="time">
                    {L.get("unitSecond", room.roundTime)}
                  </div>
                </div>
                <div className="lock">
                  <Icon
                    type={IconType.NORMAL}
                    name={room.isLocked ? "lock" : "unlock"}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
