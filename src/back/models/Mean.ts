import * as TypeORM from "typeorm";

import Word from "back/models/Word";
import { Database } from "common/Database";
import { KKuTu } from "../../common/KKuTu";

export default class Mean implements Serializable<Database.Mean> {
  public static ko: typeof Mean;
  public static en: typeof Mean;

  @TypeORM.PrimaryGeneratedColumn({ name: "m_id", type: "int8" })
  public declare id: string;

  public declare word: Word;

  @TypeORM.Column({
    name: "m_theme",
    type: "text",
    nullable: false,
  })
  public declare theme: string;

  @TypeORM.Column({
    name: "m_data",
    type: "json",
    default: [],
    nullable: false,
  })
  public declare data: string[];

  @TypeORM.Column({
    name: "w_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public declare createdAt: number;

  public serialize(): Database.Mean {
    return {
      theme: this.theme,
      data: this.data,
    };
  }
}

for (const language of Object.values(KKuTu.Game.Language)) {
  @TypeORM.Entity({ name: `kkutu_means_${language}` })
  class Entity extends Mean {
    public static readonly name = `Mean_${language}`;

    @TypeORM.ManyToOne(() => Word[language], (word) => word.means)
    @TypeORM.JoinColumn({
      name: "m_word",
    })
    public declare word: Word;
  }
  Mean[language] = Entity;
}
