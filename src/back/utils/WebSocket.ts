import { WebSocket as _WebSocket } from "ws";

import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";

export default class WebSocket extends _WebSocket {
  public uid!: string;
  private _send = _WebSocket.prototype.send;
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
