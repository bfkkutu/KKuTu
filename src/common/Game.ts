export namespace Game {
  export enum Mode {
    KoreanRelay,
    KoreanThree,
    KoreanKKuTu,
    KoreanRelayReversed,
  }
  export enum Rule {
    Manner = "manner",
    WideTheme = "wide",
    Mission = "mission",
  }

  export const availableRules: Record<Mode, Rule[]> = {
    [Mode.KoreanRelay]: [Rule.Manner, Rule.WideTheme, Rule.Mission],
    [Mode.KoreanThree]: [Rule.Manner, Rule.WideTheme, Rule.Mission],
    [Mode.KoreanKKuTu]: [Rule.Manner, Rule.WideTheme, Rule.Mission],
    [Mode.KoreanRelayReversed]: [Rule.Manner, Rule.WideTheme, Rule.Mission],
  };

  export interface RoomSearchOptions {
    title: string;
    mode: Mode;
    round: NumberRange;
    roundTime: NumberRange;
    rules: Record<Rule, boolean>;
  }
  export interface RoomMember {
    id: string;
    isReady: boolean;
    isSpectator: boolean;
  }
  export interface BaseRoom {
    title: string;
    limit: number;
    mode: Mode;
    round: number;
    roundTime: number;
    rules: Record<Rule, boolean>;
  }
  export interface RoomSettings extends BaseRoom {
    password: string;
  }
  export interface Room extends BaseRoom {
    id: number;
  }
  /**
   * 로비에서 확인할 수 있는 방 정보들.
   */
  export interface SummarizedRoom extends Room {
    isLocked: boolean;
    isGaming: boolean;
    members: number;
  }
  /**
   * 방 안에서 확인할 수 있는 방 정보들.
   */
  export interface DetailedRoom extends Room {
    master: string;
    members: Record<string, RoomMember>;
  }
}
