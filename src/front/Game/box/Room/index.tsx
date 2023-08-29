import React, { useEffect } from "react";

import { WebSocketMessage } from "../../../../common/WebSocket";
import { useStore } from "front/Game/Store";
import L from "front/@global/Language";
import Moremi from "front/@block/Moremi";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import { useRoomStore } from "front/Game/box/Room/Store";

export default function RoomBox() {
  const socket = useStore((state) => state.socket);
  const users = useStore((state) => state.users);
  const [room, updateRoom] = useRoomStore((state) => [
    state.room,
    state.updateRoom,
  ]);
  const [addMember, removeMember] = useRoomStore((state) => [
    state.addMember,
    state.removeMember,
  ]);
  const notice = useStore((state) => state.notice);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoom,
      ({ room: data }) => {
        if (room === undefined || room.id !== data.id) return;
        updateRoom(data);
      }
    );
    socket.messageReceiver.on(WebSocketMessage.Type.JoinRoom, ({ userId }) => {
      notice(L.get("notice_joinRoom", users[userId].nickname));
      addMember(userId);
    });
    socket.messageReceiver.on(WebSocketMessage.Type.LeaveRoom, ({ userId }) => {
      notice(L.get("notice_leaveRoom", users[userId].nickname));
      removeMember(userId);
    });
    socket.messageReceiver.on(
      WebSocketMessage.Type.HandoverRoom,
      ({ master }) => {
        if (room === undefined) return;
        updateRoom({ ...room, master });
      }
    );
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom);
      socket.messageReceiver.off(WebSocketMessage.Type.JoinRoom);
      socket.messageReceiver.off(WebSocketMessage.Type.LeaveRoom);
      socket.messageReceiver.off(WebSocketMessage.Type.HandoverRoom);
    };
  }, []);

  if (room === undefined) return null;
  return (
    <section id="box-room" className="product">
      <h5 className="product-title">
        <h5 className="id">[{room.id}]</h5>
        <h5 className="title">{room.title}</h5>
        <h5 className="mode">{L.get(`game_mode_${room.mode}`)}</h5>
        <h5 className="limit">
          {L.get("stat_roomLimit", room.members.length, room.limit)}
        </h5>
        <h5 className="round">{L.get("unitRound", room.round)}</h5>
        <h5 className="roundTime">{L.get("unitSecond", room.roundTime)}</h5>
      </h5>
      <div className="product-body">
        <div className="user-list">
          {room.members.map((id) => {
            const member = users[id];
            if (member === undefined) return null;
            return (
              <div className="user">
                <Moremi className="moremi image" equipment={member.equipment} />
                <div className="stat"></div>
                <div className="title">
                  <LevelIcon className="level" level={getLevel(member.score)} />
                  <div className="nickname">{member.nickname}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
