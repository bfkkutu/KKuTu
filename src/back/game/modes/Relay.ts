import * as TypeORM from "typeorm";

import Game from "back/game/Game";
import Chainable from "back/game/modes/mixins/Chainable";
import Word from "back/models/Word";
import * as Cache from "back/models/cache";
import { getAcceptable } from "back/utils/Utility";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class Relay extends Game implements Chainable {
  /**
   * 현재 round의 chain history.
   */
  private readonly history: string[] = [];
  private last: string = "";
  private lastAcceptable?: string;

  protected override startRound(): void {
    this.history.length = 0;
    this.last = this.prompt[this.round];
    this.lastAcceptable = getAcceptable(this.last);
    return super.startRound();
  }
  protected override startTurn(): void {
    this.roundTime = Math.min(
      this.roundTime,
      Math.max(10000, 150000 - this.history.length * 1500)
    );
    return super.startTurn();
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
  protected override async getTimeoutHint(): Promise<string | undefined> {
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
              acceptable: this.lastAcceptable,
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
  protected override getScore(): number {
    const lastChain = this.history.at(-1)!;
    const base =
      ((5 + 7 * lastChain.length) ** 0.74 + 0.88 * this.history.length) *
      (2 - this.turnTimer.delay / this.turnTime);
    // TODO: mission
    return Math.round(base);
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
    this.synchronizer.freeze();
    this.turnTimer.cancel();
    this.roundTime -= this.turnTimer.delay;
    this.turn.next();
    this.room.broadcast(WebSocketMessage.Type.TurnEnd, {
      word: word.serialize(),
      score: this.getScore(),
    });
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
              acceptable: this.lastAcceptable,
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

  public chain(word: Word): void {
    this.history.push(word.id);
    this.last = word.data.at(-1)!;
    this.lastAcceptable = getAcceptable(this.last);
  }
}

