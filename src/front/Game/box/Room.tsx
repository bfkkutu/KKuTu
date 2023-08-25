import React, { useEffect } from "react";

import { WebSocketMessage } from "../../../common/WebSocket";
import { useStore } from "front/Game/Store";

export default function RoomBox() {
  const socket = useStore((state) => state.socket);
  const [room, updateRoom] = useStore((state) => [
    state.room,
    state.updateRoom,
  ]);
  const [members, updateMembers] = useStore((state) => [
    state.roomMembers,
    state.updateRoomMembers,
  ]);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoom,
      ({ room: data }) => {
        if (room === undefined || room.id !== data.id) return;
        updateRoom(data);
      }
    );
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoomMembers,
      ({ members }) => updateMembers(members)
    );
    socket.messageReceiver.on(
      WebSocketMessage.Type.HandoverRoom,
      ({ master }) => {
        if (room === undefined) return;
        updateRoom({ ...room, master });
      }
    );
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom);
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoomMembers);
      socket.messageReceiver.off(WebSocketMessage.Type.HandoverRoom);
    };
  }, []);

  return (
    <section id="box-room" className="product">
      {JSON.stringify(room)}
    </section>
  );
}
