import * as Redis from "redis";
import RedisStore from "connect-redis";
import Exession from "express-session";

declare module "express-session" {
  interface Session {
    save(): Promise<any>;
    saveSync(callback?: (err: any) => void): Exession.Session;
  }
}

declare module "connect-redis" {
  export default interface RedisStore {
    get(sid: string): Promise<any>;
    getSync(
      sid: string,
      cb?: (_err?: unknown, _data?: any) => void
    ): Promise<void>;
  }
}

Exession.Session.prototype.saveSync = Exession.Session.prototype.save;
Exession.Session.prototype.save = function (
  callback?: (err: any) => void
): any {
  if (callback !== undefined) return this.saveSync(callback);
  return new Promise((resolve) => this.saveSync((e: any) => resolve(e)));
};

RedisStore.prototype.getSync = RedisStore.prototype.get;
RedisStore.prototype.get = function (
  sid: string,
  cb?: (_err?: unknown, _data?: any) => void
) {
  if (cb !== undefined) return this.getSync(sid, cb);
  return new Promise((resolve) =>
    this.getSync(sid, (_, data) => resolve(data))
  );
};

const redisClient = Redis.createClient();
redisClient.connect();

export const redisStore = new RedisStore({
  client: redisClient,
  ttl: 3600 * 12,
});

export const sessionParser = Exession({
  store: redisStore,
  secret: "kkutu",
  resave: false,
  saveUninitialized: true,
});
