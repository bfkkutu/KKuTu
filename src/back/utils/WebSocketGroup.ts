import WebSocket from "back/utils/WebSocket";
import ImprovedMap from "../../common/ImprovedMap";
import { WebSocketMessage } from "common/WebSocket";

export default class WebSocketGroup {
  protected readonly clients = new ImprovedMap<string, WebSocket>();

  public add(socket: WebSocket) {
    this.clients.set(socket.user.id, socket);
  }
  public get(id: string): WebSocket | undefined {
    return this.clients.get(id);
  }
  public remove(id: string) {
    this.clients.delete(id);
  }
  public broadcast<T extends WebSocketMessage.Type>(
    type: T,
    content: WebSocketMessage.Content.Server[T],
    filter?: (socket: WebSocket) => boolean
  ) {
    for (const client of this.clients.values())
      if (filter === undefined || filter(client)) client.send(type, content);
  }
}
