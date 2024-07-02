import * as TypeORM from "typeorm";

import Word from "./Word";
import { LANGUAGES } from "../System";

export default class Mean {
  public static ko: typeof Mean;
  public static en: typeof Mean;

  @TypeORM.PrimaryGeneratedColumn({ name: "m_id", type: "int8" })
  public declare id: string;

  public declare word: Word;

  @TypeORM.Column({
    name: "m_theme",
    type: "text",
    nullable: true,
  })
  public declare theme: string | null;

  @TypeORM.Column({
    name: "m_data",
    type: "text",
    default: "",
    nullable: false,
  })
  public declare data: string;

  @TypeORM.Column({
    name: "m_wide",
    type: "boolean",
    default: false,
    nullable: false,
  })
  public declare wide: boolean;

  @TypeORM.Column({
    name: "w_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public declare createdAt: number;
}

for (const language of LANGUAGES) {
  @TypeORM.Entity({ name: `kkutu_means_${language}` })
  class Entity extends Mean {
    @TypeORM.ManyToOne(() => Word[language], (word) => word.means)
    @TypeORM.JoinColumn({
      name: "m_word",
    })
    public declare word: Word;
  }
  Mean[language] = Entity;
}
