export namespace Schema {
  export interface Settings {
    application: {};
    cookie: {
      age: number;
      secret: string;
    };
    database: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
      connectTimeout: number;
      maxQueryExecutionTime: number;
    };
    languageSupport: Table<string>;
    log: {
      directory: string;
      interval: number;
    };
    secure: {
      ssl: boolean;
      isPFX: boolean;
      isCA: boolean;
      key: string;
      cert: string;
      ca: string;
      pfx: string;
      pfxPass: string;
      httpsOnly: boolean;
    };
    gameServerHost: string;
    gameServerRetry: number;
    ports: {
      game: number[];
      room: number[];
    };
  }
  export interface Dirent {
    name: string;
    isDirectory: boolean;
    isSelected: boolean;
  }
}
