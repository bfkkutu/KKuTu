import React from "react";

import L from "front/@global/Language";
import LevelIcon from "front/@block/LevelIcon";
import { useStore } from "front/Game/Store";
import { getLevel } from "front/@global/Utility";
import ProfileImage from "front/@block/ProfileImage";
import { Database } from "common/Database";
import { createProfileDialog } from "front/Game/dialogs/Profile";
import { Dialog } from "front/@global/Bayadere/Dialog";

export namespace UserList {
  interface Props {
    server: number;
  }
  export function Box(props: Props) {
    const blackList = useStore((state) => state.community.blackList);
    const users = useStore((state) => Object.values(state.users));

    return (
      <section id="box-user-list" className="product">
        <h5 className="product-title">
          {L.render(
            "userListBox_title",
            <b>{L.get(`server_${props.server}`)}</b>,
            users.length
          )}
        </h5>
        <div className="product-body">
          {users
            .filter(({ id }) => !blackList.includes(id))
            .map((user) => (
              <Item {...user} />
            ))}
        </div>
      </section>
    );
  }

  function Item(user: Database.User.Summarized) {
    const toggle = Dialog.useStore((state) => state.toggle);
    const dialog = createProfileDialog(user);

    return (
      <div className="item" onClick={() => toggle(dialog)}>
        <ProfileImage src={user.image} width={18} height={18} />
        <LevelIcon
          className="image"
          level={getLevel(user.score)}
          width={18}
          height={18}
        />
        <div className="name ellipse">{user.nickname}</div>
      </div>
    );
  }
}
