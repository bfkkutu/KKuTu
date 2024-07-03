import * as TypeORM from "typeorm";

import { Transformer } from "back/utils/DatabaseAgent";
import { KKuTu } from "../../../common/KKuTu";

export default class Manner {
  public static ko: typeof Manner;
  public static en: typeof Manner;

  @TypeORM.PrimaryGeneratedColumn({ name: "c_m_id", type: "int8" })
  public declare id: string;

  @TypeORM.Column({ name: "c_m_last", type: "text", nullable: false })
  public declare last: string;

  @TypeORM.Column({
    name: "c_m_modes",
    type: "text",
    default: "",
    nullable: false,
    transformer: Transformer.IntegerList,
  })
  public declare modes: KKuTu.Game.Mode[];

  @TypeORM.Column({
    name: "c_m_createdAt",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  public declare createdAt: number;
}

for (const language of Object.values(KKuTu.Game.Language)) {
  @TypeORM.Entity({ name: `kkutu_cache_manner_${language}` })
  class Entity extends Manner {}
  Manner[language] = Entity;
}

