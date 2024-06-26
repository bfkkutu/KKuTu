import Room from "back/game/Room";
import Mode from "back/game/Mode";
import WebSocket from "back/utils/WebSocket";
import DB from "back/utils/Database";
import Word, { WordEn, WordKo } from "back/models/Word";
import { KKuTu } from "../../common/KKuTu";
import ImprovedMap from "../../common/ImprovedMap";
import { WebSocketMessage } from "../../common/WebSocket";

import Relay from "back/game/modes/Relay";

const MODES: Record<any, any> = {
  [KKuTu.Game.Mode.KoreanRelay]: Relay,
};
const ENTRIES: Record<KKuTu.Game.Language, typeof Word> = {
  [KKuTu.Game.Language.Korean]: WordKo,
  [KKuTu.Game.Language.English]: WordEn,
};

export default class Game implements Serializable<KKuTu.Game> {
  private readonly room: Room;
  /**
   * Room::clients의 sub map.
   */
  private readonly clients: ImprovedMap<string, WebSocket>;
  private readonly scores: ImprovedMap<string, number>;
  private readonly mode: Mode;
  private prompt: string = "①②③④⑤⑥⑦⑧⑨⑩";
  private round: number;

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
    this.mode = new MODES[this.room.mode]();
    this.round = 0;
  }

  public async initialize(): Promise<void> {
    const mode = KKuTu.Game.modes[this.room.mode];
    if (mode.prompt === KKuTu.Game.Prompt.Word) {
      const word = await DB.Manager.createQueryBuilder(
        ENTRIES[mode.language],
        "w"
      )
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
    setTimeout(() => this.startRound(), 1000);
  }
  public startRound(): void {
    this.room.broadcast(WebSocketMessage.Type.RoundStart, {
      round: this.round,
    });
  }
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
