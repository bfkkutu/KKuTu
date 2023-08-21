import WebSocket from "back/utils/WebSocket";
import WebSocketGroup from "back/utils/WebSocketGroup";
import { Game } from "common/Game";

export default class Room extends WebSocketGroup implements Game.PublishedRoom {
  public id: number;
  public title: string;
  private password: string;
  public limit: number;
  public mode: Game.Mode;
  public round: number;
  public roundTime: number;
  public rules: Record<Game.Rule, boolean>;
  public master: string;

  public get isEmpty() {
    return this.clients.size === 0;
  }

  constructor(id: number, master: string, data: Game.RoomConfig) {
    super();

    this.id = id;
    this.master = master;

    this.title = data.title;
    this.password = data.password;
    this.limit = data.limit;
    this.mode = data.mode;
    this.round = data.round;
    this.roundTime = data.roundTime;
    this.rules = data.rules;
  }

  public override remove(socket: WebSocket): void {
    super.remove(socket);
    if (this.master === socket.uid && this.clients.size !== 0)
      this.master = Array.from(this.clients.values())[0].uid;
  }
  public serialize(): Game.PublishedRoom {
    return {
      id: this.id,
      title: this.title,
      limit: this.limit,
      mode: this.mode,
      round: this.round,
      roundTime: this.roundTime,
      rules: this.rules,
      master: this.master,
    };
  }
}
