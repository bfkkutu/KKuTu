import * as TypeORM from "typeorm";

import { LANGUAGES } from "../../System";

const ListTransformer = {
  from: (v: string) => (v ? v.split(",") : []),
  to: (v: string[]) => (v ? v.join(",") : ""),
};

export default class Word {
  public static ko: typeof Word;
  public static en: typeof Word;

  @TypeORM.PrimaryColumn({ name: "_id", type: "varchar", length: 256 })
  public id!: string;

  @TypeORM.Column({
    name: "type",
    type: "text",
    nullable: true,
    transformer: ListTransformer,
  })
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
    transformer: ListTransformer,
  })
  public theme!: string[];
}

for (const language of LANGUAGES) {
  @TypeORM.Entity({ name: `kkutu_${language}` })
  class Entity extends Word {}
  Word[language] = Entity;
}
