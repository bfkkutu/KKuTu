export namespace Schema {
  export interface Settings {
    application: {};
    advertisement: {
      client: string;
      slot: string;
    };
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
      http: number;
      https: number;
      game: number[];
      room: number[];
    };
  }
  export interface AuthClientConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }
  export type AuthConfig = Table<AuthClientConfig>;
}
