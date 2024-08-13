import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { Notification } from "front/@global/bayadere/Notification";
import lKKuTu from "front/@global/languages/l.kkutu";
import { useSocket } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class InviteNotification extends Notification {
  private readonly target: number;
  private readonly nickname: string;

  constructor(target: number, nickname: string) {
    super();

    this.target = target;
    this.nickname = nickname;
  }

  protected override body(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);
    const socket = useSocket((state) => state.socket);
    const [room, updateRoom, leaveRoom] = Room.useStore((state) => [
      state.room,
      state.update,
      state.leave,
    ]);

    return (
      <div
        className="body"
        onClick={async () => {
          if (
            !(await window.confirm(
              l("confirm_inviteResponse", this.nickname, this.target)
            ))
          ) {
            return;
          }

          if (room !== undefined) {
            socket.send(WebSocketMessage.Type.LeaveRoom, {});
            await socket.messageReceiver.wait(WebSocketMessage.Type.LeaveRoom);
            leaveRoom();
          }

          socket.send(WebSocketMessage.Type.JoinRoom, { target: this.target });
          const res = await socket.messageReceiver.wait(
            WebSocketMessage.Type.InitializeRoom
          );
          this.hide();
          updateRoom(res.room);
        }}
      >
        {l("notification_invite", this.target)}
      </div>
    );
  }
}

