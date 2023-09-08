import React from "react";

import { CLIENT_SETTINGS, FRONT } from "back/utils/Utility";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../common/WebSocket";
import WebSocket from "front/@global/WebSocket";

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
  return new Promise<Database.SummarizedUser>(async (resolve, reject) => {
    socket.send(WebSocketMessage.Type.QueryUser, {
      userId: id,
    });
    const { user } = await socket.messageReceiver.wait(
      WebSocketMessage.Type.QueryUser
    );
    if (user) resolve(user);
    else reject();
  });
}
/**
 * 컴포넌트인지 ReactNode인지 알 수 없는 객체를 랜더링한다.
 *
 * @param object React.FC 또는 typeof React.Component 또는 React.ReactNode.
 * @returns React.ReactNode.
 */
export function renderComponentOrNode(
  object: React.ComponentOrNode
): React.ReactNode {
  if (typeof object === "function") return React.createElement(object);
  return object;
}
