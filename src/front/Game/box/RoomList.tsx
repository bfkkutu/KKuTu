import React from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";

export default function RoomListBox() {
  const rooms = useStore((state) => state.rooms);

  return (
    <section id="box-room-list" className="product">
      <h5 className="title">{L.render("roomListBox_title", rooms.length)}</h5>
      <div className="body">{}</div>
    </section>
  );
}
