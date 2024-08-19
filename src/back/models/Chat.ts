import * as TypeORM from "typeorm";

import User from "back/models/User";
import { Transformer } from "back/utils/DatabaseAgent";
import { Database } from "common/Database";

@TypeORM.Entity({ name: "kkutu_log_chats" })
export default class Chat implements Serializable<Database.Chat> {
  @TypeORM.PrimaryGeneratedColumn({ name: "c_id", type: "int8" })
  public declare id: string;

  @TypeORM.Column({ name: "c_room", type: "int2", nullable: true })
  public declare room: Database.Nullable<number>;

  @TypeORM.ManyToOne(() => User)
  @TypeORM.JoinColumn({ name: "c_sender" })
  public declare sender: User;

  @TypeORM.Column({ name: "c_content", type: "text", nullable: false })
  public declare content: string;

  @TypeORM.Column({
    name: "c_reports",
    type: "text",
    transformer: Transformer.List,
  })
  public declare reports: string[];

  @TypeORM.Column({
    name: "c_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public declare createdAt: number;

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

