import { WebSocket as Super } from "ws";

import type User from "back/models/User";
import { type WebSocketError, WebSocketMessage } from "../../common/WebSocket";

export default class WebSocket extends Super {
  public user!: User;

  private _send = Super.prototype.send;
  public send<T extends WebSocketMessage.Type>(
    type: T,
    content: WebSocketMessage.Content.Server[T]
  ) {
    this._send(
      JSON.stringify({
        type,
        ...content,
      } as WebSocketMessage.Server[T])
    );
  }
  public sendError<T extends WebSocketError.Type>(
    errorType: T,
    content: WebSocketError.ContentWithFlags[T]
  ) {
    this._send(
      JSON.stringify({
        type: WebSocketMessage.Type.Error,
        errorType,
        ...content,
      } as WebSocketMessage.Server[WebSocketMessage.Type.Error])
    );
  }
}

