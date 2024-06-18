import sha256 from "sha256";

import WebSocketGroup from "back/utils/WebSocketGroup";
import Channel from "back/game/Channel";
import Game from "back/game/Game";
import { KKuTu } from "common/KKuTu";
import { WebSocketMessage } from "../../common/WebSocket";

export default class Room extends WebSocketGroup implements KKuTu.Room {
  private static readonly emptyPassword = sha256("");

  /**
   * @reference
   */
  private readonly channel: Channel;
  private game?: Game;
  public id: number;
  public title: string;
  public isLocked: boolean;
  private password: string;
  public limit: number;
  public mode: KKuTu.Game.Mode;
  public round: number;
  public roundTime: number;
  public rules: Record<KKuTu.Game.Rule, boolean>;
  public master: string;

  private get isEmpty() {
    return this.clients.size === 0;
  }
  public get isReady() {
    for (const client of this.clients.values()) {
      if (client.user.roomId === undefined) {
        continue;
      }
      if (!client.user.isReady) {
        return false;
      }
    }
    return true;
  }
  public get size() {
    return this.clients.size;
  }

  constructor(
    channel: Channel,
    id: number,
    master: string,
    room: KKuTu.Room.Settings
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

  public configure(room: KKuTu.Room.Settings): void {
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
  public override remove(id: string): void {
    super.remove(id);

    if (this.isEmpty) {
      return this.channel.unloadRoom(this.id);
    }

    if (this.master !== id) {
      return;
    }

    this.master = this.clients.valuesAsArray()[0].user.id;
    const client = this.clients.get(this.master);
    if (client === undefined) {
      // TODO: 오류 처리
      return;
    }
    if (client.user.roomId === undefined) {
      // TODO: 오류 처리
      return;
    }
    client.user.isReady = true;
    this.update();
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
   * 게임을 시작한다.
   */
  public start(): void {
    this.game = new Game(
      this,
      this.clients.entriesAsArray().reduce((prev, [id, client]) => {
        if (client.user.roomId === undefined) {
          // TODO: 오류 처리
          return prev;
        }
        if (client.user.isSpectator) {
          prev.push(id);
        }
        return prev;
      }, [] as string[])
    );
    this.broadcast(WebSocketMessage.Type.Start, {});
  }
  public summarize(): KKuTu.Room.Summarized {
    return {
      id: this.id,
      title: this.title,
      isLocked: this.isLocked,
      isGaming: this.game !== undefined,
      limit: this.limit,
      mode: this.mode,
      round: this.round,
      roundTime: this.roundTime,
      rules: this.rules,
      members: this.clients.size,
    };
  }
  public serialize(): KKuTu.Room.Detailed {
    return {
      id: this.id,
      title: this.title,
      limit: this.limit,
      mode: this.mode,
      round: this.round,
      roundTime: this.roundTime,
      rules: this.rules,
      master: this.master,
      members: Object.fromEntries(
        this.clients
          .entriesAsArray()
          .map(([id, client]) => [id, client.user.asRoomMember()])
      ),
      game: this.game?.serialize(),
    };
  }
}
