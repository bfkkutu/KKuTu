import * as TypeORM from "typeorm";

import { Database } from "common/Database";

export default class Word implements Serializable<Database.Word> {
  @TypeORM.PrimaryGeneratedColumn({ name: "w_id", type: "int8" })
  public id!: string;

  @TypeORM.Column({ name: "w_data", type: "text", nullable: false })
  public data!: string;

  @TypeORM.Column({
    name: "w_means",
    type: "json",
    default: {},
    nullable: false,
  })
  public means!: Record<string, string>;

  @TypeORM.Column({
    name: "w_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public createdAt!: number;

  public serialize(): Database.Word {
    return {
      id: this.id,
      data: this.data,
      means: this.means,
    };
  }
}

@TypeORM.Entity({ name: "kkutu_words_ko" })
export class WordKo extends Word {}

@TypeORM.Entity({ name: "kkutu_words_en" })
export class WordEn extends Word {}
