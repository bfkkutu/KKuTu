import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { getLevel } from "front/@global/Utility";
import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { useSocket, useStore } from "front/KKuTu/Store";
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
    const { l } = useLexicon(lKKuTu);

    return <>{l("invite_title")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
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
                    !(await window.confirm(l("confirm_invite", user.nickname)))
                  )
                    return;
                  socket.send(WebSocketMessage.Type.Invite, {
                    target: user.id,
                  });
                  window.alert(l("alert_invite", user.nickname));
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
                      window.alert(l("error", 400));
                      break;
                    case WebSocketError.Type.Conflict:
                      window.alert(l("error_roomFull"));
                      break;
                  }
                }
              }}
            >
              {l("invite_robot")}
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}

