import * as TypeORM from "typeorm";

import Mean from "back/models/Mean";
import { Database } from "common/Database";
import { KKuTu } from "../../common/KKuTu";

export default class Word implements Serializable<Database.Word> {
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

  public serialize(): Database.Word {
    return {
      id: this.id,
      data: this.data,
      means: Object.fromEntries(
        this.means.map((mean) => [mean.theme, mean.data])
      ),
    };
  }
}

for (const language of Object.values(KKuTu.Game.Language)) {
  @TypeORM.Entity({ name: `kkutu_words_${language}` })
  class Entity extends Word {
    public static readonly name = `Word_${language}`;

    @TypeORM.OneToMany(() => Mean[language], (mean) => mean.word)
    public declare means: Mean[];
  }
  Word[language] = Entity;
}

