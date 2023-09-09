import NotificationData from "front/@global/Bayadere/notification/NotificationData";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { WebSocketMessage } from "../../../common/WebSocket";
import { useRoomStore } from "front/Game/box/Room/Store";

export const createInviteNotification = (roomId: number, nickname: string) =>
  new NotificationData(L.get("notification_invite", roomId), async () => {
    const { socket } = useStore.getState();
    if (!(await confirm(L.get("confirm_inviteResponse", nickname, roomId))))
      return;
    const { room, updateRoom, leaveRoom } = useRoomStore.getState();
    if (room === undefined) {
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
