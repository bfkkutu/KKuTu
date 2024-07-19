import React, { useEffect } from "react";

import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { useSocket, useStore } from "front/KKuTu/Store";
import CreateRoomDialog from "front/KKuTu/dialogs/CreateRoom";
import Room from "front/KKuTu/box/RoomList";
import { WebSocketMessage } from "../../../../common/WebSocket";

export default function RoomListBox() {
  const socket = useSocket((state) => state.socket);
  const [rooms, updateRoomList] = useStore((state) => [
    state.rooms,
    state.updateRoomList,
  ]);
  const toggle = Dialog.useStore((state) => state.toggle);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoomList,
      ({ rooms }) => updateRoomList(rooms)
    );

    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoomList);
    };
  }, []);

  return (
    <section id="box-room-list" className="product">
      <h5 className="product-title">
        {L.render("roomListBox_title", rooms.length)}
      </h5>
      <div className="product-body">
        {rooms.length === 0 ? (
          <div
            className="item create"
            onClick={() => toggle(CreateRoomDialog.instance)}
          >
            {L.get("createRoom")}
          </div>
        ) : (
          rooms.map((room, index) => <Room.Item key={index} room={room} />)
        )}
      </div>
    </section>
  );
}

