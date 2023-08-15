import React from "react";

import L from "front/@global/Language";
import { getLevel } from "front/@global/Utility";
import LevelIcon from "front/@block/LevelIcon";
import { useStore } from "front/Game/Store";

interface Props {
  server: number;
}

export default function UserListBox(props: Props) {
  const users = useStore((state) => Object.values(state.users));

  return (
    <section id="box-user-list" className="product">
      <h5 className="title">
        {L.render(
          "userListBox_title",
          <b>{L.get(`server_${props.server}`)}</b>,
          users.length
        )}
      </h5>
      <div className="body">
        {users.map((user) => (
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
