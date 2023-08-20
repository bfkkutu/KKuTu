import React from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { CreateRoomDialog } from "front/@global/Bayadere/dialog/templates/CreateRoom";

export default function RoomListBox() {
  const rooms = useStore((state) => state.rooms);
  const toggle = useDialogStore((state) => state.toggle);

  return (
    <section id="box-room-list" className="product">
      <h5 className="title">{L.render("roomListBox_title", rooms.length)}</h5>
      <div className="body">
        {rooms.length === 0 ? (
          <div className="item create" onClick={() => toggle(CreateRoomDialog)}>
            {L.get("createRoom")}
          </div>
        ) : (
          rooms.map((room) => <div></div>)
        )}
      </div>
    </section>
  );
}
