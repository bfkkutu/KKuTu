import * as TypeORM from "typeorm";

import Game from "back/game/Game";
import Room from "back/game/Room";
import Chainable from "back/game/types/mixins/Chainable";
import Mission from "back/game/types/mixins/Mission";
import DB from "back/utils/Database";
import WebSocket from "back/utils/WebSocket";
import { getAcceptable, random } from "back/utils/Utility";
import DefaultDictionary from "back/utils/DefaultDictionary";
import Word from "back/models/Word";
import * as Cache from "back/models/cache";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";

@Game.HasTurn
export default class Relay
  extends Game<KKuTu.Game.Interface.General>
  implements Chainable, Mission
{
  private readonly manner: TypeORM.Repository<Cache.Manner>;
  private readonly turn: Game.Turn.Iterator;
  private readonly turnTimer = new Game.Scheduler(this);
  private turnTime = 0;
  private readonly counts = new DefaultDictionary<string, number>(0);
  /**
   * 현재 round의 chain history.
   */
  private readonly history: string[] = [];
  private last: string = "";
  private lastAcceptable?: string;
  private mission?: string;

  private declare speed: number;
  public declare currentTurn: string;

  constructor(room: Room, clients: WebSocket[], robots: string[]) {
    super(room, clients, robots);

    this.manner = DB.Manager.getRepository(this.getMannerEntity());
    this.turn = new Game.Turn.Iterator(this.scores.keysAsArray());
  }
  private getMannerEntity(): typeof Cache.Manner {
    if (
      this.mode.language === KKuTu.Game.Language.Korean &&
      this.room.settings.rules.noInitial
    ) {
      return Cache.Manner.koNoInitial;
    }
    return Cache.Manner[this.mode.language];
  }

  protected override startRound(): void {
    this.history.length = 0;
    this.last = this.prompt[this.round];
    if (!this.room.settings.rules.noInitial) {
      this.lastAcceptable = getAcceptable(this.last);
    }
    if (this.room.settings.rules.mission) {
      this.mission = this.getMission();
    }
    super.startRound();
  }
  protected override startTurn(): void {
    this.roundTime = Math.min(
      this.roundTime,
      Math.max(10000, 150000 - this.history.length * 1500)
    );
    this.turnTime = 15000 - 1400 * this.speed;
    this.unfreeze();
    this.turnTimer.schedule(
      () => this.endRound(),
      Math.min(this.roundTime, this.turnTime + 100)
    );
    this.room.broadcast(WebSocketMessage.Type.TurnStart, {
      display: this.getDisplay(),
      hint: this.mission,
      player: this.turn.indexOf(),
      speed: this.speed,
      time: this.turnTime,
      roundTime: this.roundTime,
      at: this.turnTimer.at,
    });
    if (!this.clients.has(this.turn.current) && this.turnTime > 3000) {
      setTimeout(() => this.robotSubmit(), 3000);
    }
  }
  protected override async endRound(): Promise<void> {
    const score = this.scores.get(this.turn.current);
    if (score !== undefined) {
      const loss = Math.round(
        Math.min(10 + this.history.length * 2.1 + score * 0.15, score)
      );
      this.room.broadcast(WebSocketMessage.Type.RoundEnd, {
        display: await this.getTimeoutHint(),
        loss,
      });
    }
    super.endRound();
  }

  protected override getDisplay(): string {
    if (this.lastAcceptable === undefined) {
      return this.last;
    }
    return `${this.last}(${this.lastAcceptable})`;
  }
  protected override async getPrompt(): Promise<string | undefined> {
    const builder = this.repository
      .createQueryBuilder("w")
      .select(["w.data"])
      .where("LENGTH(w.data) = :length", { length: this.room.settings.round })
      .orderBy("RANDOM()")
      .limit(1);
    if (!this.room.settings.rules.wide) {
      builder.innerJoin("w.means", "m").andWhere("m.wide = false");
    }
    const word = await builder.getOne();
    if (word === null) {
      return undefined;
    }
    return word.data;
  }
  private async getTimeoutHint(): Promise<string | undefined> {
    const builder = this.repository
      .createQueryBuilder("w")
      .select(["w.data"])
      .where(
        new TypeORM.Brackets((query) => {
          query.where("w.data LIKE :last", {
            last: `${this.last}%`,
          });
          if (this.lastAcceptable !== undefined) {
            query.orWhere("w.data LIKE :acceptable", {
              acceptable: `${this.lastAcceptable}%`,
            });
          }
        })
      )
      .andWhere("LENGTH(w.data) > 1")
      .orderBy("RANDOM()")
      .limit(1);
    if (!this.room.settings.rules.wide) {
      builder.innerJoin("w.means", "m").andWhere("m.wide = false");
    }
    const word = await builder.getOne();
    if (word === null) {
      return undefined;
    }
    return word.data;
  }

  public override isSubmitable(content: string): boolean {
    if (content.length < 2) {
      return false;
    }
    return (
      content.startsWith(this.last) ||
      (this.lastAcceptable !== undefined &&
        content.startsWith(this.lastAcceptable))
    );
  }
  public override async submit(content: string): Promise<void> {
    const builder = this.repository
      .createQueryBuilder("w")
      .where("w.data = :data", { data: content })
      .innerJoinAndSelect("w.means", "m");
    if (!this.room.settings.rules.wide) {
      builder.andWhere("m.wide = false");
    }
    const word = await builder.getOne();
    if (word === null) {
      this.room.broadcast(WebSocketMessage.Type.TurnError, {
        errorType: "invalid",
        display: content,
      });
      return;
    }
    if (this.room.settings.rules.manner) {
      const last = word.data.at(-1)!;
      let cache = await this.manner
        .createQueryBuilder("c_m")
        .select(["c_m.modes"])
        .where("c_m.last = :last", { last })
        .getOne();
      if (cache === null) {
        // cache miss
        cache = new Cache.Manner();
        cache.last = last;
        cache.modes = [];
        if (
          !(await this.repository
            .createQueryBuilder("w")
            .where("w.data LIKE :last", { last: `${last}%` })
            .getExists())
        ) {
          cache.modes.push(this.room.settings.mode);
        }
        await this.manner.save(cache);
      }
      if (cache.modes.includes(this.room.settings.mode)) {
        this.room.broadcast(WebSocketMessage.Type.TurnError, {
          errorType: "manner",
          display: content,
        });
        return;
      }
    }
    if (this.history.includes(word.id)) {
      this.room.broadcast(WebSocketMessage.Type.TurnError, {
        errorType: "inHistory",
        display: content,
      });
      return;
    }
    this.chain(word);
    this.freeze();
    this.turnTimer.cancel();
    this.roundTime -= this.turnTimer.delay;
    const score = this.scores.get(this.turn.current);
    if (score !== undefined) {
      let gain =
        ((5 + 7 * word.data.length) ** 0.74 + 0.88 * this.history.length) *
        (2 - this.turnTimer.delay / this.turnTime) *
        (15 / (this.counts.get(word.id) + 15));
      if (this.mission !== undefined) {
        const match = word.data.match(new RegExp(this.mission, "g"));
        if (match !== null) {
          gain += (gain / 2) * match.length;
          this.mission = this.getMission();
        }
      }
      gain = Math.round(gain);
      this.scores.set(this.turn.current, score + gain);
      this.turn.next();
      this.room.broadcast(WebSocketMessage.Type.TurnEnd, {
        word: word.serialize(),
        gain,
      });
    }
    setTimeout(() => this.startTurn(), this.turnTime / 6);
  }
  protected override async robotSubmit(): Promise<void> {
    const builder = this.repository
      .createQueryBuilder("w")
      .select(["w.data"])
      .where(
        new TypeORM.Brackets((query) => {
          query.where("w.data LIKE :last", {
            last: `${this.last}%`,
          });
          if (this.lastAcceptable !== undefined) {
            query.orWhere("w.data LIKE :acceptable", {
              acceptable: `${this.lastAcceptable}%`,
            });
          }
        })
      )
      .andWhere("LENGTH(w.data) > 1")
      .orderBy("RANDOM()")
      .limit(1);
    if (!this.room.settings.rules.wide) {
      builder.innerJoin("w.means", "m").andWhere("m.wide = false");
    }
    const word = await builder.getOne();
    if (word === null) {
      return;
    }
    this.submit(word.data);
  }
  protected getMultiplier(): number {
    switch (this.mode.language) {
      case KKuTu.Game.Language.Korean:
        return 0.55;
      case KKuTu.Game.Language.English:
        return 0.5;
    }
  }

  public chain(word: Word): void {
    this.counts.set(word.id, this.counts.get(word.id) + 1);
    this.history.push(word.id);
    this.last = word.data.at(-1)!;
    if (!this.room.settings.rules.noInitial) {
      this.lastAcceptable = getAcceptable(this.last);
    }
  }
  public getMission(): string {
    const TABLE = Game.MISSION[this.mode.language];
    return random(TABLE);
  }

  public override add(socket: WebSocket): void {
    super.add(socket);

    this.turn.push(socket.user.id);
  }
  public override remove(id: string): void {
    super.remove(id);

    if (this.turn.current === id) {
      // 본인 턴의 진행 도중 퇴장한 경우.
      this.turnTimer.cancel();
      this.turn.next();
      this.startTurn();
    }
    this.turn.remove(id);
  }

  public override serialize(): KKuTu.Game.Interface.Serialized.General {
    return {
      prompt: this.prompt,
      players: this.turn.toArray(),
      scores: this.scores.asRecord(),
    };
  }
}

