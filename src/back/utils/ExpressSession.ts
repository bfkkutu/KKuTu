import * as Redis from "redis";
import RedisStore from "connect-redis";
import Exession from "express-session";

Exession.Session.prototype.saveSync = Exession.Session.prototype.save;
Exession.Session.prototype.save = function (callback?: (err: any) => void) {
  if (callback !== undefined) return this.saveSync(callback);
  return new Promise((resolve, reject) =>
    this.saveSync((e) => (e ? reject(e) : resolve(e)))
  );
};

RedisStore.prototype.getSync = RedisStore.prototype.get;
RedisStore.prototype.get = function (
  sid: string,
  cb?: (_err?: unknown, _data?: any) => void
) {
  if (cb !== undefined) return this.getSync(sid, cb);
  return new Promise((resolve, reject) =>
    this.getSync(sid, (e, data) => (e ? reject(e) : resolve(data)))
  );
};

export const redisClient = Redis.createClient();
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
