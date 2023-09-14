import { Game } from "common/Game";
import Room from "back/game/Room";
import Mode from "back/game/Mode";

import Relay from "back/game/modes/Relay";

const MODES: Record<any, typeof Mode> = {
  [Game.Mode.KoreanRelay]: Relay,
};

export default class {
  /**
   * @reference
   */
  private readonly room: Room;
  public round: number;
  public players: string[];
  private readonly mode: Mode;

  constructor(room: Room, players: string[]) {
    this.room = room;
    this.round = 0;
    this.players = players;
    this.mode = new MODES[this.room.mode]();
  }

  public serialize() {
    return {
      round: this.round,
      players: this.players,
    };
  }
}
