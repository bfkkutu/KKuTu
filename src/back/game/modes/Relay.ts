import Game from "back/game/Game";
import Chainable from "back/game/modes/mixins/Chainable";
import Word from "back/models/Word";
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
  protected override async getTimeoutHint(): Promise<string | undefined> {
    const similar = [this.last];
    if (this.lastAcceptable !== undefined) {
      similar.push(this.lastAcceptable);
    }
    const word = await this.repository
      .createQueryBuilder("w")
      .select(["w.data"])
      .where("w.data SIMILAR TO :similar", {
        similar: `(${similar.join("|")})%`,
      })
      .orderBy("RANDOM()")
      .limit(1)
      .getOne();
    if (word === null) {
      return undefined;
    }
    return word.data;
  }
  protected override async robotSubmit(): Promise<void> {
    const similar = [this.last];
    if (this.lastAcceptable !== undefined) {
      similar.push(this.lastAcceptable);
    }
    const word = await this.repository
      .createQueryBuilder("w")
      .select(["w.data"])
      .where(
        "w.data SIMILAR TO :similar AND (LENGTH(w.data) > 1 AND LENGTH(w.data) < 9)",
        {
          similar: `(${similar.join("|")})%`,
        }
      )
      .orderBy("RANDOM()")
      .limit(1)
      .getOne();
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
    const word = await this.repository
      .createQueryBuilder("w")
      .where("w.data = :data", { data: content })
      .getOne();
    if (word === null) {
      this.room.broadcast(WebSocketMessage.Type.TurnError, {
        errorType: "invalid",
        display: content,
      });
      return;
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
