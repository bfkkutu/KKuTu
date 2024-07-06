import * as TypeORM from "typeorm";

import Room from "back/game/Room";
import WebSocket from "back/utils/WebSocket";
import DB from "back/utils/Database";
import Word from "back/models/Word";
import * as Cache from "back/models/cache";
import { KKuTu } from "../../common/KKuTu";
import ImprovedMap from "../../common/ImprovedMap";
import { WebSocketMessage } from "../../common/WebSocket";

const PROMPT_DEFAULT: Record<KKuTu.Game.Language, string> = {
  [KKuTu.Game.Language.Korean]: "가나다라마바사아자차",
  [KKuTu.Game.Language.English]: "abcdefghij",
};
export abstract class Game implements Serializable<KKuTu.Game> {
  protected readonly room: Room;
  /**
   * Room::clients의 sub map.
   * 로봇은 포함하지 않는다.
   */
  private readonly clients: ImprovedMap<string, WebSocket>;
  protected readonly mode: KKuTu.Game.IMode;
  protected readonly repository: TypeORM.Repository<Word>;
  protected readonly manner: TypeORM.Repository<Cache.Manner>;
  /**
   * 제시어.
   */
  protected prompt: string = "①②③④⑤⑥⑦⑧⑨⑩";
  /**
   * 현재 진행 중인 round index.
   */
  protected round: number;
  protected turn: Game.TurnIterator;

  protected roundTime = 0;
  protected turnTime = 0;
  /**
   * turn이 시작한 시점.
   */
  protected turnAt = 0;

  protected turnTimer?: NodeJS.Timeout;

  protected get now(): number {
    return new Date().getTime();
  }
  private get speed(): number {
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
  public get current(): string {
    return this.turn.current.id;
  }

  constructor(room: Room, clients: WebSocket[], robots: string[]) {
    this.room = room;
    this.clients = new ImprovedMap(
      clients.map((client) => [client.user.id, client])
    );
    this.mode = KKuTu.Game.modes[this.room.settings.mode];
    this.repository = DB.Manager.getRepository(Word[this.mode.language]);
    this.manner = DB.Manager.getRepository(Cache.Manner[this.mode.language]);
    this.round = 0;
    this.turn = new Game.TurnIterator(
      [...clients.map((client) => client.user.id), ...robots].map((id) => id)
    );
  }

  public async initialize(): Promise<void> {
    const word = await this.getPrompt();
    this.prompt =
      word === undefined ? PROMPT_DEFAULT[this.mode.language] : word;
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
  protected startTurn(): void {
    this.turnAt = this.now;
    this.turnTime = 15000 - 1400 * this.speed;
    this.turnTimer = setTimeout(
      () => this.endRound(),
      Math.min(this.roundTime, this.turnTime + 100)
    );
    this.room.broadcast(WebSocketMessage.Type.TurnStart, {
      display: this.getDisplay(),
      player: this.turn.current.id,
      speed: this.speed,
      time: this.turnTime,
      roundTime: this.roundTime,
      at: this.turnAt,
    });
    if (!this.clients.has(this.turn.current.id) && this.turnTime > 3000) {
      setTimeout(() => this.robotSubmit(), 3000);
    }
  }
  /**
   * 입력에 실패하였다.
   * 현재 라운드를 종료하고 다음 라운드로 넘어간다.
   * RoundEnd 메시지를 전송한다.
   */
  private async endRound(): Promise<void> {
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
  protected abstract robotSubmit(): Promise<void>;

  public abstract isSubmitable(content: string): boolean;
  public abstract submit(content: string): Promise<void>;

  /**
   * 게임 도중 입장. (바로 참여)
   *
   * @param socket 입장한 유저의 식별자.
   */
  public add(socket: WebSocket): void {
    this.clients.set(socket.user.id, socket);
    this.turn.push(socket.user.id);
  }
  /**
   * 게임 도중 퇴장.
   *
   * @param id 퇴장한 유저의 식별자.
   */
  public remove(id: string): void {
    this.clients.delete(id);
    this.turn.remove(id);
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

  public serialize(): KKuTu.Game {
    return {
      prompt: this.prompt,
      players: this.turn.serialize(),
    };
  }
}

export namespace Game {
  class Player implements Serializable<KKuTu.Game.Player> {
    public readonly id: string;
    public score: number = 0;

    constructor(id: string) {
      this.id = id;
    }

    public serialize(): KKuTu.Game.Player {
      return {
        id: this.id,
        score: this.score,
      };
    }
  }

  export class TurnIterator implements Serializable<KKuTu.Game.Player[]> {
    private readonly players: Player[];
    private cursor: number = 0;

    public get current(): Player {
      return this.players[this.cursor];
    }

    constructor(players: string[]) {
      this.players = players.map((id) => new Player(id));
    }

    public next(): Player {
      this.cursor = (this.cursor + 1) % this.players.length;
      return this.current;
    }
    public push(id: string): void {
      this.players.push(new Player(id));
    }
    public remove(id: string): void {
      const index = this.players.findIndex((player) => player.id === id);
      this.players.splice(index, 1);
      if (this.cursor < index) {
        return;
      }
      --this.cursor;
    }

    public serialize(): KKuTu.Game.Player[] {
      return this.players.map((player) => player.serialize());
    }
  }
}

export default Game;

