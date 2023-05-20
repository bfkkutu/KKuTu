import * as TypeORM from "typeorm";

import { Database } from "../../common/Database";

@TypeORM.Entity({ name: "users" })
export default class User implements Database.Serializable<Database.User> {
  @TypeORM.PrimaryGeneratedColumn({ name: "id", type: "int8" })
  public id!: number;

  @TypeORM.Column({ name: "money", type: "int8" })
  public money!: number;

  @TypeORM.Column({ name: "record", type: "json" })
  public record!: Database.UserRecord;

  @TypeORM.Column({ name: "lastLogin", type: "datetime" })
  public lastLogin!: number;

  @TypeORM.Column({ name: "inventory", type: "json" })
  public inventory!: Database.UserInventory;

  @TypeORM.Column({ name: "equipment", type: "json" })
  public equipment!: Database.UserEquipment;

  @TypeORM.Column({ name: "exordial", type: "varchar", length: 100 })
  public exordial!: string;

  @TypeORM.Column({ name: "punishment", type: "json" })
  public punishment!: Database.UserPunishment;

  @TypeORM.Column({ name: "server", type: "varchar" })
  public server!: string;

  @TypeORM.Column({ name: "password", type: "varbinary" })
  public password!: string;

  @TypeORM.Column({ name: "friends", type: "json" })
  public friends!: Database.UserFriendList;

  @TypeORM.Column({ name: "nickname", type: "varchar", length: 16 })
  public nickname!: string;

  @TypeORM.Column({ name: "clan", type: "int8" })
  public clan!: number;

  serialize(): Database.User {
    return {
      id: this.id,
      money: this.money,
      record: this.record,
      lastLogin: this.lastLogin,
      inventory: this.inventory,
      equipment: this.equipment,
      exordial: this.exordial,
      punishment: this.punishment,
      server: this.server,
      password: this.password,
      friends: this.friends,
      nickname: this.nickname,
      clan: this.clan,
    };
  }
}
