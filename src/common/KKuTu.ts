export namespace KKuTu {
  export namespace Game {
    export enum Mode {
      /**
       * 한국어 끝말잇기
       */
      KoreanRelay,
      /**
       * 한국어 앞말잇기
       */
      KoreanRelayReversed,
      /**
       * 한국어 쿵쿵따
       */
      KoreanThree,
      /**
       * 한국어 끄투
       */
      KoreanKKuTu,
      /**
       * 한국어 자음퀴즈
       */
      KoreanConsonantQuiz,
      /**
       * 한국어 타자대결
       */
      KoreanTypingCompetition,
      /**
       * 한국어 단어대결
       */
      KoreanWordCompetition,
      /**
       * 한국어 솎솎
       */
      KoreanSock,
      /**
       * 한국어 그림퀴즈
       */
      KoreanDrawingQuiz,

      /**
       * 영어 끝말잇기
       */
      EnglishRelay,
      /**
       * 영어 끄투
       */
      EnglishKKuTu,
      /**
       * 영어 타자대결
       */
      EnglishTypingCompetition,
      /**
       * 영어 단어대결
       */
      EnglishWordCompetition,
      /**
       * 영어 솎솎
       */
      EnglishSock,
      /**
       * 영어 그림퀴즈
       */
      EnglishDrawingQuiz,

      /**
       * 훈민정음
       */
      Hunmin,
    }
    export enum Rule {
      /**
       * 한 방 금지
       */
      Manner = "manner",
      /**
       * 어인정
       */
      WideTheme = "wide",
      /**
       * 미션
       */
      Mission = "mission",
      /**
       * 속담
       */
      Proverb = "proverb",
      /**
       * 무제한
       */
      Unlimited = "unlimited",
      /**
       * 짧은 단어
       */
      Short = "short",
      /**
       * 두음 법칙 없음
       */
      NoInitial = "noInitial",
      /**
       * 글자 금지
       */
      Dismission = "dismission",
      /**
       * 초보방
       */
      Newbie = "newbie",
      /**
       * 아이템전
       */
      Item = "item",
      /**
       * 두 글자 금지
       */
      BanDouble = "banDouble",
      /**
       * 게임 중 참여
       */
      JoinWhileGaming = "joinWhileGaming",
    }
    export enum ScreenType {
      Normal,
      Huge,
    }
    export interface IMode {
      screenType: ScreenType;
      rules: Rule[];
      themeSelect: boolean;
    }
    export const modes: Record<Mode, IMode> = {
      [Mode.KoreanRelay]: {
        screenType: ScreenType.Normal,
        rules: [
          Rule.Manner,
          Rule.WideTheme,
          Rule.Mission,
          Rule.NoInitial,
          Rule.Newbie,
          Rule.Item,
          Rule.JoinWhileGaming,
        ],
        themeSelect: false,
      },
      [Mode.KoreanRelayReversed]: {
        screenType: ScreenType.Normal,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanThree]: {
        screenType: ScreenType.Normal,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanKKuTu]: {
        screenType: ScreenType.Normal,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanConsonantQuiz]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanTypingCompetition]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanWordCompetition]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanSock]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanDrawingQuiz]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: true,
      },

      [Mode.EnglishRelay]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishKKuTu]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishTypingCompetition]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishWordCompetition]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishSock]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishDrawingQuiz]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: true,
      },

      [Mode.Hunmin]: {
        screenType: ScreenType.Normal,
        rules: [],
        themeSelect: false,
      },
    };
  }
  export interface Game {
    round: number;
    players: string[];
  }

  export namespace Room {
    export interface SearchOptions {
      title: string;
      mode: Game.Mode;
      round: NumberRange;
      roundTime: NumberRange;
      rules: Record<Game.Rule, boolean>;
    }
    export interface Settings {
      title: string;
      limit: number;
      mode: Game.Mode;
      round: number;
      roundTime: number;
      rules: Record<Game.Rule, boolean>;
      password: string;
    }
    export interface Member {
      id: string;
      isReady: boolean;
      isSpectator: boolean;
    }

    /**
     * 로비에서 확인할 수 있는 방 정보들.
     */
    export interface Summarized extends Room {
      members: number;
      isGaming: boolean;
      isLocked: boolean;
    }
    /**
     * 방 안에서 확인할 수 있는 방 정보들.
     */
    export interface Detailed extends Room {
      members: Record<string, Member>;
      master: string;
      game?: Game;
    }
  }
  export interface Room {
    id: number;
    title: string;
    limit: number;
    mode: Game.Mode;
    round: number;
    roundTime: number;
    rules: Record<Game.Rule, boolean>;
  }
}
