import * as Redis from "redis";
import RedisStore from "connect-redis";
import Exession from "express-session";

const redisClient = Redis.createClient();
redisClient.connect();

const redisStore = new RedisStore({
  client: redisClient,
  ttl: 3600 * 12,
});

export const sessionParser = Exession({
  store: redisStore,
  secret: "kkutu",
  resave: false,
  saveUninitialized: true,
});
