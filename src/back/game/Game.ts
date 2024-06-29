import * as TypeORM from "typeorm";

import Room from "back/game/Room";
import WebSocket from "back/utils/WebSocket";
import DB from "back/utils/Database";
import Word, { WordEn, WordKo } from "back/models/Word";
import { KKuTu } from "../../common/KKuTu";
import ImprovedMap from "../../common/ImprovedMap";
import { WebSocketMessage } from "../../common/WebSocket";

const ENTRIES: Record<KKuTu.Game.Language, typeof Word> = {
  [KKuTu.Game.Language.Korean]: WordKo,
  [KKuTu.Game.Language.English]: WordEn,
};

export default abstract class Game implements Serializable<KKuTu.Game> {
  protected readonly room: Room;
  /**
   * Room::clients의 sub map.
   * 로봇은 포함하지 않는다.
   */
  private readonly clients: ImprovedMap<string, WebSocket>;
  /**
   * 로봇을 포함한 모든 player의 id : score Mapping.
   */
  protected readonly scores: ImprovedMap<string, number>;
  protected readonly mode: KKuTu.Game.IMode;
  protected readonly repository: TypeORM.Repository<Word>;
  /**
   * 제시어.
   */
  protected prompt: string = "①②③④⑤⑥⑦⑧⑨⑩";
  /**
   * 현재 진행 중인 round index.
   */
  protected round: number;
  protected player: number;

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

  constructor(room: Room, clients: WebSocket[], robots: string[]) {
    this.room = room;
    this.clients = new ImprovedMap(
      clients.map((client) => [client.user.id, client])
    );
    this.scores = new ImprovedMap(
      [...clients.map((client) => client.user.id), ...robots].map((id) => [
        id,
        0,
      ])
    );
    this.mode = KKuTu.Game.modes[this.room.mode];
    this.repository = DB.Manager.getRepository(ENTRIES[this.mode.language]);
    this.round = 0;
    this.player = 0;
  }

  public async initialize(): Promise<void> {
    if (this.mode.prompt === KKuTu.Game.Prompt.Word) {
      const word = await this.repository
        .createQueryBuilder("w")
        .select(["w.data"])
        .where("LENGTH(w.data) = :length", { length: this.room.round })
        .orderBy("RANDOM()")
        .limit(1)
        .getOne();
      this.prompt = word === null ? "가나다라마바사아자차" : word.data;
    }
    this.room.broadcast(WebSocketMessage.Type.Start, {
      game: this.serialize(),
    });
    setTimeout(() => this.startRound(), 2000);
  }
  protected startRound(): void {
    this.roundTime = this.room.roundTime * 1000;
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
    const player = this.scores.keysAsArray()[this.player];
    this.room.broadcast(WebSocketMessage.Type.TurnStart, {
      display: this.getDisplay(),
      player,
      speed: this.speed,
      time: this.turnTime,
    });
    if (!this.clients.has(player) && this.turnTime > 3000) {
      setTimeout(() => this.robotSubmit(), 3000);
    }
  }
  /**
   * 입력에 실패하였다.
   * 현재 라운드를 종료하고 다음 라운드로 넘어간다.
   * RoundEnd 메시지를 전송한다.
   */
  private endRound(): void {
    this.room.broadcast(WebSocketMessage.Type.RoundEnd, { loss: 0 });
    setTimeout(() => {
      if (++this.round < this.room.round) {
        this.startRound();
        return;
      }
      this.room.end();
    }, 3000);
  }
  protected abstract getDisplay(): string;
  protected abstract robotSubmit(): Promise<void>;
  public abstract isSubmitable(content: string): boolean;
  public abstract submit(content: string): Promise<void>;
  /**
   * 게임 도중 퇴장.
   *
   * @param id 퇴장한 유저의 식별자
   */
  public remove(id: string): void {
    this.clients.delete(id);
  }

  public serialize(): KKuTu.Game {
    return {
      prompt: this.prompt,
      players: this.scores.asRecord(),
    };
  }
}
