import * as TypeORM from "typeorm";

import { Database } from "../../common/Database";

@TypeORM.Entity({ name: "kkutu_friend_requests" })
export default class FriendRequest
  implements Database.Serializable<Database.FriendRequest>
{
  @TypeORM.PrimaryGeneratedColumn({ name: "fr_id", type: "int4" })
  public id!: number;

  @TypeORM.Column({
    name: "fr_sender",
    type: "int8",
    nullable: false,
  })
  public sender!: string;

  @TypeORM.Column({
    name: "fr_target",
    type: "int8",
    nullable: false,
  })
  public target!: string;

  @TypeORM.Column({
    name: "fr_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.FriendRequest {
    return {
      id: this.id,
      sender: this.sender,
      target: this.target,
      createdAt: this.createdAt,
    };
  }
}
