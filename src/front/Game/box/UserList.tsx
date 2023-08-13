import React from "react";

import { Database } from "common/Database";
import { Icon, IconType } from "front/@block/Icon";
import L from "front/@global/Language";
import { getLevel } from "front/@global/Utility";

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
          <Icon type={IconType.NORMAL} name="users" />{" "}
          {L.render(
            "userListBox_title",
            <b>{L.get(`server_${this.props.server}`)}</b>,
            this.props.users.length + 1
          )}
        </h5>
        <div className="body">
          {[this.props.me, ...this.props.users].map((user) => (
            <div className="user-item">
              <img className="jt-image image" src={user.image} />
              <img
                className="image"
                src={`/media/img/kkutu/lv/lv${getLevel(user.score)
                  .toString()
                  .padStart(4, "0")}.png`}
              />
              <div className="name ellipse">{user.nickname}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
