import React, { useEffect } from "react";

import { WebSocketMessage } from "../../../../common/WebSocket";
import { useStore } from "front/Game/Store";
import L from "front/@global/Language";
import { useRoomStore } from "front/Game/box/Room/Store";
import Mode from "front/@block/Mode";
import Member from "front/Game/box/Room/Member";

export default function RoomBox() {
  const socket = useStore((state) => state.socket);
  const users = useStore((state) => state.users);
  const notice = useStore((state) => state.notice);
  const [room, updateRoom, addMember, updateMember, removeMember] =
    useRoomStore((state) => [
      state.room,
      state.updateRoom,
      state.addMember,
      state.updateMember,
      state.removeMember,
    ]);

  useEffect(() => {
    socket.messageReceiver.on(WebSocketMessage.Type.JoinRoom, ({ member }) => {
      notice(L.get("notice_joinRoom", users[member.id].nickname));
      addMember(member);
    });
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoom,
      ({ room: data }) => {
        if (room === undefined || room.id !== data.id) return;
        if (room.master !== data.master)
          notice(L.get("notice_handover", users[data.master].nickname));
        updateRoom(data);
      }
    );
    socket.messageReceiver.on(
      WebSocketMessage.Type.LeaveRoom,
      ({ memberId }) => {
        notice(L.get("notice_leaveRoom", users[memberId].nickname));
        removeMember(memberId);
      }
    );
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.JoinRoom);
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom);
      socket.messageReceiver.off(WebSocketMessage.Type.LeaveRoom);
    };
  }, [users]);

  useEffect(() => {
    socket.messageReceiver.on(WebSocketMessage.Type.Spectate, ({ member }) =>
      updateMember(member)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.Ready, ({ member }) =>
      updateMember(member)
    );
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Spectate);
      socket.messageReceiver.off(WebSocketMessage.Type.Ready);
    };
  }, []);

  if (room === undefined) return null;
  return (
    <section id="box-room" className="product">
      <h5 className="product-title">
        <h5 className="id">[{room.id}]</h5>
        <h5 className="title">{room.title}</h5>
        <h5 className="mode">
          <Mode {...room} />
        </h5>
        <h5 className="limit">
          {L.get(
            "stat_roomLimit",
            Object.keys(room.members).length,
            room.limit
          )}
        </h5>
        <h5 className="round">{L.get("unitRound", room.round)}</h5>
        <h5 className="roundTime">{L.get("unitSecond", room.roundTime)}</h5>
      </h5>
      <div className="product-body">
        <div className="user-list">
          {Object.values(room.members).map((member) => (
            <Member {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
