import { KKuTu } from "../../common/KKuTu";
import Room from "back/game/Room";
import Mode from "back/game/Mode";
import WebSocket from "back/utils/WebSocket";

import Relay from "back/game/modes/Relay";

const MODES: Record<any, typeof Mode> = {
  [KKuTu.Game.Mode.KoreanRelay]: Relay,
};

export default class Game implements Serializable<KKuTu.Game> {
  private readonly room: Room;
  private readonly clients: WebSocket[];
  private readonly mode: Mode;
  private round: number;

  constructor(room: Room, clients: WebSocket[]) {
    this.room = room;
    this.round = 0;
    this.clients = clients;
    this.mode = new MODES[this.room.mode]();
  }

  public serialize(): KKuTu.Game {
    return {
      round: this.round,
      players: this.clients.map((client) => client.user.id),
    };
  }
}
