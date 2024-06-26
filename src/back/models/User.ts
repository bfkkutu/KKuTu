import * as TypeORM from "typeorm";

import Robot from "back/game/Robot";
import { Database } from "../../common/Database";
import { KKuTu } from "common/KKuTu";

@TypeORM.Entity({ name: "kkutu_users" })
export default class User implements Serializable<Database.User> {
  @TypeORM.PrimaryGeneratedColumn({ name: "u_id", type: "int8" })
  public id!: string;

  @TypeORM.Column({
    name: "u_oid",
    type: "text",
  })
  public oid!: string;

  @TypeORM.Column({
    name: "u_money",
    type: "int4",
    default: 0,
    nullable: false,
  })
  public money!: number;

  @TypeORM.Column({
    name: "u_score",
    type: "int4",
    default: 0,
    nullable: false,
  })
  public score!: number;

  @TypeORM.Column({
    name: "u_record",
    type: "json",
    default: Database.JSON.Defaults.User.record,
  })
  public record!: Database.JSON.Types.User.record;

  @TypeORM.Column({
    name: "u_inventory",
    type: "json",
    default: Database.JSON.Defaults.User.inventory,
  })
  public inventory!: Database.JSON.Types.User.inventory;

  @TypeORM.Column({
    name: "u_equipment",
    type: "json",
    default: Database.JSON.Defaults.User.equipment,
  })
  public equipment!: Database.JSON.Types.User.equipment;

  @TypeORM.Column({
    name: "u_image",
    type: "text",
    nullable: false,
  })
  public image!: string;

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

  @TypeORM.Column({
    name: "u_departures",
    type: "int2",
    default: Database.Departure.None,
  })
  public departures!: number;

  @TypeORM.Column({
    name: "u_punishment",
    type: "json",
    default: Database.JSON.Defaults.User.punishment,
  })
  public punishment!: Database.JSON.Types.User.punishment;

  @TypeORM.Column({
    name: "u_community",
    type: "json",
    default: Database.JSON.Defaults.User.community,
  })
  public community!: Database.JSON.Types.User.community;

  @TypeORM.Column({
    name: "u_settings",
    type: "json",
    default: Database.JSON.Defaults.User.settings,
  })
  public settings!: Database.JSON.Types.User.settings;

  @TypeORM.Column({
    name: "u_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public roomId?: number;
  public isReady: boolean = false;
  public isSpectator: boolean = false;

  public isRobot(): this is Robot {
    return false;
  }

  public leaveRoom(): boolean {
    if (this.roomId === undefined) {
      return false;
    }
    this.roomId = undefined;
    return true;
  }

  public summarize(): Database.User.Summarized {
    return {
      id: this.id,
      score: this.score,
      record: this.record,
      equipment: this.equipment,
      image: this.image,
      nickname: this.nickname,
      exordial: this.exordial,
      isAdmin: this.departures !== Database.Departure.None,
      departures: this.departures,
      roomId: this.roomId,
    };
  }
  public serialize(): Database.User {
    return {
      ...this.summarize(),
      money: this.money,
      inventory: this.inventory,
      punishment: this.punishment,
      settings: this.settings,
    };
  }
  public asRoomMember(): KKuTu.Room.Member {
    return {
      id: this.id,
      isRobot: this.isRobot(),
      isReady: this.isReady,
      isSpectator: this.isSpectator,
    };
  }
}
