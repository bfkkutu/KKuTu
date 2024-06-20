import * as TypeORM from "typeorm";

import { Database } from "common/Database";
import User from "back/models/User";
import { Transformer } from "back/utils/DatabaseAgent";

@TypeORM.Entity({ name: "kkutu_log_whispers" })
export default class Whisper implements Serializable<Database.Whisper> {
  @TypeORM.PrimaryGeneratedColumn({ name: "w_id", type: "int8" })
  public id!: string;

  @TypeORM.ManyToOne(() => User)
  @TypeORM.JoinColumn({ name: "w_sender" })
  public sender!: User;

  @TypeORM.ManyToOne(() => User)
  @TypeORM.JoinColumn({ name: "w_target" })
  public target!: User;

  @TypeORM.Column({ name: "w_content", type: "text" })
  public content!: string;

  @TypeORM.Column({
    name: "w_reports",
    type: "text",
    transformer: Transformer.List,
  })
  public reports!: string[];

  @TypeORM.Column({
    name: "w_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.Whisper {
    return {
      id: this.id,
      sender: this.sender.id,
      target: this.target.id,
      content: this.content,
      createdAt: this.createdAt,
    };
  }
}
