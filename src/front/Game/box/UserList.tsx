import React from "react";

import { Database } from "common/Database";
import L from "front/@global/Language";
import { getLevel } from "front/@global/Utility";
import LevelIcon from "front/@block/LevelIcon";

interface Props {
  server: number;
  me: Database.DetailedUser;
  users: Database.SummarizedUser[];
}

export default class UserListBox extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <section id="box-user-list" className="product">
        <h5 className="title">
          {L.render(
            "userListBox_title",
            <b>{L.get(`server_${this.props.server}`)}</b>,
            this.props.users.length + 1
          )}
        </h5>
        <div className="body">
          {[this.props.me, ...this.props.users].map((user) => (
            <div className="item">
              <img className="jt-image image" src={user.image} />
              <LevelIcon className="image" level={getLevel(user.score)} />
              <div className="name ellipse">{user.nickname}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
