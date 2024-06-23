export namespace Schema {
  export interface Package {
    name: string;
    version: string;
    description: string;
    repository: string;
    keywords: string[];
    scripts: Table<string>;
    author: string;
    frontDependencies: Table<string>;
    devDependencies: Table<string>;
    dependencies: Table<string>;
    license: string;
  }
  export interface ProxiedServerConfiguration {
    hostname: string;
    ports: {
      external: number;
      internal: number;
    };
  }
  export interface Settings {
    advertisement: {
      google: GoogleAdvertisement;
      kakao: KakaoAdvertisement;
    };
    application: {
      sound: Table<string>;
      maxLevel: number;
      expTable: number[];
      moremiPart: string[];
      itemCategory: string[];
      roundTimes: number[];
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
    };
    channel: ProxiedServerConfiguration[];
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

  export interface AuthProfile {
    authType: string;
    // 이 식별자는 인게임에서 사용하지 않는다.
    id: string;
    name: string;
    title: string;
    image: string;
    exordial: string;
  }
  export interface Profile extends AuthProfile {
    token: string;
    sid: string;
    locale: string;
  }

  export interface GoogleAdvertisement {
    client: string;
    slot: string;
  }
  export interface KakaoAdvertisement {
    unit: string;
  }
}
