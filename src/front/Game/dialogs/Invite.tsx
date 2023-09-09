import React from "react";

import DialogData from "front/@global/Bayadere/dialog/DialogData";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import { WebSocketMessage } from "../../../common/WebSocket";

export const InviteDialog = new DialogData(L.get("invite_title"), () => {
  const socket = useStore((state) => state.socket);
  const users = useStore((state) => state.users);

  return (
    <div className="dialog-invite">
      <ul className="body">
        {Object.values(users)
          .filter((user) => user.roomId === undefined)
          .map((user) => (
            <li
              className="item"
              onClick={async () => {
                if (!(await confirm(L.get("confirm_invite", user.nickname))))
                  return;
                socket.send(WebSocketMessage.Type.Invite, {
                  userId: user.id,
                });
                alert(L.get("alert_invite", user.nickname));
              }}
            >
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
