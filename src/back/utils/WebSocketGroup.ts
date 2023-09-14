import WebSocket from "back/utils/WebSocket";
import ObjectMap from "../../common/ObjectMap";
import { WebSocketMessage } from "common/WebSocket";

export default class WebSocketGroup {
  protected readonly clients = new ObjectMap<string, WebSocket>();

  public add(socket: WebSocket) {
    this.clients.set(socket.uid, socket);
  }
  public remove(socket: WebSocket) {
    this.clients.delete(socket.uid);
  }
  public broadcast<T extends WebSocketMessage.Type>(
    type: T,
    content: WebSocketMessage.Content.Server[T],
    filter?: (member: WebSocket) => boolean
  ) {
    for (const member of this.clients.values())
      if (filter === undefined || filter(member)) member.send(type, content);
  }
}
