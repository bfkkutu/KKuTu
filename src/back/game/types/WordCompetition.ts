import Game from "back/game/Game";
import Room from "back/game/Room";
import Chainable from "back/game/types/mixins/Chainable";
import Mission from "back/game/types/mixins/Mission";
import DB from "back/utils/Database";
import WebSocket from "back/utils/WebSocket";
import { random } from "back/utils/Utility";
import ImprovedMap from "back/utils/ImprovedMap";
import DefaultDictionary from "back/utils/DefaultDictionary";
import Word from "back/models/Word";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";
import { Iterator } from "../../../common/Utility";

@Game.HasTurn
export default class WordCompetition
  extends Game<KKuTu.Game.Interface.General>
  implements Chainable, Mission
{
  private declare memory: DB.Memory.Repository<Word>;
  private readonly turn: Game.Turn.Iterator;
  private readonly turnTimer = new Game.Scheduler(this);
  private turnTime = 0;
  private readonly scores = new ImprovedMap<string, number>();
  private readonly counts = new DefaultDictionary<string, number>(0);
  private readonly themes: string[];
  /**
   * 현재 round의 chain history.
   */
  private readonly history: string[] = [];
  private mission?: string;

  private declare speed: number;
  public declare currentTurn: string;
  private get id(): string {
    return `${this.mode.language}_${this.theme}`;
  }
  private get theme(): string {
    return this.themes[this.round];
  }

  constructor(room: Room, clients: WebSocket[], robots: string[]) {
    super(room, clients);

    const players = [...clients.map((client) => client.user.id), ...robots].map(
      (id) => id
    );
    this.turn = new Game.Turn.Iterator(players);
    for (const id of players) {
      this.scores.set(id, 0);
    }
    const THEMES = this.room.settings.themes || KKuTu.Game.THEMES;
    this.themes = Iterator(this.room.settings.round).map(() => random(THEMES));
  }

  protected override async startRound(): Promise<void> {
    this.memory = await DB.Memory.load(
      this.id,
      this.repository
        .createQueryBuilder("w")
        .innerJoinAndSelect("w.means", "m")
        .where("m.theme = :theme", { theme: this.theme })
    );
    this.history.length = 0;
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
    DB.Memory.unload(this.id);
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
    return this.theme;
  }
  private async getTimeoutHint(): Promise<string | undefined> {
    return this.memory.random();
  }

  public override isSubmitable(): boolean {
    return true;
  }
  public override async submit(content: string): Promise<void> {
    if (!this.memory.has(content)) {
      this.room.broadcast(WebSocketMessage.Type.TurnError, {
        errorType: "invalid",
        display: content,
      });
      return;
    }
    const word = this.memory.get(content);
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
    this.submit(this.memory.random());
  }

  public chain(word: Word): void {
    this.counts.set(word.id, this.counts.get(word.id) + 1);
    this.history.push(word.id);
  }
  public getMission(): string {
    const TABLE = Game.MISSION[this.mode.language];
    return random(TABLE);
  }

  public override add(socket: WebSocket): void {
    super.add(socket);

    this.turn.push(socket.user.id);
    this.scores.set(socket.user.id, 0);
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
    this.scores.delete(id);
  }
  public override destruct(): void {
    DB.Memory.unload(this.id);
  }

  public override serialize(): KKuTu.Game.Interface.Serialized.General {
    return {
      prompt: this.prompt,
      players: this.turn.toArray(),
      scores: this.scores.asRecord(),
    };
  }
}

