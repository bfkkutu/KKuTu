import WebSocketGroup from "back/utils/WebSocketGroup";
import { Game } from "common/Game";

export default class Room extends WebSocketGroup implements Game.Room {
  public id: number;
  public title: string;
  private password: string;
  public limit: number;
  public mode: Game.Mode;
  public round: number;
  public roundTime: number;
  public rules: Record<Game.Rule, boolean>;

  constructor(data: Game.Room, password: string) {
    super();

    this.id = data.id;
    this.title = data.title;
    this.password = password;
    this.limit = data.limit;
    this.mode = data.mode;
    this.round = data.round;
    this.roundTime = data.roundTime;
    this.rules = data.rules;
  }

  public serialize(): Game.Room {
    return {
      id: this.id,
      title: this.title,
      limit: this.limit,
      mode: this.mode,
      round: this.round,
      roundTime: this.roundTime,
      rules: this.rules,
    };
  }
}
