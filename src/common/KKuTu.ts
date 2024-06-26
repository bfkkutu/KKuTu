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
    export enum Graphic {
      Normal,
      Huge,
    }
    export enum Language {
      Korean,
      English,
    }
    export enum Prompt {
      /**
       * ①, ②, ③, ...
       */
      Round,
      /**
       * 제, 시, 어, ...
       */
      Word,
    }
    export interface IMode {
      graphic: Graphic;
      language: Language;
      prompt: Prompt;
      rules: Rule[];
      themeSelect: boolean;
    }
    export const modes: Record<Mode, IMode> = {
      [Mode.KoreanRelay]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Word,
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
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Word,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanThree]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Word,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanKKuTu]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Word,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanConsonantQuiz]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanTypingCompetition]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanWordCompetition]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanSock]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanDrawingQuiz]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: true,
      },

      [Mode.EnglishRelay]: {
        graphic: Graphic.Normal,
        language: Language.English,
        prompt: Prompt.Word,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishKKuTu]: {
        graphic: Graphic.Normal,
        language: Language.English,
        prompt: Prompt.Word,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishTypingCompetition]: {
        graphic: Graphic.Normal,
        language: Language.English,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishWordCompetition]: {
        graphic: Graphic.Normal,
        language: Language.English,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishSock]: {
        graphic: Graphic.Normal,
        language: Language.English,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishDrawingQuiz]: {
        graphic: Graphic.Normal,
        language: Language.English,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: true,
      },

      [Mode.Hunmin]: {
        graphic: Graphic.Normal,
        language: Language.Korean,
        prompt: Prompt.Round,
        rules: [],
        themeSelect: false,
      },
    };
  }
  export interface Game {
    prompt: string;
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
