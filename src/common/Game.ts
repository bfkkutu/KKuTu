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

  export interface RoomConfig {
    title: string;
    password: string;
    limit: number;
    mode: Mode;
    round: number;
    roundTime: number;
    rules: Record<Rule, boolean>;
  }
  export interface Room extends Omit<RoomConfig, "password"> {
    id: number;
  }
}
