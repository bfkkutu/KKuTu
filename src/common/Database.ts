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
    export namespace User {
      export interface PunishmentData {
        range: [begin: number, end: number];
        reason: string;
      }

      export interface auth {
        type: string;
        id: string;
      }
      export interface record {}
      export type inventory = Table<number>;
      export interface equipment {}
      export type friends = Table<string>;
      export interface punishment {
        chat: PunishmentData;
        play: PunishmentData;
      }
    }
    export namespace Session {
      export interface profile {
        authType: string;
        id: string;
        nickname: string;
        exordial: string;
        image: string;
        token: string;
        sid: string;
      }
    }
  }

  // table interfaces
  export interface User {
    id: number;
    money: number;
    record: JSON.User.record;
    lastLogin: number;
    inventory: JSON.User.inventory;
    equipment: Partial<JSON.User.equipment>;
    nickname: Nullable<string>;
    exordial: string;
    punishment: JSON.User.punishment;
    password: Nullable<string>;
    friends: JSON.User.friends;
    createdAt: number;
  }
  export interface Session {
    id: string;
    profile: JSON.Session.profile;
    createdAt: number;
  }
}
