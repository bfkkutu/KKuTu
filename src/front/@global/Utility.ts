import { CLIENT_SETTINGS, FRONT } from "back/utils/Utility";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../common/WebSocket";

export const PROPS = FRONT && eval("window['__PROPS']");
export function getTimeDistance(from: number, to: number = Date.now()) {
  return (to - from) / 60000;
}
export function getRequiredScore(level: number) {
  return Math.round(
    (Number(!(level % 5)) * 0.3 + 1) *
      (Number(!(level % 15)) * 0.4 + 1) *
      (Number(!(level % 45)) * 0.5 + 1) *
      (120 +
        Math.floor(level / 5) * 60 +
        Math.floor((level * level) / 225) * 120 +
        Math.floor((level * level) / 2025) * 180)
  );
}
export function getLevel(score: number) {
  for (let i = 0; i <= CLIENT_SETTINGS.maxLevel; i++)
    if (score < CLIENT_SETTINGS.expTable[i]) return i + 1;
  return 1;
}
export function getOfflineUser(
  socket: WebSocket,
  id: string
): Promise<Database.SummarizedUser> {
  return new Promise<Database.SummarizedUser>((resolve, reject) => {
    socket.send(WebSocketMessage.Type.QueryUser, {
      userId: id,
    });
    socket.wait(WebSocketMessage.Type.QueryUser, (message) =>
      message.user ? resolve(message.user) : reject()
    );
  });
}
