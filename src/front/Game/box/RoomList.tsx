import React, { useEffect } from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { CreateRoomDialog } from "front/@global/Bayadere/dialog/templates/CreateRoom";
import { WebSocketMessage } from "../../../common/WebSocket";

export default function RoomListBox() {
  const socket = useStore((state) => state.socket);
  const [rooms, updateRoomList] = useStore((state) => [
    state.rooms,
    state.updateRoomList,
  ]);
  const toggle = useDialogStore((state) => state.toggle);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoomList,
      ({ rooms }) => updateRoomList(rooms)
    );
    return () =>
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoomList);
  }, []);

  return (
    <section id="box-room-list" className="product">
      <h5 className="title">{L.render("roomListBox_title", rooms.length)}</h5>
      <div className="body">
        {rooms.length === 0 ? (
          <div className="item create" onClick={() => toggle(CreateRoomDialog)}>
            {L.get("createRoom")}
          </div>
        ) : (
          rooms.map((room) => <div className="item">{room.title}</div>)
        )}
      </div>
    </section>
  );
}
