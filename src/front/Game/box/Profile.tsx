import React from "react";

import L from "front/@global/Language";
import { Database } from "common/Database";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import Moremi from "front/@block/Moremi";
import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class ProfileBox extends React.PureComponent<Database.DetailedUser> {
  public render(): React.ReactNode {
    const level = getLevel(this.props.score);
    const prev = CLIENT_SETTINGS.expTable[level - 2] || 0;
    const goal = CLIENT_SETTINGS.expTable[level - 1];
    return (
      <section id="box-profile" className="product">
        <h5 className="title">{L.render("profileBox_title")}</h5>
        <div className="body">
          <Moremi className="moremi" equipment={this.props.equipment} />
          <div className="stat">
            <LevelIcon className="level" level={level} />
            <div className="name ellipse">{this.props.nickname}</div>
            <div className="record">{L.render("stat_record", 0)}</div>
            <div className="money">
              {L.render("stat_money", this.props.money)}
            </div>
          </div>
          <div className="level">
            {L.get("level")} {level}
          </div>
          <div className="graph gauge">
            <div
              className="graph-bar"
              style={{
                width: ((this.props.score - prev) / (goal - prev)) * 190,
              }}
            />
          </div>
          <div className="bar-text gauge-text">
            {this.props.score.toLocaleString()} / {goal.toLocaleString()}
          </div>
        </div>
      </section>
    );
  }
}
