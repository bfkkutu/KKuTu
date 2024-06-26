import sha256 from "sha256";

import WebSocket from "back/utils/WebSocket";
import WebSocketGroup from "back/utils/WebSocketGroup";
import Channel from "back/game/Channel";
import Game from "back/game/Game";
import Robot from "back/game/Robot";
import { KKuTu } from "common/KKuTu";
import ImprovedSet from "../../common/ImprovedSet";
import { WebSocketMessage } from "../../common/WebSocket";

export default class Room
  extends WebSocketGroup
  implements Serializable<KKuTu.Room>
{
  private static readonly EMPTY_PASSWORD = sha256("");

  private readonly channel: Channel;
  private readonly robots = new ImprovedSet<Robot>();
  private game?: Game;
  public readonly id: number;
  public title: string;
  public isLocked: boolean;
  public password: string;
  public limit: number;
  public mode: KKuTu.Game.Mode;
  public round: number;
  public roundTime: number;
  public rules: Record<KKuTu.Game.Rule, boolean>;
  public master: string;

  private get isEmpty() {
    return this.clients.size === 0;
  }
  public get isFull() {
    return this.size === this.limit;
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
  /**
   * 일반 유저, 로봇 전부 포함한 전체 member의 수
   */
  private get size() {
    return this.clients.size + this.robots.size;
  }
  /**
   * 관전자를 제외한 member의 수
   * (player의 수)
   */
  public get count() {
    return (
      this.clients.valuesAsArray().filter((client) => !client.user.isSpectator)
        .length + this.robots.size
    );
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
    this.isLocked = room.password !== Room.EMPTY_PASSWORD;
    this.password = room.password;
    this.limit = room.limit;
    this.mode = room.mode;
    this.round = room.round;
    this.roundTime = room.roundTime;
    this.rules = room.rules;
  }

  public configure(room: KKuTu.Room.Settings): void {
    this.title = room.title;
    this.isLocked = room.password !== Room.EMPTY_PASSWORD;
    this.password = room.password;
    this.limit = room.limit;
    this.mode = room.mode;
    this.round = room.round;
    this.roundTime = room.roundTime;
    this.rules = room.rules;
  }
  public override add(socket: WebSocket): void {
    if (this.isFull) {
      return;
    }

    super.add(socket);
    socket.user.roomId = this.id;
    socket.user.isReady = socket.user.settings.game.autoReady;
    socket.user.isSpectator = false;
    this.update();
  }
  public addRobot(robot: Robot): void {
    if (this.isFull) {
      return;
    }

    this.robots.add(robot);
    robot.roomId = this.id;
    robot.isReady = true;
    robot.isSpectator = false;
    this.update();
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

    if (this.master === id) {
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
    }

    this.game?.remove(id);
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
      this.clients.valuesAsArray().reduce((prev, client) => {
        if (client.user.roomId === undefined) {
          this.remove(client.user.id);
          return prev;
        }
        if (!client.user.isSpectator) {
          prev.push(client);
        }
        return prev;
      }, [] as WebSocket[]),
      this.robots.valuesAsArray().map((robot) => robot.id)
    );
    this.game.initialize();
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
      members: this.size,
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
      members: Object.fromEntries([
        ...this.clients
          .entriesAsArray()
          .map(([id, client]) => [id, client.user.asRoomMember()]),
        ...[...this.robots.values()].map((robot) => [
          robot.id,
          robot.asRoomMember(),
        ]),
      ]),
      game: this.game?.serialize(),
    };
  }
}
