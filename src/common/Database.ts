import type { HasId } from "common/mixins/HasId";

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

  export enum Departure {
    None = 0b0000,
    Owner = 0b0001,
    Management = 0b0010,
    DatabaseWord = 0b0100,
    DatabaseShop = 0b1000,
  }

  // table interfaces
  export namespace User {
    export interface Summarized extends HasId<string> {
      score: number;
      record: JSON.Types.User.record;
      equipment: JSON.Types.User.equipment;
      image: string;
      nickname: string;
      exordial: string;
      isAdmin: boolean;
      departures: number;
      roomId?: number;
    }
  }
  export interface User extends User.Summarized {
    money: number;
    inventory: JSON.Types.User.inventory;
    punishment: JSON.Types.User.punishment;
    settings: JSON.Types.User.settings;
  }
  export interface Chat extends HasId<string> {
    room: Nullable<number>;
    sender: string;
    content: string;
    createdAt: number;
  }
  export interface Whisper extends HasId<string> {
    sender: string;
    target: string;
    content: string;
    createdAt: number;
  }
  export interface Report extends HasId<string> {
    submitter: string;
    target: string;
    reason: number;
    comment: string;
  }
  export interface Word extends HasId<string> {
    data: string;
    means: Table<string[]>;
  }
  export type Mean = {
    theme: string;
    data: string[];
  };
}

