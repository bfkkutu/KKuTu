import React, { useEffect, useState } from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { getLevel, getOfflineUser } from "front/@global/Utility";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { Icon, IconType } from "front/@block/Icon";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { WebSocketMessage } from "../../../common/WebSocket";

export const BlackListDialog = new Dialog(L.render("blackList_title"), () => {
  const socket = useStore((state) => state.socket);
  const community = useStore((state) => state.community);
  const onlineUsers = useStore((state) => state.users);
  const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
    (state) => [state.createOnMouseEnter, state.onMouseMove, state.onMouseLeave]
  );
  const [users, setUsers] = useState({ ...onlineUsers });

  useEffect(() => {
    async function loadOfflineUsers() {
      for (const id of [
        ...community.friendRequests.received,
        ...community.friends,
      ])
        if (!(id in users)) {
          const user = await getOfflineUser(socket, id);
          setUsers((users) => ({ ...users, [id]: user }));
        }
    }
    loadOfflineUsers();
  }, [community]);

  return (
    <div className="dialog-blackList">
      <ul className="body">
        {community.blackList.map((id) => {
          const blackedUser = users[id];
          if (blackedUser === undefined) return null;
          return (
            <li className="item">
              <div className="left">
                <ProfileImage src={blackedUser.image} width={20} height={20} />
                <LevelIcon
                  className="image"
                  level={getLevel(blackedUser.score)}
                  width={20}
                  height={20}
                />
                <div className="name ellipse">{blackedUser.nickname}</div>
              </div>
              <div className="right">
                <div
                  className="remove"
                  onMouseEnter={createOnMouseEnter(L.get("remove"))}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  onClick={async () => {
                    if (
                      !(await window.confirm(
                        L.get("confirm_blackListRemove", blackedUser.nickname)
                      ))
                    )
                      return;
                    socket.send(WebSocketMessage.Type.BlackListRemove, {
                      userId: blackedUser.id,
                    });
                    await socket.messageReceiver.wait(
                      WebSocketMessage.Type.UpdateCommunity
                    );
                    window.alert(
                      L.get("alert_blackListRemove", blackedUser.nickname)
                    );
                  }}
                >
                  <Icon type={IconType.NORMAL} name="xmark" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="footer"></div>
    </div>
  );
});
