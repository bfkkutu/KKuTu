import * as TypeORM from "typeorm";

import { Database } from "common/Database";
import WebSocket from "back/utils/WebSocket";

@TypeORM.Entity({ name: "kkutu_users" })
export default class User<Connected extends boolean = false>
  implements Database.Serializable<Database.User>
{
  @TypeORM.PrimaryGeneratedColumn({ name: "u_id", type: "int8" })
  public id!: number;

  @TypeORM.Column({
    name: "u_oid",
    type: "text",
  })
  public oid!: string;

  @TypeORM.Column({
    name: "u_money",
    type: "int8",
    default: 0,
    nullable: false,
  })
  public money!: number;

  @TypeORM.Column({ name: "u_record", type: "json", default: {} })
  public record!: Database.JSON.User.record;

  @TypeORM.Column({ name: "u_inventory", type: "json", default: {} })
  public inventory!: Database.JSON.User.inventory;

  @TypeORM.Column({ name: "u_equipment", type: "json", default: {} })
  public equipment!: Database.JSON.User.equipment;

  @TypeORM.Column({
    name: "u_nickname",
    type: "varchar",
    length: 16,
    nullable: false,
  })
  public nickname!: string;

  @TypeORM.Column({
    name: "u_exordial",
    type: "varchar",
    length: 100,
    default: "",
    nullable: false,
  })
  public exordial!: string;

  @TypeORM.Column({ name: "u_punishment", type: "json", default: {} })
  public punishment!: Database.JSON.User.punishment;

  @TypeORM.Column({
    name: "u_password",
    type: "varchar",
    length: 32,
    nullable: true,
  })
  public password!: Database.Nullable<string>;

  @TypeORM.Column({ name: "u_friends", type: "json", default: [] })
  public friends!: Database.JSON.User.friends;

  @TypeORM.Column({
    name: "u_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  /**
   * undefined라면 데이터베이스에서 조회되기만 한 유저.
   */
  public socket!: Connected extends true ? WebSocket : undefined;

  public serialize(): Database.User {
    return {
      id: this.id,
      money: this.money,
      record: this.record,
      inventory: this.inventory,
      equipment: this.equipment,
      nickname: this.nickname,
      exordial: this.exordial,
      punishment: this.punishment,
      password: this.password,
      friends: this.friends,
      createdAt: this.createdAt,
    };
  }
}
