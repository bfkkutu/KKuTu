import React from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";

export default class InviteDialog extends Dialog {
  public static instance = new InviteDialog();

  protected override head(): React.ReactElement {
    return <>{L.get("invite_title")}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useStore((state) => state.socket);
    const users = useStore((state) => state.users);

    return (
      <div className="dialog-invite">
        <ul className="body">
          {Object.values(users)
            .filter((user) => user.roomId === undefined)
            .map((user, index) => (
              <li
                key={index}
                className="item"
                onClick={async () => {
                  if (
                    !(await window.confirm(
                      L.get("confirm_invite", user.nickname)
                    ))
                  )
                    return;
                  socket.send(WebSocketMessage.Type.Invite, {
                    target: user.id,
                  });
                  window.alert(L.get("alert_invite", user.nickname));
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
        <div className="footer">
          <button
            onClick={async () => {
              socket.send(WebSocketMessage.Type.AddRobot, {});
              try {
                await socket.messageReceiver.wait(
                  WebSocketMessage.Type.AddRobot
                );
              } catch (e) {
                const { errorType } =
                  e as WebSocketError.Message[WebSocketError.Type];
                switch (errorType) {
                  case WebSocketError.Type.BadRequest:
                    window.alert(L.get("error_400"));
                    break;
                  case WebSocketError.Type.Conflict:
                    window.alert(L.get("error_roomFull"));
                    break;
                }
              }
            }}
          >
            {L.get("invite_addRobot")}
          </button>
        </div>
      </div>
    );
  }
}
