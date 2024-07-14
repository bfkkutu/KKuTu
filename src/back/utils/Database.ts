import * as TypeORM from "typeorm";

import { gc, SETTINGS } from "back/utils/System";
import { Logger } from "back/utils/Logger";
import { random } from "back/utils/Utility";
import { Database } from "common/Database";
import { Iterator } from "../../common/Utility";
import { KKuTu } from "../../common/KKuTu";

import User from "back/models/User";
import Chat from "back/models/Chat";
import Whisper from "back/models/Whisper";
import Report from "back/models/Report";
import Word from "back/models/Word";
import Mean from "back/models/Mean";
import * as Cache from "back/models/cache";

class DB {
  private static dataSource = new TypeORM.DataSource({
    type: "postgres",
    ...SETTINGS["database"],
    synchronize: true,
    logging: [],
    entities: [
      User,
      Chat,
      Whisper,
      Report,
      ...KKuTu.Game.LANGUAGES.map((v) => Word[v]),
      ...KKuTu.Game.LANGUAGES.map((v) => Mean[v]),
      ...KKuTu.Game.LANGUAGES.map((v) => Cache.Manner[v]),
      Cache.Manner.koNoInitial,
    ],
  });

  public static get Manager(): TypeORM.EntityManager {
    return DB.dataSource.manager;
  }
  public static async initialize(): Promise<void> {
    await DB.dataSource.initialize();
    Logger.success("DB").put(SETTINGS["database"].host).out();
  }
  public static paginate(
    length: number,
    page: number
  ): Database.PaginateOptions {
    return {
      skip: length * page,
      take: length,
    };
  }
  public static getTable(Target: new () => any): TypeORM.EntityMetadata {
    return DB.Manager.connection.getMetadata(Target);
  }
  public static getColumnName(
    table: TypeORM.EntityMetadata,
    column: string
  ): string {
    return table.findColumnWithPropertyName(column)!.databaseName;
  }
  public static callProcedure(
    manager: TypeORM.EntityManager,
    name: string,
    ...args: any[]
  ): Promise<void> {
    return manager.query(
      `CALL dds_p_${name}(${Iterator(args.length, "?").join(",")})`,
      args
    );
  }
  public static coalesce<T extends { id: any }, U extends keyof T>(
    manager: TypeORM.EntityManager,
    Target: new () => T,
    targetId: T["id"],
    column: U & string,
    data: Partial<T[U]>
  ): Promise<void> {
    if (manager === null) manager = DB.Manager;
    const table = DB.getTable(Target);
    const dataText = JSON.stringify(data);

    return manager.query(
      `UPDATE ${table.tableName}
      SET ${DB.getColumnName(
        table,
        column
      )} = COALESCE(JSON_MERGE_PATCH(${DB.getColumnName(table, column)}, ?), ?)
      WHERE ${DB.getColumnName(table, "id")} = ?
    `,
      [dataText, dataText, targetId]
    );
  }
  public static async count<T>(
    Model: new () => T,
    conditions?: TypeORM.FindManyOptions<T>
  ): Promise<number> {
    // NOTE .count() 함수는 내부적으로 DISTINCT PK를 쓰고 있어 느리다.
    const qb = DB.Manager.createQueryBuilder(Model, "model").select(
      "COUNT(*) AS count"
    );
    if (conditions) {
      qb.where(conditions);
    }
    return (await qb.getRawOne())["count"];
  }
}

namespace DB {
  export class Memory {
    private static readonly TABLE: Table<Memory.Repository<any> | undefined> =
      {};

    public static async load<E extends TypeORM.ObjectLiteral>(
      id: string,
      query: TypeORM.SelectQueryBuilder<E>
    ): Promise<Memory.Repository<E>> {
      if (Memory.TABLE[id] === undefined) {
        const words = await query.getMany();
        Memory.TABLE[id] = new Memory.Repository<E>(
          Object.fromEntries(words.map((word) => [word.data, word]))
        );
      }
      ++Memory.TABLE[id].count;
      return Memory.TABLE[id];
    }
    public static unload(id: string): void {
      const repository = Memory.TABLE[id];
      if (repository === undefined) {
        return;
      }
      if (--repository.count !== 0) {
        return;
      }
      delete Memory.TABLE[id];
      gc();
    }
  }
  export namespace Memory {
    export class Repository<E extends TypeORM.ObjectLiteral> {
      private readonly data: Table<E>;
      public count = 0;

      constructor(data: Table<E>) {
        this.data = data;
      }

      public has(key: string): boolean {
        return key in this.data;
      }
      public get(key: string): E {
        return this.data[key];
      }
      public random(): string {
        return random(Object.keys(this.data));
      }
    }
  }
}

export default DB;

