import * as TypeORM from "typeorm";

import { Database } from "common/Database";
import User from "back/models/User";
import { Transformer } from "back/utils/DatabaseAgent";

@TypeORM.Entity({ name: "kkutu_log_chats" })
export default class Chat implements Serializable<Database.Chat> {
  @TypeORM.PrimaryGeneratedColumn({ name: "c_id", type: "int8" })
  public id!: string;

  @TypeORM.Column({ name: "c_room", type: "int2", nullable: true })
  public room!: Database.Nullable<number>;

  @TypeORM.ManyToOne(() => User)
  @TypeORM.JoinColumn({ name: "c_sender" })
  public sender!: User;

  @TypeORM.Column({ name: "c_content", type: "text" })
  public content!: string;

  @TypeORM.Column({
    name: "c_reports",
    type: "text",
    transformer: Transformer.List,
  })
  public reports!: string[];

  @TypeORM.Column({
    name: "c_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.Chat {
    return {
      id: this.id,
      room: this.room,
      sender: this.sender.id,
      content: this.content,
      createdAt: this.createdAt,
    };
  }
}
