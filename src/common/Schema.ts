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
    wsUrl: string;
  }
  export interface AuthClientConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }
  export type AuthConfig = Table<AuthClientConfig>;

  export interface Profile {
    authType: string;
    // 이 식별자는 인게임에서 사용하지 않는다.
    id: string;
    name: string;
    title: string;
    image: string;
    exordial: string;

    token?: string;
    sid?: string;
  }
}
