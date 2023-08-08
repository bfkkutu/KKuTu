import * as TypeORM from "typeorm";

import { Database } from "../../common/Database";

@TypeORM.Entity({ name: "kkutu_users" })
export default class User implements Database.Serializable<Database.User> {
  @TypeORM.PrimaryGeneratedColumn({ name: "u_id", type: "int8" })
  public id!: number;

  @TypeORM.Column({
    name: "u_money",
    type: "int8",
    default: 0,
    nullable: false,
  })
  public money!: number;

  @TypeORM.Column({ name: "u_record", type: "json" })
  public record!: Database.UserRecord;

  @TypeORM.Column({ name: "u_inventory", type: "json" })
  public inventory!: Database.UserInventory;

  @TypeORM.Column({ name: "u_equipment", type: "json" })
  public equipment!: Database.UserEquipment;

  @TypeORM.Column({
    name: "u_nickname",
    type: "varchar",
    length: 16,
    nullable: true,
  })
  public nickname!: Database.Nullable<string>;

  @TypeORM.Column({
    name: "u_exordial",
    type: "varchar",
    length: 100,
    default: "",
    nullable: false,
  })
  public exordial!: string;

  @TypeORM.Column({ name: "u_punishment", type: "json" })
  public punishment!: Database.UserPunishment;

  @TypeORM.Column({ name: "u_server", type: "varchar", nullable: true })
  public server!: Database.Nullable<string>;

  @TypeORM.Column({
    name: "u_password",
    type: "varchar",
    length: 32,
    nullable: true,
  })
  public password!: Database.Nullable<string>;

  @TypeORM.Column({ name: "u_friends", type: "json" })
  public friends!: Database.UserFriendList;

  @TypeORM.Column({ name: "u_lastLogin", type: "timestamp" })
  public lastLogin!: number;

  @TypeORM.Column({
    name: "u_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.User {
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
      createdAt: this.createdAt,
    };
  }
}
