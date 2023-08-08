import * as TypeORM from "typeorm";

import { Database } from "../../common/Database";

@TypeORM.Entity({ name: "kkutu_session" })
export default class Session
  implements Database.Serializable<Database.Session>
{
  @TypeORM.PrimaryGeneratedColumn({ name: "ses_id", type: "int8" })
  public id!: number;

  @TypeORM.Column({ name: "ses_sid", type: "varchar", length: 32 })
  public sid!: string;

  @TypeORM.Column({ name: "ses_profile", type: "json" })
  public profile!: Database.SessionProfile;

  @TypeORM.Column({
    name: "ses_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.Session {
    return {
      id: this.sid,
      profile: this.profile,
      createdAt: this.createdAt,
    };
  }
}
