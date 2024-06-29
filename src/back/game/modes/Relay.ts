import Game from "back/game/Game";
import Chainable from "back/game/modes/mixins/Chainable";
import Word from "back/models/Word";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class Relay extends Game implements Chainable {
  public history: string[] = [];
  public last: string = "";

  protected override startRound(): void {
    this.history.length = 0;
    this.last = this.prompt[this.round];
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
    return this.last;
  }
  protected override async robotSubmit(): Promise<void> {
    const word = await this.repository
      .createQueryBuilder("w")
      .select(["w.data"])
      .where(
        "w.data LIKE :last AND LENGTH(w.data) > 1 AND LENGTH(w.data) < 9",
        {
          last: `${this.last}%`,
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
    return content.length > 1 && content.startsWith(this.last);
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
    this.room.broadcast(WebSocketMessage.Type.TurnEnd, word.serialize());
    setTimeout(() => this.startTurn(), this.turnTime / 6);
  }
  public chain(word: Word): void {
    this.history.push(word.id);
    this.last = word.data.at(-1)!;
  }
}
