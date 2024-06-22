import * as TypeORM from "typeorm";

import { Database } from "common/Database";
import User from "back/models/User";

@TypeORM.Entity({ name: "kkutu_reports" })
export default class Report implements Serializable<Database.Report> {
  @TypeORM.PrimaryGeneratedColumn({ name: "r_id", type: "int8" })
  public id!: string;

  @TypeORM.ManyToOne(() => User)
  @TypeORM.JoinColumn({ name: "r_submitter" })
  public submitter!: User;

  @TypeORM.ManyToOne(() => User)
  @TypeORM.JoinColumn({ name: "r_target" })
  public target!: User;

  @TypeORM.Column({ name: "r_reason", type: "int2", nullable: false })
  public reason!: number;

  @TypeORM.Column({ name: "r_comment", type: "text", nullable: false })
  public comment!: string;

  @TypeORM.Column({
    name: "r_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.Report {
    return {
      id: this.id,
      submitter: this.submitter.id,
      target: this.target.id,
      reason: this.reason,
      comment: this.comment,
      createdAt: this.createdAt,
    };
  }
}
