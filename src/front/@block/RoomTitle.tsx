import React from "react";

import L from "front/@global/Language";
import Mode from "front/@block/Mode";
import { KKuTu } from "common/KKuTu";

export default class RoomTitle extends React.PureComponent<KKuTu.Room.Detailed> {
  public render() {
    return (
      <div className="product-title">
        <h5 className="id">[{this.props.id}]</h5>
        <h5 className="title">{this.props.title}</h5>
        <h5 className="mode">
          <Mode {...this.props} />
        </h5>
        <h5 className="limit">
          {L.get(
            "stat_roomLimit",
            Object.keys(this.props.members).length,
            this.props.limit
          )}
        </h5>
        <h5 className="round">{L.get("unitRound", this.props.round)}</h5>
        <h5 className="roundTime">
          {L.get("unitSecond", this.props.roundTime)}
        </h5>
      </div>
    );
  }
}
