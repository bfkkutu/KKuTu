import sha256 from "sha256";

import WebSocketGroup from "back/utils/WebSocketGroup";
import { Game } from "common/Game";
import Channel from "back/game/Channel";
import WebSocket from "back/utils/WebSocket";
import { WebSocketMessage } from "../../common/WebSocket";
import ObjectMap from "../../common/ObjectMap";

export default class Room extends WebSocketGroup implements Game.BaseRoom {
  private static emptyPassword = sha256("");
  /**
   * @reference
   */
  private channel: Channel;
  private members = new ObjectMap<string, Game.RoomMember>();
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
    room: Game.RoomSettings
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

  public configure(room: Game.RoomSettings): void {
    this.title = room.title;
    this.isLocked = room.password !== Room.emptyPassword;
    this.password &&= room.password;
    this.limit = room.limit;
    this.mode = room.mode;
    this.round = room.round;
    this.roundTime = room.roundTime;
    this.rules = room.rules;
  }
  public override add(socket: WebSocket): void {
    const user = this.channel.getUser(socket.uid);
    if (user === undefined) return;
    super.add(socket);
    this.members.set(user.id, {
      id: user.id,
      isReady: user.settings.game.autoReady || this.master === user.id,
      isSpectator: false,
    });
  }
  /**
   * 방에서 특정 유저를 제거한다.
   *
   * @param id 유저 식별자.
   */
  public override remove(socket: WebSocket): void {
    super.remove(socket);
    this.members.delete(socket.uid);
    if (this.isEmpty) return this.channel.unloadRoom(this.id);
    if (this.master === socket.uid) {
      this.master = this.clients.valuesAsArray()[0].uid;
      const member = this.getMember(this.master);
      if (member === undefined) return;
      member.isReady = true;
      this.update();
    }
  }
  private getMembers(): Record<string, Game.RoomMember> {
    return this.members.asRecord();
  }
  public getMember(id: string) {
    return this.members.get(id);
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
      members: this.getMembers(),
    };
  }
}
