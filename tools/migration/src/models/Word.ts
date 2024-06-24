import * as TypeORM from "typeorm";

export default class Word {
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
}

@TypeORM.Entity({ name: "kkutu_words_ko" })
export class WordKo extends Word {}

@TypeORM.Entity({ name: "kkutu_words_en" })
export class WordEn extends Word {}
