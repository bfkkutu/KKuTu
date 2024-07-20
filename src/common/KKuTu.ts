import { HasId } from "common/mixins/HasId";

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
      Wide = "wide",
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
    export enum Interface {
      General,
      /**
       * TODO
       */
      TODO,
    }
    export interface ModeConfiguration {
      interface: Interface;
      language: Language;
      rules: Rule[];
      themeSelect: boolean;
    }
    export const MODES: Record<Mode, ModeConfiguration> = {
      [Mode.KoreanRelay]: {
        interface: Interface.General,
        language: Language.Korean,
        rules: [
          Rule.Manner,
          Rule.Wide,
          Rule.Mission,
          Rule.NoInitial,
          Rule.Item,
        ],
        themeSelect: false,
      },
      [Mode.KoreanRelayReversed]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [Rule.Manner, Rule.Wide, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanThree]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [Rule.Manner, Rule.Wide, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanKKuTu]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [Rule.Manner, Rule.Wide, Rule.Mission],
        themeSelect: false,
      },
      [Mode.KoreanConsonantQuiz]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanTypingCompetition]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [],
        themeSelect: true,
      },
      [Mode.KoreanWordCompetition]: {
        interface: Interface.General,
        language: Language.Korean,
        rules: [Rule.Mission],
        themeSelect: true,
      },
      [Mode.KoreanSock]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [],
        themeSelect: false,
      },
      [Mode.KoreanDrawingQuiz]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [],
        themeSelect: true,
      },

      [Mode.EnglishRelay]: {
        interface: Interface.General,
        language: Language.English,
        rules: [Rule.Wide, Rule.Mission],
        themeSelect: false,
      },
      [Mode.EnglishKKuTu]: {
        interface: Interface.TODO,
        language: Language.English,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishTypingCompetition]: {
        interface: Interface.TODO,
        language: Language.English,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishWordCompetition]: {
        interface: Interface.General,
        language: Language.English,
        rules: [],
        themeSelect: true,
      },
      [Mode.EnglishSock]: {
        interface: Interface.TODO,
        language: Language.English,
        rules: [],
        themeSelect: false,
      },
      [Mode.EnglishDrawingQuiz]: {
        interface: Interface.TODO,
        language: Language.English,
        rules: [],
        themeSelect: true,
      },

      [Mode.Hunmin]: {
        interface: Interface.TODO,
        language: Language.Korean,
        rules: [],
        themeSelect: false,
      },
    };
    export const THEMES_WIDE = [
      "IMS" /* THE iDOLM@STER */,
      "VOC" /* 보컬로이드/우타이테 */,
      "KTV" /* 국내 방송 프로그램 */,
      "KOT" /* 철도역 */,
      "DOT" /* 도타 2 */,
      "DGM" /* 디지몬 */,
      "RAG" /* 음식 */,
      "LVL" /* 러브 라이브! */,
      "LOL" /* 리그 오브 레전드 */,
      "MMM" /* 마법소녀 마도카☆마기카 */,
      "MAP" /* 메이플스토리 */,
      "MKK" /* 메카쿠시티 액터즈 */,
      "MNG" /* 모노가타리 시리즈 */,
      "MOB" /* 모바일 게임 */,
      "STA" /* 스타크래프트 */,
      "OIJ" /* 신조어 */,
      "ESB" /* 앙상블 스타즈! */,
      "ELW" /* 엘소드 */,
      "OVW" /* 오버워치 */,
      "NEX" /* 게임 이름 */,
      "KPO" /* 유명인 */,
      "JLN" /* 라이트 노벨 */,
      "JAN" /* 만화/애니메이션/웹툰 */,
      "ZEL" /* 젤다의 전설 */,
      "POK" /* 포켓몬스터 */,
      "HAI" /* 하이큐!! */,
      "HSS" /* 하스스톤 */,
      "KMV" /* 영화 이름 */,
      "HDC" /* 함대 컬렉션 */,
      "HOS" /* 히어로즈 오브 더 스톰 */,
      "DBD" /* 데드바이데이라이트 */,
      "RUN" /* 런닝맨 */,
      "MUN" /* 대한민국 문화재 */,
      "KPOP" /* 한국 음악 */,
      "SOK" /* 속담 */,
      "PKT" /* 파워 쿵쿵따 */,
      "PIC" /* 명화 */,
      "EMD" /* 읍/면/동 */,
      "MIN" /* 마인크래프트 */,
      "MINBE" /* 마인크래프트 베드락 에디션 */,
      "NYA" /* 냥코대전쟁 */,
      "CKR" /* 쿠키런 */,
      "HAK" /* 학교 */,
      "BUS" /* 버스 정류장 */,
      "BST" /* 버스 터미널 */,
      "DONG" /* 동요 */,
      "MFA" /* 마피아42 */,
      "ZHS" /* 좀비고등학교 */,
      "KTR" /* 카트라이더 */,
      "ILN" /* 아이러브니키 */,
      "TRR" /* 테라리아 */,
      "THP" /* 동방 프로젝트 */,
      "UND" /* 언더테일/델타룬 */,
      "TLR" /* 테일즈런너 */,
      "HKI" /* 붕괴3rd */,
      "BAN" /* 뱅드림! 걸즈 밴드 파티! */,
      "FGO" /* Fate/Grand/Order */,
      "YGO" /* 유희왕 */,
      "PCN" /* 프린세스 커넥트! Re:Dive */,
      "WOW" /* 월드 오브 워크래프트 */,
      "SMW" /* 서머너즈 워 */,
      "CPR" /* 기업 */,
      "OPC" /* 원피스 */,
    ];
    export const THEMES = [
      "0" /*  */,
      "10" /* 가톨릭 */,
      "20" /* 건설 */,
      "30" /* 경제 */,
      "40" /* 고적 */,
      "50" /* 고유 */,
      "60" /* 공업 */,
      "70" /* 광업 */,
      "80" /* 교육 */,
      "90" /* 교통 */,
      "100" /* 군사 */,
      "110" /* 기계 */,
      "120" /* 기독교 */,
      "130" /* 논리 */,
      "140" /* 농업 */,
      "150" /* 문학 */,
      "160" /* 물리 */,
      "170" /* 미술 */,
      "180" /* 민속 */,
      "190" /* 동물 */,
      "200" /* 법률 */,
      "210" /* 불교 */,
      "220" /* 사회 */,
      "230" /* 생물 */,
      "240" /* 수학 */,
      "250" /* 수산 */,
      "260" /* 수공 */,
      "270" /* 식물 */,
      "280" /* 심리 */,
      "290" /* 약학 */,
      "300" /* 언론 */,
      "310" /* 언어 */,
      "320" /* 역사 */,
      "330" /* 연영 */,
      "340" /* 예술 */,
      "350" /* 운동 */,
      "360" /* 음악 */,
      "370" /* 의학 */,
      "380" /* 인명 */,
      "390" /* 전기 */,
      "400" /* 정치 */,
      "410" /* 종교 */,
      "420" /* 지리 */,
      "430" /* 지명 */,
      "440" /* 책명 */,
      "450" /* 천문 */,
      "460" /* 철학 */,
      "470" /* 출판 */,
      "480" /* 통신 */,
      "490" /* 컴퓨터 */,
      "500" /* 한의학 */,
      "510" /* 항공 */,
      "520" /* 해양 */,
      "530" /* 화학 */,
    ];
    export namespace Interface {
      export namespace Serialized {
        interface Base {
          readonly prompt: string;
          readonly players: readonly string[];
        }

        export interface General extends Base {
          readonly scores: Table<number>;
        }
      }
      export interface Serialized {
        [Interface.General]: Interface.Serialized.General;
        [Interface.TODO]: never;
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
      themes: string[];
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
    export interface Detailed<T extends Game.Interface = Game.Interface>
      extends Room {
      members: Table<Member>;
      master: string;
      game?: Game.Interface.Serialized[T];
    }
  }
  export interface Room extends HasId<number>, Room.Base {}

  /**
   * 31레벨 경험치 0일 때의 누적 점수 값.
   */
  export const NEWBIE_SCORE = 13779;
}

