import sha256 from "sha256";

import WebSocket from "back/utils/WebSocket";
import WebSocketGroup from "back/utils/WebSocketGroup";
import DB from "back/utils/Database";
import ImprovedMap from "back/utils/ImprovedMap";
import Channel from "back/game/Channel";
import Game from "back/game/Game";
import Robot from "back/game/Robot";
import { KKuTu } from "../../common/KKuTu";
import { WebSocketMessage } from "../../common/WebSocket";

import Relay from "back/game/types/Relay";
import WordCompetition from "back/game/types/WordCompetition";

// TODO
const TYPES: Record<any, any> = {
  [KKuTu.Game.Mode.KoreanRelay]: Relay,
  [KKuTu.Game.Mode.KoreanThree]: Relay,
  [KKuTu.Game.Mode.KoreanWordCompetition]: WordCompetition,

  [KKuTu.Game.Mode.EnglishRelay]: Relay,
  [KKuTu.Game.Mode.EnglishWordCompetition]: WordCompetition,
};
const EMPTY_PASSWORD = sha256("");
class Room extends WebSocketGroup implements Serializable<KKuTu.Room> {
  private readonly channel: Channel;
  private readonly robots = new ImprovedMap<string, Robot>();
  public readonly id: number;
  public readonly settings: Room.Settings;
  public game?: Game<KKuTu.Game.Interface>;
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
    this.settings = new Room.Settings(settings);
    this.master = master;
  }

  /**
   * 방 설정을 업데이트한다.
   *
   * @param settings 방 설정 객체.
   */
  public configure(settings: Partial<KKuTu.Room.Settings>): void {
    for (const key in settings) {
      this.settings.set(key, settings[key as keyof KKuTu.Room.Settings]);
    }
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
    this.update();
    if (this.game !== undefined) {
      if (this.settings.policy.joinWhileGaming) {
        this.game.add(socket);
      }
      this.game.update();
    }
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

    if (this.game !== undefined) {
      if (this.game.has(id)) {
        this.game.remove(id);
      }
      this.game.update();
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
    this.game = new TYPES[this.settings.mode](
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
    // TODO: remove !
    this.game!.initialize();
  }
  /**
   * 게임을 종료한다.
   */
  public async end(): Promise<void> {
    if (this.game === undefined) {
      return;
    }
    const scores = this.game.getResult();
    // TODO: 아이템 효과 적용
    const entries = scores.entriesAsArray();
    for (const client of this.clients.values()) {
      const score = scores.get(client.user.id);
      if (score === undefined) {
        client.send(WebSocketMessage.Type.End, {
          result: {
            scores: entries,
          },
        });
      } else {
        const money = Math.floor(1 + score.gain / 100);
        client.user.score += score.gain;
        client.user.money += money;
        client.send(WebSocketMessage.Type.End, {
          result: {
            scores: entries,
            gain: { score: score.gain, money },
          },
        });
      }
    }
    this.game.deinitialize();
    this.game = undefined;
    const users = [];
    for (const client of this.clients.values()) {
      if (!scores.has(client.user.id)) {
        continue;
      }
      users.push(client.user);
      client.send(WebSocketMessage.Type.UpdateMe, {
        me: client.user.serialize(),
      });
    }
    this.channel.broadcast(WebSocketMessage.Type.UpdateUserList, {
      users: users.map((user) => user.summarize()),
    });
    await DB.Manager.save(users);
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
    };
  }
}

namespace Room {
  export class Settings implements KKuTu.Room.Settings {
    public title: string;
    public policy: Record<KKuTu.Room.Policy, boolean>;
    public limit: number;
    public mode: KKuTu.Game.Mode;
    public round: number;
    public roundTime: number;
    public rules: Record<KKuTu.Game.Rule, boolean>;
    public themes: string[];
    public password: string;

    constructor(settings: KKuTu.Room.Settings) {
      this.title = settings.title;
      this.policy = settings.policy;
      this.limit = settings.limit;
      this.mode = settings.mode;
      this.round = settings.round;
      this.roundTime = settings.roundTime;
      this.rules = settings.rules;
      this.themes = settings.themes;
      this.password = settings.password;
    }

    public set(key: string, value: any): void {
      if (!Settings.validate(key, value)) {
        return;
      }
      if (value === undefined || value === null) {
        return;
      }
      Object.defineProperty(this, key, {
        value,
      });
    }
    public static isValid(settings: KKuTu.Room.Settings): boolean {
      for (const key in settings) {
        if (
          !Settings.validate(key, settings[key as keyof KKuTu.Room.Settings])
        ) {
          return false;
        }
      }
      return true;
    }
    private static validate(key: string, value: any): boolean {
      switch (key) {
        case "title":
        case "password":
          return typeof value === "string";
        case "policy":
        case "rules":
          return typeof value === "object";
        case "limit":
          return Number.isInteger(value) && 1 < value && value < 9;
        case "mode":
          return (
            Number.isInteger(value) &&
            Object.values(KKuTu.Game.Mode).includes(value)
          );
        case "round":
          return Number.isInteger(value) && 0 < value && value < 11;
        case "roundTime":
          return KKuTu.Game.ROUND_TIMES.includes(value);
        case "themes":
          return Array.isArray(value);
        default:
          return false;
      }
    }
  }
}

export default Room;

