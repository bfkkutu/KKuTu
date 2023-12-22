import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { Notification } from "front/@global/Bayadere/Notification";
import { Room } from "front/Game/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";

export const createInviteNotification = (roomId: number, nickname: string) =>
  new Notification(L.get("notification_invite", roomId), async () => {
    const { socket } = useStore.getState();
    if (!(await confirm(L.render("confirm_inviteResponse", nickname, roomId))))
      return;
    const { room, updateRoom, leaveRoom } = Room.useStore.getState();
    if (room !== undefined) {
      socket.send(WebSocketMessage.Type.LeaveRoom, {});
      await socket.messageReceiver.wait(WebSocketMessage.Type.LeaveRoom);
      leaveRoom();
    }
    socket.send(WebSocketMessage.Type.JoinRoom, { roomId });
    const res = await socket.messageReceiver.wait(
      WebSocketMessage.Type.InitializeRoom
    );
    updateRoom(res.room);
  });
