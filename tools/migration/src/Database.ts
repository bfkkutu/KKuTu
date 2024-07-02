import FS from "fs";
import * as TypeORM from "typeorm";

import { LANGUAGES } from "./System";

import WordLegacy from "./models/legacy/Word";
import Word from "./models/Word";
import Mean from "./models/Mean";

const SETTINGS = JSON.parse(
  FS.readFileSync("../../data/settings.json", { encoding: "utf-8" })
);

export default class DB {
  private static legacy = new TypeORM.DataSource({
    type: "postgres",
    ...SETTINGS["migration"],
    synchronize: false,
    logging: [],
    entities: [...LANGUAGES.map((v) => WordLegacy[v])],
  });
  private static dataSource = new TypeORM.DataSource({
    type: "postgres",
    ...SETTINGS["database"],
    synchronize: false,
    logging: [],
    entities: [
      ...LANGUAGES.map((v) => Word[v]),
      ...LANGUAGES.map((v) => Mean[v]),
    ],
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
