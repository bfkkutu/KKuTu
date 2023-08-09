export namespace Schema {
  export interface Settings {
    advertisement: {
      client: string;
      slot: string;
    };
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
    gameServerHost: string;
    gameServerRetry: number;
    languageSupport: Table<string>;
    log: {
      directory: string;
      interval: number;
    };
    max: number[];
    ports: {
      http: number;
      https: number;
      channel: number[];
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
  }
  export interface AuthClientConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }
  export type AuthConfig = Table<AuthClientConfig>;
}
