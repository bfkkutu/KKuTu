import sha256 from "sha256";

import WebSocketGroup from "back/utils/WebSocketGroup";
import { Game } from "common/Game";
import Channel from "back/game/Channel";
import WebSocket from "back/utils/WebSocket";
import { WebSocketMessage } from "../../common/WebSocket";

export default class Room extends WebSocketGroup implements Game.BaseRoom {
  private static emptyPassword = sha256("");
  /**
   * @reference
   */
  private channel: Channel;
  public id: number;
  public title: string;
  public isLocked: boolean;
  private password: string;
  public limit: number;
  public mode: Game.Mode;
  public round: number;
  public roundTime: number;
  public rules: Record<Game.Rule, boolean>;
  public master: string;

  private get isEmpty() {
    return this.clients.size === 0;
  }

  constructor(
    channel: Channel,
    id: number,
    master: string,
    room: Game.RoomConfig
  ) {
    super();

    this.channel = channel;
    this.id = id;
    this.master = master;

    this.title = room.title;
    this.isLocked = room.password !== Room.emptyPassword;
    this.password = room.password;
    this.limit = room.limit;
    this.mode = room.mode;
    this.round = room.round;
    this.roundTime = room.roundTime;
    this.rules = room.rules;
  }

  public configure(room: Game.RoomConfig): void {
    this.title = room.title;
    this.isLocked = room.password !== Room.emptyPassword;
    this.password = room.password;
    this.limit = room.limit;
    this.mode = room.mode;
    this.round = room.round;
    this.roundTime = room.roundTime;
    this.rules = room.rules;
  }
  /**
   * 방에서 특정 유저를 제거한다.
   *
   * @param id 유저 식별자.
   */
  public override remove(socket: WebSocket): void {
    super.remove(socket);
    if (this.isEmpty) return this.channel.unloadRoom(this.id);
    if (this.master === socket.uid) {
      this.master = this.clients.valuesAsArray()[0].uid;
      this.update();
    }
  }
  private getMembers(): string[] {
    return this.clients.valuesAsArray().map((client) => client.uid);
  }
  /**
   * 이 방에 접속 중인 유저들의 방 정보를 갱신한다.
   * 방의 메타데이터(방 이름, 방장 등)에 변경 사항이 있을 때 호출되어야 한다.
   */
  public update(): void {
    this.broadcast(WebSocketMessage.Type.UpdateRoom, {
      room: this.serialize(),
    });
  }
  /**
   * 이 방에 접속 중인 유저들의 방 유저 목록을 갱신한다.
   * 이 방에 새 유저가 들어왔거나 기존 유저가 나갔을 때 호출되어야 한다.
   */
  public updateMembers(): void {
    this.broadcast(WebSocketMessage.Type.UpdateRoomMembers, {
      members: this.getMembers(),
    });
  }
  public summarize(): Game.SummarizedRoom {
    return {
      id: this.id,
      title: this.title,
      isLocked: this.isLocked,
      isGaming: false,
      limit: this.limit,
      mode: this.mode,
      round: this.round,
      roundTime: this.roundTime,
      rules: this.rules,
      members: this.clients.size,
    };
  }
  public serialize(): Game.DetailedRoom {
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
