import { HasId } from "common/mixins/HasId";

export namespace KKuTu {
  export namespace Game {
    export enum Type {
      /**
       * 끝말잇기
       */
      Relay,
      /**
       * 앞말잇기
       */
      RelayReversed,
      /**
       * 쿵쿵따
       */
      Three,
      /**
       * 끄투
       */
      KKuTu,
      /**
       * 자음퀴즈
       */
      ConsonantQuiz,
      /**
       * 타자대결
       */
      TypingCompetition,
      /**
       * 단어대결
       */
      WordCompetition,
      /**
       * 솎솎
       */
      Sock,
      /**
       * 그림퀴즈
       */
      DrawingQuiz,
      /**
       * 훈민정음
       */
      Hunmin,
    }
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
      //NoInitial = "noInitial",
      /**
       * 글자 금지
       */
      Dismission = "dismission",
      /**
       * 아이템전
       */
      Item = "item",
      /**
       * 두 글자 금지
       */
      BanDouble = "banDouble",
    }
    export enum Language {
      Korean = "ko",
      English = "en",
    }
    export const LANGUAGES = Object.values(Language);
    export interface ModeConfiguration {
      type: Type;
      language: Language;
      rules: Rule[];
      themeSelect: boolean;
    }
    export const MODES: Record<Mode, ModeConfiguration> = {
      [Mode.KoreanRelay]: {
        type: Type.Relay,
        language: Language.Korean,
        rules: [
          Rule.Manner,
          Rule.WideTheme,
          Rule.Mission,
          //Rule.NoInitial,
          Rule.Item,
        ],
        themeSelect: false,
      },
      [Mode.KoreanRelayReversed]: {
        type: Type.RelayReversed,
        language: Language.Korean,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanThree]: {
        type: Type.Three,
        language: Language.Korean,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanKKuTu]: {
        type: Type.KKuTu,
        language: Language.Korean,
        rules: [Rule.Manner, Rule.WideTheme, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanConsonantQuiz]: {
        type: Type.ConsonantQuiz,
        language: Language.Korean,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanTypingCompetition]: {
        type: Type.TypingCompetition,
        language: Language.Korean,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanWordCompetition]: {
        type: Type.WordCompetition,
        language: Language.Korean,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanSock]: {
        type: Type.Sock,
        language: Language.Korean,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanDrawingQuiz]: {
        type: Type.DrawingQuiz,
        language: Language.Korean,
        rules: [],
        themeSelect: true,
      },

      [Mode.EnglishRelay]: {
        type: Type.Relay,
        language: Language.English,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishKKuTu]: {
        type: Type.KKuTu,
        language: Language.English,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishTypingCompetition]: {
        type: Type.TypingCompetition,
        language: Language.English,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishWordCompetition]: {
        type: Type.WordCompetition,
        language: Language.English,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishSock]: {
        type: Type.Sock,
        language: Language.English,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishDrawingQuiz]: {
        type: Type.DrawingQuiz,
        language: Language.English,
        rules: [],
        themeSelect: true,
      },

      [Mode.Hunmin]: {
        type: Type.Hunmin,
        language: Language.Korean,
        rules: [],
        themeSelect: false,
      },
    };
    export namespace Type {
      export namespace Serialized {
        interface Base {
          readonly prompt: string;
          readonly players: readonly string[];
        }

        export interface Relay extends Base {
          readonly scores: Record<string, number>;
        }
      }
      export interface Serialized {
        [Type.Relay]: Type.Serialized.Relay;
        [Type.RelayReversed]: never;
        [Type.Three]: never;
        [Type.KKuTu]: never;
        [Type.ConsonantQuiz]: never;
        [Type.TypingCompetition]: never;
        [Type.WordCompetition]: never;
        [Type.Sock]: never;
        [Type.DrawingQuiz]: never;
        [Type.Hunmin]: never;
      }
    }
  }

  export namespace Room {
    export interface Base {
      title: string;
      policy: Record<Policy, boolean>;
      limit: number;
      mode: Game.Mode;
      round: number;
      roundTime: number;
      rules: Record<Game.Rule, boolean>;
    }

    export enum Policy {
      /**
       * 초보방
       */
      Newbie = "newbie",
      /**
       * 게임 중 참여
       */
      JoinWhileGaming = "joinWhileGaming",
    }
    export const POLICY_CHANGEABLE = [Policy.JoinWhileGaming];
    export interface SearchOptions {
      title: string;
      mode: Game.Mode;
      round: NumberRange;
      roundTime: NumberRange;
      rules: Record<Game.Rule, boolean>;
    }
    export interface Settings extends Base {
      password: string;
    }

    export interface Member extends HasId<string> {
      isRobot: boolean;
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
    export interface Detailed<T extends Game.Type = Game.Type> extends Room {
      members: Record<string, Member>;
      master: string;
      game?: Game.Type.Serialized[T];
    }
  }
  export interface Room extends HasId<number>, Room.Base {}

  /**
   * 31레벨 경험치 0일 때의 누적 점수 값.
   */
  export const NEWBIE_SCORE = 13779;
}

