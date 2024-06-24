import * as TypeORM from "typeorm";

export default class Word {
  @TypeORM.PrimaryColumn({ name: "_id", type: "varchar", length: 256 })
  public id!: string;

  @TypeORM.Column({ name: "type", type: "text", nullable: true })
  public type!: string;

  @TypeORM.Column({ name: "mean", type: "text", nullable: false })
  public mean!: string;

  @TypeORM.Column({ name: "hit", type: "int4", default: 0, nullable: false })
  public hit!: number;

  @TypeORM.Column({ name: "flag", type: "int4", nullable: true })
  public flag!: number;

  @TypeORM.Column({
    name: "theme",
    type: "text",
    nullable: true,
    transformer: {
      from: (v: string) => (v ? v.split(",") : []),
      to: (v: string[]) => (v ? v.join(",") : ""),
    },
  })
  public theme!: string[];
}

@TypeORM.Entity({ name: "kkutu_ko" })
export class WordKo extends Word {}

@TypeORM.Entity({ name: "kkutu_en" })
export class WordEn extends Word {}
