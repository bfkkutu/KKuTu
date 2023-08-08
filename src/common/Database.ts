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

  export interface UserRecord {}
  export type UserInventory = {
    [item: string]: number;
  };
  export interface UserEquipment {}
  export type UserFriendList = {
    [id: string]: string;
  };
  export interface UserPunishmentData {
    range: [number, number];
    reason: string;
  }
  export interface UserPunishment {
    chat: UserPunishmentData;
    play: UserPunishmentData;
  }
  export interface SessionProfile {
    authType: string;
    id: string;
    nickname: string;
    exordial: string;
    image: string;
    token: string;
    sid: string;
  }

  // table interfaces
  export interface User {
    id: number;
    money: number;
    record: UserRecord;
    lastLogin: number;
    inventory: UserInventory;
    equipment: Partial<UserEquipment>;
    nickname: Nullable<string>;
    exordial: string;
    punishment: UserPunishment;
    server: Nullable<string>;
    password: Nullable<string>;
    friends: UserFriendList;
    createdAt: number;
  }
  export interface Session {
    id: string;
    profile: SessionProfile;
    createdAt: number;
  }
}
