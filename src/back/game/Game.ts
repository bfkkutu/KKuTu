import * as TypeORM from "typeorm";

import Room from "back/game/Room";
import WebSocket from "back/utils/WebSocket";
import DB from "back/utils/Database";
import Synchronizable from "back/utils/Synchronizable";
import ImprovedMap from "back/utils/ImprovedMap";
import Word from "back/models/Word";
import { KKuTu } from "../../common/KKuTu";
import { WebSocketMessage } from "../../common/WebSocket";
import { sum } from "../../common/Utility";

const DEFAULT_PROMPTS: Record<KKuTu.Game.Language, string> = {
  [KKuTu.Game.Language.Korean]: "가나다라마바사아자차",
  [KKuTu.Game.Language.English]: "abcdefghij",
};
abstract class Game<T extends KKuTu.Game.Interface>
  extends Synchronizable
  implements Serializable<KKuTu.Game.Interface.Serialized[T]>
{
  protected readonly room: Room;
  /**
   * Room::clients의 sub map.
   * 로봇은 포함하지 않는다.
   */
  protected readonly clients: ImprovedMap<string, WebSocket>;
  protected readonly scores = new ImprovedMap<string, number>();
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
    for (const id of [...clients.map((client) => client.user.id), ...robots]) {
      this.scores.set(id, 0);
    }
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

  public abstract isSubmitable(content: string): boolean;
  public abstract submit(content: string): Promise<void>;
  /**
   * 임시 (테스트 용)
   */
  protected abstract robotSubmit(): Promise<void>;
  protected abstract getMultiplier(): number;
  public getResult(): ImprovedMap<string, KKuTu.Game.Result.Score> {
    const R = new ImprovedMap<string, KKuTu.Game.Result.Score>();

    const sortedScores = this.scores
      .entriesAsArray()
      .sort((a, b) => b[1] - a[1]);
    const sumOfScores = sum(this.scores.valuesAsArray());
    for (let rank = 0; rank < sortedScores.length; ++rank) {
      const [key, value] = sortedScores[rank];
      const score =
        value *
        this.getMultiplier() *
        (0.77 + (this.scores.size - rank) ** 2 / 20) *
        (1.25 / (1 + 1.25 * (value / sumOfScores) ** 2));
      R.set(key, {
        value,
        gain: isNaN(score) ? 0 : Math.floor(score),
      });
    }

    return R;
  }

  /**
   * 게임 도중 입장. (바로 참여)
   *
   * @param socket 입장한 유저의 식별자.
   */
  public add(socket: WebSocket): void {
    this.clients.set(socket.user.id, socket);
    this.scores.set(socket.user.id, 0);
  }
  /**
   * 게임 도중 퇴장.
   *
   * @param id 퇴장한 유저의 식별자.
   */
  public remove(id: string): void {
    this.clients.delete(id);
    this.scores.delete(id);
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
  /**
   * 게임이 종료될 때 호출된다.
   * 게임 중 외부 자원을 사용했다면
   * 이 곳에서 반환해야 한다.
   */
  public deinitialize(): void {}

  public abstract serialize(): KKuTu.Game.Interface.Serialized[T];
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

  export function HasTurn(cls: any): any {
    return class extends cls {
      private declare readonly turn: Turn.Iterator;
      private declare readonly turnTimer: Game.Scheduler;
      private declare roundTime: number;
      private declare turnTime: number;

      protected get speed(): number {
        if (this.roundTime < 5000) {
          return 10;
        } else if (this.roundTime < 11000) {
          return 9;
        } else if (this.roundTime < 18000) {
          return 8;
        } else if (this.roundTime < 26000) {
          return 7;
        } else if (this.roundTime < 35000) {
          return 6;
        } else if (this.roundTime < 45000) {
          return 5;
        } else if (this.roundTime < 56000) {
          return 4;
        } else if (this.roundTime < 68000) {
          return 3;
        } else if (this.roundTime < 81000) {
          return 2;
        } else if (this.roundTime < 95000) {
          return 1;
        } else {
          return 0;
        }
      }
      public get currentTurn(): string {
        return this.turn.current;
      }
    };
  }
  export namespace Turn {
    export class Iterator {
      private readonly players: string[];
      private cursor: number = 0;

      public get current(): string {
        return this.players[this.cursor];
      }

      constructor(players: string[]) {
        this.players = players;
      }

      public next(): string {
        this.cursor = (this.cursor + 1) % this.players.length;
        return this.current;
      }
      public push(id: string): void {
        this.players.push(id);
      }
      public remove(id: string): void {
        const index = this.players.findIndex((v) => v === id);
        this.players.splice(index, 1);
        if (this.cursor < index) {
          return;
        }
        --this.cursor;
      }
      public indexOf(id?: string): number {
        return id === undefined ? this.cursor : this.players.indexOf(id);
      }
      public toArray(): readonly string[] {
        return this.players;
      }
    }
  }

  export const MISSION = {
    [KKuTu.Game.Language.Korean]: [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바",
      "사",
      "아",
      "자",
      "차",
      "카",
      "타",
      "파",
      "하",
    ],
    [KKuTu.Game.Language.English]: [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
    ],
  };
}

export default Game;

