import * as TypeORM from "typeorm";

import DB from "back/utils/Database";
import WebSocket from "back/utils/WebSocket";
import { Database } from "../../common/Database";
import { WebSocketMessage } from "../../common/WebSocket";

import FriendRequest from "back/models/FriendRequest";

@TypeORM.Entity({ name: "kkutu_users" })
export default class User<Connected extends boolean = false>
  implements Serializable<Database.DetailedUser>
{
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
    name: "u_punishment",
    type: "json",
    default: Database.JSON.Defaults.User.punishment,
  })
  public punishment!: Database.JSON.Types.User.punishment;

  @TypeORM.Column({
    name: "u_password",
    type: "varchar",
    length: 32,
    nullable: true,
  })
  public password!: Database.Nullable<string>;

  @TypeORM.Column({ name: "u_friends", type: "json", default: [] })
  public friends!: string[];

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

  public socket!: Connected extends true ? WebSocket : undefined;
  public roomId?: Connected extends true ? number : never;
  public community = { ...Database.community };

  public async updateCommunity(updateClient: boolean = true) {
    if (this.socket === undefined) return;
    this.community.friends = this.friends;
    this.community.friendRequests.sent = (
      await DB.Manager.createQueryBuilder(FriendRequest, "fr")
        .where("fr.sender = :id", { id: this.id })
        .getMany()
    ).map((friendRequest) => friendRequest.target);
    this.community.friendRequests.received = (
      await DB.Manager.createQueryBuilder(FriendRequest, "fr")
        .where("fr.target = :id", { id: this.id })
        .getMany()
    ).map((friendRequest) => friendRequest.sender);
    if (updateClient)
      this.socket.send(WebSocketMessage.Type.UpdateCommunity, {
        community: this.community,
      });
  }

  public summarize(): Database.SummarizedUser {
    return {
      id: this.id,
      score: this.score,
      record: this.record,
      equipment: this.equipment,
      image: this.image,
      nickname: this.nickname,
      exordial: this.exordial,
      createdAt: this.createdAt,
    };
  }
  public serialize(): Database.DetailedUser {
    return {
      ...this.summarize(),
      money: this.money,
      inventory: this.inventory,
      punishment: this.punishment,
      settings: this.settings,
    };
  }
}
