import * as TypeORM from "typeorm";

import { SETTINGS } from "./System";

import User from "../models/User";

export default class DB {
  private static dataSource: TypeORM.DataSource = new TypeORM.DataSource({
    type: "postgres",
    ...SETTINGS["database"],
    entities: [User],
  });
  public static async initialize() {
    await DB.dataSource.initialize();
  }
  public static get Manager() {
    return DB.dataSource.manager;
  }
}
