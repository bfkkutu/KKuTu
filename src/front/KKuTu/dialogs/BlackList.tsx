import React, { useEffect, useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { getLevel } from "front/@global/Utility";
import { Tooltip } from "front/@global/bayadere/Tooltip";
import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import Icon from "front/@block/Icon";
import { useSocket, useStore } from "front/KKuTu/Store";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class BlackListDialog extends Dialog {
  public static readonly instance = new BlackListDialog();

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);

    return <>{l("blackList_title")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const community = useStore((state) => state.community);
    const onlineUsers = useStore((state) => state.users);
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );
    const [users, setUsers] = useState({ ...onlineUsers });

    const tooltipRemove = new Tooltip(l("remove"));

    useEffect(() => {
      async function loadOfflineUsers() {
        for (const id of [
          ...community.friendRequests.received,
          ...community.friends,
        ])
          if (!(id in users)) {
            const user = await socket.queryUser(id);
            if (user === undefined) {
              continue;
            }
            setUsers((users) => ({ ...users, [id]: user }));
          }
      }
      loadOfflineUsers();
    }, [community]);

    return (
      <div className="dialog-blackList">
        <ul className="body">
          {community.blackList.map((id, index) => {
            const blackedUser = users[id];
            if (blackedUser === undefined) return null;
            return (
              <li key={index} className="item">
                <div className="left">
                  <ProfileImage
                    src={blackedUser.image}
                    width={20}
                    height={20}
                  />
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
                    onMouseEnter={createOnMouseEnter(tooltipRemove)}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={async () => {
                      if (
                        !(await window.confirm(
                          l("confirm_blackListRemove", blackedUser.nickname)
                        ))
                      )
                        return;
                      socket.send(WebSocketMessage.Type.BlackListRemove, {
                        target: blackedUser.id,
                      });
                      await socket.messageReceiver.wait(
                        WebSocketMessage.Type.UpdateCommunity
                      );
                      window.alert(
                        l("alert_blackListRemove", blackedUser.nickname)
                      );
                    }}
                  >
                    <Icon type={Icon.Type.NORMAL} name="xmark" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

