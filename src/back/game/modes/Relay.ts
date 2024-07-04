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
      .where("LENGTH(w.data) = :length", { length: this.room.round })
      .orderBy("RANDOM()")
      .limit(1);
    if (!this.room.rules.wide) {
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
    if (!this.room.rules.wide) {
      builder.innerJoin("w.means", "m").andWhere("m.wide = false");
    }
    const word = await builder.getOne();
    if (word === null) {
      return undefined;
    }
    return word.data;
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
    if (!this.room.rules.wide) {
      builder.innerJoin("w.means", "m").andWhere("m.wide = false");
    }
    const word = await builder.getOne();
    if (word === null) {
      return;
    }
    this.submit(word.data);
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
    if (!this.room.rules.wide) {
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
    if (this.room.rules.manner) {
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
          cache.modes.push(this.room.mode);
        }
        await this.manner.save(cache);
      }
      if (cache.modes.includes(this.room.mode)) {
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
    clearTimeout(this.turnTimer);
    this.chain(word);
    this.roundTime -= this.now - this.turnAt;
    this.player = (this.player + 1) % this.scores.size;
    this.room.broadcast(WebSocketMessage.Type.TurnEnd, {
      word: word.serialize(),
    });
    setTimeout(() => this.startTurn(), this.turnTime / 6);
  }
  public chain(word: Word): void {
    this.history.push(word.id);
    this.last = word.data.at(-1)!;
    this.lastAcceptable = getAcceptable(this.last);
  }
}

