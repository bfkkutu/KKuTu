import * as TypeORM from "typeorm";

import Mean from "./Mean";
import { LANGUAGES } from "../System";

export default class Word {
  public static ko: typeof Word;
  public static en: typeof Word;

  @TypeORM.PrimaryGeneratedColumn({ name: "w_id", type: "int8" })
  public declare id: string;

  @TypeORM.Column({ name: "w_data", type: "text", nullable: false })
  public declare data: string;

  public declare means: Mean[];

  @TypeORM.Column({
    name: "w_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public declare createdAt: number;
}

for (const language of LANGUAGES) {
  @TypeORM.Entity({ name: `kkutu_words_${language}` })
  class Entity extends Word {
    public static readonly name = `Word_${language}`;

    @TypeORM.OneToMany(() => Mean[language], (mean) => mean.word)
    public declare means: Mean[];
  }
  Word[language] = Entity;
}

