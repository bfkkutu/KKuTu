import React, { useEffect } from "react";

import { WebSocketMessage } from "../../../common/WebSocket";
import { useStore } from "front/Game/Store";

export default function RoomBox() {
  const socket = useStore((state) => state.socket);
  const [room, updateRoom] = useStore((state) => [
    state.room,
    state.updateRoom,
  ]);

  useEffect(() => {
    socket.messageReceiver.on(WebSocketMessage.Type.UpdateRoom, ({ room }) => {
      if (room === undefined || room.id !== room.id) return;
      updateRoom(room);
    });
    return () => socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom);
  }, []);

  return (
    <section id="box-room" className="product">
      room box
    </section>
  );
}
