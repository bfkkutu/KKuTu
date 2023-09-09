import React from "react";

import DialogData from "front/@global/Bayadere/dialog/DialogData";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";

export const InviteDialog = new DialogData(L.get("invite_title"), () => {
  const users = useStore((state) => state.users);

  return (
    <div className="dialog-invite">
      <ul className="body">
        {Object.values(users)
          .filter((user) => user.roomId === undefined)
          .map((user) => (
            <li className="item">
              <ProfileImage src={user.image} width={20} height={20} />
              <LevelIcon
                className="image"
                level={getLevel(user.score)}
                width={20}
                height={20}
              />
              <div className="name ellipse">{user.nickname}</div>
            </li>
          ))}
      </ul>
      <div className="footer"></div>
    </div>
  );
});
