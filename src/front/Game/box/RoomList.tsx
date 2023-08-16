import React from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";

export default function RoomListBox() {
  const rooms = useStore((state) => state.rooms);

  return (
    <section id="box-room-list" className="product">
      <h5 className="title">{L.render("roomListBox_title", rooms.length)}</h5>
      <div className="body">
        {rooms.length === 0 ? (
          <div className="item create">{L.get("menu_createRoom")}</div>
        ) : (
          rooms.map((room) => <div></div>)
        )}
      </div>
    </section>
  );
}
