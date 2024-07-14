import sha256 from "sha256";

import WebSocket from "back/utils/WebSocket";
import WebSocketGroup from "back/utils/WebSocketGroup";
import ImprovedMap from "back/utils/ImprovedMap";
import Channel from "back/game/Channel";
import Game from "back/game/Game";
import Robot from "back/game/Robot";
import { KKuTu } from "../../common/KKuTu";
import { WebSocketMessage } from "../../common/WebSocket";

import Relay from "back/game/types/Relay";
import WordCompetition from "back/game/types/WordCompetition";

const TYPES: Record<any, any> = {
  [KKuTu.Game.Type.Relay]: Relay,
  [KKuTu.Game.Type.WordCompetition]: WordCompetition,
};
const EMPTY_PASSWORD = sha256("");
export default class Room
  extends WebSocketGroup
  implements Serializable<KKuTu.Room>
{
  private readonly channel: Channel;
  private readonly robots = new ImprovedMap<string, Robot>();
  public readonly id: number;
  public readonly settings: KKuTu.Room.Settings;
  public game?: Game<KKuTu.Game.Type>;
  public master: string;

  public get isLocked(): boolean {
    return this.settings.password !== EMPTY_PASSWORD;
  }
  /**
   * 방이 비어있는지 여부.
   * 로봇은 제외한다.
   */
  private get isEmpty(): boolean {
    return this.clients.size === 0;
  }
  /**
   * 방이 꽉 찼는지 여부.
   * 로봇을 포함한다.
   */
  public get isFull(): boolean {
    return this.size === this.settings.limit;
  }
  /**
   * 게임을 시작할 수 있는지 여부.
   */
  public get isReady(): boolean {
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
  public get isGaming(): boolean {
    return this.game !== undefined;
  }
  /**
   * 일반 유저, 로봇 전부 포함한 전체 member의 수
   */
  private get size(): number {
    return this.clients.size + this.robots.size;
  }
  /**
   * 관전자를 제외한 member의 수
   * (player의 수)
   */
  public get count(): number {
    return (
      this.clients.valuesAsArray().filter((client) => !client.user.isSpectator)
        .length + this.robots.size
    );
  }

  constructor(
    channel: Channel,
    id: number,
    master: string,
    settings: KKuTu.Room.Settings
  ) {
    super();

    this.channel = channel;
    this.id = id;
    this.settings = settings;
    this.master = master;
  }

  /**
   * 방 설정을 업데이트한다.
   *
   * @param settings 방 설정 객체.
   */
  public configure(settings: Partial<KKuTu.Room.Settings>): void {
    const allowed = Object.keys(this.settings);
    Object.assign(
      this.settings,
      Object.fromEntries(
        Object.entries(settings).filter(([name]) => allowed.includes(name))
      )
    );
  }
  /**
   * 방에 클라이언트를 추가한다.
   *
   * @param socket 웹 소켓.
   */
  public override add(socket: WebSocket): void {
    if (this.isFull) {
      return;
    }

    super.add(socket);
    socket.user.roomId = this.id;
    socket.user.isReady = socket.user.settings.game.autoReady;
    socket.user.isSpectator = false;
    if (this.game !== undefined && this.settings.policy.joinWhileGaming) {
      this.game.add(socket);
    }
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
      this.end();
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

    if (this.game !== undefined && this.game.has(id)) {
      this.game.remove(id);
    }
    this.update();
  }
  public getRobot(id: string): Robot | undefined {
    return this.robots.get(id);
  }
  /**
   * 방에 로봇을 추가한다.
   *
   * @param robot 로봇 객체.
   */
  public addRobot(robot: Robot): void {
    if (this.isFull) {
      return;
    }

    this.robots.set(robot.id, robot);
    robot.roomId = this.id;
    robot.isReady = true;
    robot.isSpectator = false;
    this.update();
  }
  public removeRobot(id: string): void {
    this.robots.delete(id);
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
    this.game = new TYPES[KKuTu.Game.MODES[this.settings.mode].type](
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
    // TODO
    // @ts-ignore
    this.game.initialize();
  }
  /**
   * 게임을 종료한다.
   */
  public end(): void {
    if (this.game === undefined) {
      return;
    }
    this.game.destruct();
    this.game = undefined;
    this.update();
  }
  public summarize(): KKuTu.Room.Summarized {
    return {
      id: this.id,
      title: this.settings.title,
      policy: this.settings.policy,
      limit: this.settings.limit,
      mode: this.settings.mode,
      round: this.settings.round,
      roundTime: this.settings.roundTime,
      rules: this.settings.rules,
      themes: this.settings.themes,
      members: this.size,
      isLocked: this.isLocked,
      isGaming: this.isGaming,
    };
  }
  public serialize(): KKuTu.Room.Detailed {
    return {
      id: this.id,
      title: this.settings.title,
      policy: this.settings.policy,
      limit: this.settings.limit,
      mode: this.settings.mode,
      round: this.settings.round,
      roundTime: this.settings.roundTime,
      rules: this.settings.rules,
      themes: this.settings.themes,
      master: this.master,
      members: Object.fromEntries(
        [
          ...this.clients.valuesAsArray().map((client) => client.user),
          ...this.robots.values(),
        ].map((user) => [user.id, user.asRoomMember()])
      ),
      game: this.game?.serialize(),
    };
  }
}

