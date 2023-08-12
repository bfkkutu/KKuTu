export namespace Database {
  export type PaginateOptions = {
    skip: number;
    take: number;
  };
  export interface Serializable<T> {
    /**
     * 정보를 클라이언트에서 다룰 수 있도록 가공해 반환한다.
     */
    serialize(): T;
  }
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
        export interface equipment {}
        export interface punishment {
          chat?: PunishmentData;
          play?: PunishmentData;
        }
        export interface settings {
          volume: number;
          lobbyMusic: number;
        }
      }
    }
    export namespace Defaults {
      export namespace User {
        export const record: Types.User.record = {};
        export const inventory: Types.User.inventory = {};
        export const equipment: Types.User.equipment = {};
        export const punishment: Types.User.punishment = {};
        export const settings: Types.User.settings = {
          volume: 0.5,
          lobbyMusic: 1,
        };
      }
    }
  }

  // table interfaces
  export interface User {
    id: number;
    money: number;
    record: JSON.Types.User.record;
    inventory: JSON.Types.User.inventory;
    equipment: Partial<JSON.Types.User.equipment>;
    nickname: string;
    exordial: string;
    punishment: JSON.Types.User.punishment;
    password: Nullable<string>;
    friends: number[];
    settings: JSON.Types.User.settings;
    createdAt: number;
  }
}
