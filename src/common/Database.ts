export namespace Database {
  export type PaginateOptions = {
    skip: number;
    take: number;
  };
  export type Nullable<T> = T | null;

  export namespace JSON {
    export namespace Types {
      export namespace User {
        export interface PunishmentData {
          range: [begin: number, end: number];
          reason: string;
        }

        export interface record {}
        export type inventory = Table<number>;
        export type equipment = Table<string>;
        export interface punishment {
          chat?: PunishmentData;
          play?: PunishmentData;
        }
        export interface community {
          friends: string[];
          friendRequests: {
            sent: string[];
            received: string[];
          };
          blackList: string[];
        }
        export interface settings {
          bgmVolume: number;
          effectVolume: number;
          lobbyMusic: number;
          locale: string;
          refuse: {
            invite: boolean;
            whisper: boolean;
            friendRequest: boolean;
          };
          game: {
            autoReady: boolean;
          };
          filterProfanities: boolean;
        }
      }
    }
    export namespace Defaults {
      export namespace User {
        export const record: Types.User.record = {};
        export const inventory: Types.User.inventory = {};
        export const equipment: Types.User.equipment = {};
        export const punishment: Types.User.punishment = {};
        export const community: Types.User.community = {
          friends: [],
          friendRequests: {
            sent: [],
            received: [],
          },
          blackList: [],
        };
        export const settings: Types.User.settings = {
          bgmVolume: 0.5,
          effectVolume: 0.5,
          lobbyMusic: 1,
          locale: "ko-KR",
          refuse: {
            invite: false,
            whisper: false,
            friendRequest: false,
          },
          game: {
            autoReady: false,
          },
          filterProfanities: true,
        };
      }
    }
  }

  // table interfaces
  export namespace User {
    export interface Summarized {
      id: string;
      score: number;
      record: JSON.Types.User.record;
      equipment: JSON.Types.User.equipment;
      image: string;
      nickname: string;
      exordial: string;
      roomId?: number;
      createdAt: number;
    }
  }
  export interface User extends User.Summarized {
    money: number;
    inventory: JSON.Types.User.inventory;
    punishment: JSON.Types.User.punishment;
    settings: JSON.Types.User.settings;
  }
  export interface Chat {
    id: string;
    room: Nullable<number>;
    sender: string;
    content: string;
    createdAt: number;
  }
  export interface Whisper {
    id: string;
    sender: string;
    target: string;
    content: string;
    createdAt: number;
  }
  export interface Report {
    id: string;
    submitter: string;
    target: string;
    reason: number;
    comment: string;
    createdAt: number;
  }
}
