import * as TypeORM from "typeorm";

import WebSocket from "back/utils/WebSocket";
import { Database } from "../../common/Database";
import { WebSocketMessage } from "../../common/WebSocket";
import Room from "back/game/Room";

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

  /**
   * @reference
   */
  public socket!: Connected extends true ? WebSocket : undefined;
  /**
   * @reference
   */
  public room?: Connected extends true ? Room : never;

  /**
   * 이 유저의 커뮤니티 관련 정보를 갱신한다.
   */
  public async updateCommunity(): Promise<void> {
    if (this.socket === undefined) return;
    this.socket.send(WebSocketMessage.Type.UpdateCommunity, {
      community: this.community,
    });
  }
  /**
   * 현재 접속 중인 방이 있으면 나간다.
   */
  public leaveRoom(): void {
    if (this.room === undefined || this.socket === undefined) return;
    this.room.remove(this.socket);
    this.room = undefined;
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
      roomId: this.room?.id,
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
