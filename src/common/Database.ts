export namespace Database {
  export interface Serializable<T> {
    /**
     * 정보를 클라이언트에서 다룰 수 있도록 가공해 반환한다.
     */
    serialize(): T;
  }
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

  // table interfaces
  export interface User {
    id: number;
    money: number;
    record: UserRecord;
    lastLogin: number;
    inventory: UserInventory;
    equipment: Partial<UserEquipment>;
    exordial: string;
    punishment: UserPunishment;
    server: string;
    password: string;
    friends: UserFriendList;
    nickname: string;
    clan: number;
  }
}
