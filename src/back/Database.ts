/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const LANG = ["ko", "en", "mo"];

const PgPool = require("pg").Pool;
const JLog = require("../sub/jjlog");
const Collection = require("../sub/collection");
const Pub = require("../sub/checkpub");
const Lizard = require("../sub/lizard");
const File = require("fs");

const FAKE_REDIS_FUNC = () => {
  const R = new Lizard.Tail();

  R.go({});
  return R;
};
const FAKE_REDIS = {
  putGlobal: FAKE_REDIS_FUNC,
  getGlobal: FAKE_REDIS_FUNC,
  getPage: FAKE_REDIS_FUNC,
  getSurround: FAKE_REDIS_FUNC,
};

let GLOBAL = require("../sub/global.json");

File.watchFile("./lib/sub/global.json", () => {
  GLOBAL = require("../sub/global.json");
  JLog.info("global.json is Auto-Updated at {lib/Web/db.js}");
});

Pub.ready = (isPub) => {
  const Redis = require("redis").createClient();
  const Pg = new PgPool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE,
  });
  Redis.on("connect", () => {
    connectPg();
  });
  Redis.on("error", (err) => {
    JLog.error("Error from Redis: " + err);
    JLog.alert("Run with no-redis mode.");
    Redis.quit();
    connectPg(true);
  });
  const connectPg = (noRedis) => {
    Pg.connect((err, pgMain) => {
      if (err) {
        JLog.error(
          "Error when connect to PostgreSQL server: " + err.toString()
        );
        return;
      }
      const redisAgent = noRedis ? null : new Collection.Agent("Redis", Redis);
      const mainAgent = new Collection.Agent("Postgres", pgMain);

      const DB = exports;

      DB.kkutu = {};
      DB.kkutu_cw = {};
      DB.kkutu_manner = {};

      DB.redis = noRedis ? FAKE_REDIS : new redisAgent.Table("KKuTu_Score");
      DB.rRedis = noRedis
        ? FAKE_REDIS
        : new redisAgent.Table("KKuTu_RankPoint");
      for (let i in LANG) {
        DB.kkutu[LANG[i]] = new mainAgent.Table("kkutu_" + LANG[i]);
        DB.kkutu_cw[LANG[i]] = new mainAgent.Table("kkutu_cw_" + LANG[i]);
        DB.kkutu_manner[LANG[i]] = new mainAgent.Table(
          "kkutu_manner_" + LANG[i]
        );
      }
      DB.kkutu_injeong = new mainAgent.Table("kkutu_injeong");
      DB.kkutu_shop = new mainAgent.Table("kkutu_shop");
      DB.kkutu_shop_desc = new mainAgent.Table("kkutu_shop_desc");
      DB.kkutu_shop_desc.refreshLanguage = function (Language) {
        this.find().on(($docs) => {
          var lang, i;

          for (lang in Language) {
            var db;

            Language[lang].SHOP = db = {};
            for (i in $docs)
              db[$docs[i]._id] = [
                $docs[i][`name_${lang}`],
                $docs[i][`desc_${lang}`],
              ];
          }
        });
      };

      DB.session = new mainAgent.Table("session");
      DB.localUsers = new mainAgent.Table("localusers");
      DB.users = new mainAgent.Table("users");
      DB.nicknameLog = new mainAgent.Table("nickname_log");
      DB.clans = new mainAgent.Table("clan");
      DB.bank = new mainAgent.Table("bank");
      DB.record = new mainAgent.Table("record");

      DB.log = {
        connection: new mainAgent.Table("log_connection"),
        chat: new mainAgent.Table("log_chat"),
        whisper: new mainAgent.Table("log_whisper"),
        admin: {
          word: new mainAgent.Table("log_admin_word"),
          user: new mainAgent.Table("log_admin_user"),
          shop: new mainAgent.Table("log_admin_shop"),
        },
      };

      DB.statistics = new mainAgent.Table("statistics");

      if (exports.ready) exports.ready(Redis, Pg);
      else JLog.warn("DB.onReady was not defined yet.");
    });
  };
};
