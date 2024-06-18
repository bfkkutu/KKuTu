import { WebSocket as Socket } from "ws";

import User from "back/models/User";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";

export default class WebSocket extends Socket {
  public user!: User;
  private _send = Socket.prototype.send;
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
