import Room from "back/game/Room";
import Mode from "back/game/Mode";
import WebSocket from "back/utils/WebSocket";
import { KKuTu } from "../../common/KKuTu";
import ObjectMap from "../../common/ObjectMap";

import Relay from "back/game/modes/Relay";

const MODES: Record<any, typeof Mode> = {
  [KKuTu.Game.Mode.KoreanRelay]: Relay,
};

export default class Game implements Serializable<KKuTu.Game> {
  private readonly room: Room;
  /**
   * Room::clients의 sub map.
   */
  private readonly clients: ObjectMap<string, WebSocket>;
  private readonly mode: Mode;
  private round: number;

  constructor(room: Room, clients: WebSocket[]) {
    this.room = room;
    this.round = 0;
    this.clients = new ObjectMap(
      clients.map((client) => [client.user.id, client])
    );
    this.mode = new MODES[this.room.mode]();
  }

  /**
   * 게임 도중 퇴장.
   *
   * @param id 퇴장한 유저의 식별자
   */
  public remove(id: string) {
    this.clients.delete(id);
  }

  public serialize(): KKuTu.Game {
    return {
      round: this.round,
      players: this.clients.keysAsArray(),
    };
  }
}
