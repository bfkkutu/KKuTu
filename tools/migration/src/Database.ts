import FS from "fs";
import * as TypeORM from "typeorm";

import {
  WordKo as WordKoLegacy,
  WordEn as WordEnLegacy,
} from "./models/legacy/Word";
import { WordKo, WordEn } from "./models/Word";

const SETTINGS = JSON.parse(
  FS.readFileSync("../../data/settings.json", { encoding: "utf-8" })
);

export default class DB {
  private static legacy = new TypeORM.DataSource({
    type: "postgres",
    ...SETTINGS["migration"],
    synchronize: false,
    logging: [],
    entities: [WordKoLegacy, WordEnLegacy],
  });
  private static dataSource = new TypeORM.DataSource({
    type: "postgres",
    ...SETTINGS["database"],
    synchronize: false,
    logging: [],
    entities: [WordKo, WordEn],
  });

  public static get Legacy(): TypeORM.EntityManager {
    return DB.legacy.manager;
  }
  public static get Manager(): TypeORM.EntityManager {
    return DB.dataSource.manager;
  }
  public static async initialize(): Promise<void> {
    await DB.legacy.initialize();
    await DB.dataSource.initialize();
  }
}
