import React from "react";

import L from "front/@global/Language";
import { Notification } from "front/@global/Bayadere/Notification";
import { useSocket } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class InviteNotification extends Notification {
  private target: number;
  private nickname: string;

  constructor(target: number, nickname: string) {
    super();

    this.target = target;
    this.nickname = nickname;
  }

  protected override body(): React.ReactElement {
    return <>{L.get("notification_invite", this.target)}</>;
  }

  public override async onClick(): Promise<void> {
    const { socket } = useSocket.getState();

    if (
      !(await window.confirm(
        L.render("confirm_inviteResponse", this.nickname, this.target)
      ))
    ) {
      return;
    }

    const {
      room,
      update: updateRoom,
      leave: leaveRoom,
    } = Room.useStore.getState();
    if (room !== undefined) {
      socket.send(WebSocketMessage.Type.LeaveRoom, {});
      await socket.messageReceiver.wait(WebSocketMessage.Type.LeaveRoom);
      leaveRoom();
    }

    socket.send(WebSocketMessage.Type.JoinRoom, { target: this.target });
    const res = await socket.messageReceiver.wait(
      WebSocketMessage.Type.InitializeRoom
    );
    updateRoom(res.room);
  }
}

