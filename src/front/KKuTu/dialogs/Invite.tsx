import React from "react";

import L from "front/@global/Language";
import { useStore } from "front/KKuTu/Store";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { getLevel } from "front/@global/Utility";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Room } from "front/KKuTu/box/Room";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";

export default class InviteDialog extends Dialog {
  public static readonly instance = new InviteDialog();

  public override initialize(): void {
    super.initialize();

    const unsubscribe = Room.useStore.subscribe((state) => {
      if (state.room === undefined) {
        this.hide();
        unsubscribe();
      }
    });
  }
  protected override head(): React.ReactElement {
    return <>{L.get("invite_title")}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useStore((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const users = useStore((state) => state.users);
    const room = Room.useStore((state) => state.room);

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
        <div className="footer buttons">
          {room !== undefined && room.master === id ? (
            <button
              onClick={async () => {
                socket.send(WebSocketMessage.Type.InviteRobot, {});
                try {
                  await socket.messageReceiver.wait(
                    WebSocketMessage.Type.InviteRobot
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
              {L.get("invite_robot")}
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}

