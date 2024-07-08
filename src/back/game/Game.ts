import * as TypeORM from "typeorm";

import Room from "back/game/Room";
import WebSocket from "back/utils/WebSocket";
import DB from "back/utils/Database";
import Synchronizable from "back/utils/Synchronizable";
import Word from "back/models/Word";
import { KKuTu } from "../../common/KKuTu";
import ImprovedMap from "../utils/ImprovedMap";
import { WebSocketMessage } from "../../common/WebSocket";

const DEFAULT_PROMPTS: Record<KKuTu.Game.Language, string> = {
  [KKuTu.Game.Language.Korean]: "가나다라마바사아자차",
  [KKuTu.Game.Language.English]: "abcdefghij",
};
abstract class Game<T extends KKuTu.Game.Type>
  extends Synchronizable
  implements Serializable<KKuTu.Game.Type.Serialized[T]>
{
  protected readonly room: Room;
  /**
   * Room::clients의 sub map.
   * 로봇은 포함하지 않는다.
   */
  protected readonly clients: ImprovedMap<string, WebSocket>;
  protected readonly mode: KKuTu.Game.ModeConfiguration;
  protected readonly repository: TypeORM.Repository<Word>;
  /**
   * 제시어.
   */
  protected prompt: string = "①②③④⑤⑥⑦⑧⑨⑩";

  /**
   * 현재 진행 중인 round index.
   */
  protected round: number;
  protected roundTime = 0;

  constructor(room: Room, clients: WebSocket[], robots: string[]) {
    super();

    this.room = room;
    this.clients = new ImprovedMap(
      clients.map((client) => [client.user.id, client])
    );
    this.mode = KKuTu.Game.MODES[this.room.settings.mode];
    this.repository = DB.Manager.getRepository(Word[this.mode.language]);
    this.round = 0;
  }

  public async initialize(): Promise<void> {
    const word = await this.getPrompt();
    this.prompt =
      word === undefined ? DEFAULT_PROMPTS[this.mode.language] : word;
    this.room.broadcast(WebSocketMessage.Type.Start, {
      game: this.serialize(),
    });
    setTimeout(() => this.startRound(), 2000);
  }
  protected startRound(): void {
    this.roundTime = this.room.settings.roundTime * 1000;
    this.room.broadcast(WebSocketMessage.Type.RoundStart, {
      round: this.round,
    });
    setTimeout(() => this.startTurn(), 2400);
  }
  protected abstract startTurn(): void;
  /**
   * 입력에 실패하였다.
   * 현재 라운드를 종료하고 다음 라운드로 넘어간다.
   * RoundEnd 메시지를 전송한다.
   */
  protected async endRound(): Promise<void> {
    this.room.broadcast(WebSocketMessage.Type.RoundEnd, {
      display: await this.getTimeoutHint(),
      loss: 0,
    });
    setTimeout(() => {
      if (++this.round < this.room.settings.round) {
        this.startRound();
        return;
      }
      this.room.end();
    }, 3000);
  }
  protected async getPrompt(): Promise<string | undefined> {
    return "①②③④⑤⑥⑦⑧⑨⑩";
  }
  protected abstract getDisplay(): string;
  protected abstract getTimeoutHint(): Promise<string | undefined>;
  protected abstract getScore(word: Word): number;

  public abstract isSubmitable(content: string): boolean;
  public abstract submit(content: string): Promise<void>;
  protected abstract robotSubmit(): Promise<void>;

  /**
   * 게임 도중 입장. (바로 참여)
   *
   * @param socket 입장한 유저의 식별자.
   */
  public add(socket: WebSocket): void {
    this.clients.set(socket.user.id, socket);
  }
  /**
   * 게임 도중 퇴장.
   *
   * @param id 퇴장한 유저의 식별자.
   */
  public remove(id: string): void {
    this.clients.delete(id);
  }
  /**
   * 특정 유저가 현재 이 게임에 참여하고
   * 있는지 여부를 반환한다.
   *
   * @param id 유저 식별자.
   * @returns 유저가 이 게임에 참여하고 있는지 여부.
   */
  public has(id: string): boolean {
    return this.clients.has(id);
  }

  public abstract serialize(): KKuTu.Game.Type.Serialized[T];
}

namespace Game {
  export class Scheduler extends Synchronizable {
    private timeout?: NodeJS.Timeout;
    public at: number = 0;

    public get delay(): number {
      return this.now - this.at;
    }

    public cancel(): void {
      clearTimeout(this.timeout);
    }
    public schedule(callback: Function, ms: number): void {
      this.cancel();
      this.timeout = setTimeout(() => callback(), ms);
      this.at = this.now;
    }
  }
}

export default Game;

