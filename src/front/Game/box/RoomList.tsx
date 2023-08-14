import React from "react";

import L from "front/@global/Language";
import { Room } from "common/Interfaces";

interface Props {
  rooms: Room[];
}

export default class RoomListBox extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <section id="box-room-list" className="product">
        <h5 className="title">
          {L.render("roomListBox_title", this.props.rooms.length)}
        </h5>
        <div className="body">{}</div>
      </section>
    );
  }
}
