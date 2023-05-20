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

import fs from "fs";
import https from "https";
import { WebSocket } from "ws";
import Express from "express";
import Exession from "express-session";
import RedisStore from "connect-redis";
import Redis from "redis";
// @ts-ignore
import hpkp from "hpkp";
import referrerPolicy from "referrer-policy";
import passport from "passport";
import helmet from "helmet";
import cors from "cors";

import DB from "./utils/Database";
import { Logger } from "./utils/Logger";
import { SETTINGS } from "./utils/System";
import Route from "./utils/Route";
import ExpressAgent from "./utils/ExpressAgent";
import Secure from "./utils/Secure";

const gameServers: GameClient[] = [];

const App = Express();

require("../sub/checkpub");
require("../Game/bot");
Logger.info("<< KKuTu Web >>");

class GameClient {
  private readonly id: string;
  private readonly url: string;
  private tryConnect = 0;
  public connected = false;
  public socket!: WebSocket;
  public seek?: string;
  public constructor(id: string, url: string) {
    this.id = id;
    this.url = url;
    this.connect();
  }
  private connect() {
    const override = this.url.match(/127\.0\.0\.\d{1,3}/);
    this.socket = new WebSocket(this.url, {
      perMessageDeflate: false,
      rejectUnauthorized: this.tryConnect === 0 ? !override : !!override,
      handshakeTimeout: this.tryConnect === 0 ? undefined : 2000,
    });
    this.socket.on("open", this.onOpen);
    this.socket.on("error", this.onError);
    this.socket.on("close", this.onClose);
    this.socket.on("message", this.onMessage);
  }
  private onOpen() {
    this.connected = true;
    Logger.info(`Game server #${this.id} connected`);
  }
  private onError(err: Error) {
    this.connected = true;
    if (SETTINGS.gameServerRetry > 0) this.tryConnect++;
    Logger.warning(`Game server #${this.id} has an error: ${err.toString()}`);
  }
  private onClose(code: number) {
    this.connected = false;
    Logger.error(`Game server #${this.id} closed: ${code}`);
    this.socket.removeAllListeners();

    if (this.tryConnect <= SETTINGS.gameServerRetry) {
      Logger.info(
        `Retry connect ..` +
          (SETTINGS.gameServerRetry > 0 ? `, try: ${this.tryConnect}` : "")
      );
      setTimeout(() => this.connect(), 5000);
    } else {
      Logger.info("Connect fail.");
    }
  }
  private onMessage = (data: any) => {
    data = JSON.parse(data);

    switch (data.type) {
      case "seek":
        this.seek = data.value;
        break;
      case "narrate-friend":
        for (let i in data.list as any[]) {
          gameServers[i].send("narrate-friend", {
            id: data.id,
            s: data.s,
            stat: data.stat,
            list: data.list[i],
          });
        }
        break;
      default:
    }
  };
  private send(type: string, data: any) {
    if (!data) data = {};
    data.type = type;

    this.socket.send(JSON.stringify(data));
  }
}
Route(App);
App.use(
  Exession({
    store: new RedisStore({
      client: Redis.createClient(),
      ttl: 3600 * 12,
    }),
    secret: "kkutu",
    resave: false,
    saveUninitialized: true,
  })
);
App.use(passport.initialize());
App.use(passport.session());
App.use((req, res, next) => {
  if (SETTINGS.secure.httpsOnly) {
    if (req.protocol == "http")
      res.status(302).redirect("https://" + req.get("host") + req.path);
    else next();
  } else next();
});

DB.ready = () => {
  setInterval(() => {
    DB.session.remove(["createdAt", { $lte: Date.now() - 3600000 * 12 }]).on();
  }, 600000);
  setInterval(() => {
    gameServers.forEach((v) => {
      if (v.socket && v.connected) v.socket.send(`{"type":"seek"}`);
      else v.seek = undefined;
    });
  }, 4000);
  Logger.success("DB is ready.");

  if (SETTINGS.secure.ssl) {
    const options = Secure();
    https.createServer(options, App).listen(443);
  }
  App.listen(80);
};
SETTINGS.ports.game.forEach((v, i) => {
  const KEY = process.env["WS_KEY"]!;

  gameServers[i] = new GameClient(
    KEY,
    `${SETTINGS.secure.ssl ? "wss" : "ws"}://${
      SETTINGS.gameServerHost
    }:${v}/${KEY}`
  );
});

App.use(helmet());
App.use(helmet.xssFilter());
App.use(helmet.frameguard());

App.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);

App.use(
  hpkp({
    maxAge: 15768000,
    sha256s: [],

    setIf: (req: Express.Request) => req.secure,
  })
);

App.use(referrerPolicy({ policy: ["same-origin", "unsafe-url"] }));

App.get("/", cors(), (req, res) => {
  let server = req.query.server;
  let loc = Const.MAIN_PORTS[server] ? "Kkutu" : "Portal";

  res.setHeader("X-Frame-Options", "deny");

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  //볕뉘 수정 구문삭제(220~229, 240)
  DB.session.findOne(["_id", req.session.id]).on(($ses) => {
    onFinish($ses);
  });
  function onFinish($doc) {
    let id = req.session.id;
    let ptc = "ws";

    if (Const.IS_SECURED || Const.WS.ENABLED) ptc = "wss";

    if ($doc) {
      req.session.profile = $doc.profile;
      id = $doc.profile.sid;
    } else delete req.session.profile;

    page(req, res, loc, {
      _page: "Kkutu",
      _id: id,
      PORT: Const.MAIN_PORTS[server],
      HOST: Const.WS.ENABLED ? Const.WS.URI : req.hostname,
      ALTERNATIVE_HOST: Const.WS.ALTERNATIVE_URI,
      PROTOCOL: ptc,
      TEST: req.query.test,
      MOREMI_PART: Const.MOREMI_PART,
      AVAIL_EQUIP: Const.AVAIL_EQUIP,
      CATEGORIES: Const.CATEGORIES,
      GROUPS: Const.GROUPS,
      MODE: Const.GAME_TYPE,
      RULE: Const.RULE,
      OPTIONS: Const.OPTIONS,
      KO_INJEONG: Const.KO_INJEONG,
      KO_EVENT: Const.KO_EVENT,
      EN_INJEONG: Const.EN_INJEONG,
      KO_THEME: Const.KO_THEME,
      EN_THEME: Const.EN_THEME,
      KOR_EXTERNAL_DB: Const.KOR_EXTERNAL_DB,
      IJP_EXCEPT: Const.IJP_EXCEPT,
      ogImage: "https://bfkkutu.kr/img/kkutu/logo.png",
      ogURL: "https://bfkkutu.kr/",
      ogTitle: "새로운 끄투의 시작, BF끄투!",
      ogDescription: "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!",
      wrapPage: true,
    });
  }
});

App.get("/servers", (req, res) => {
  let list = [];

  gameServers.forEach((v, i) => {
    list[i] = v.seek;
  });
  res.send({ list: list, max: Const.KKUTU_MAX });
});

App.get("//servers", (req, res) => {
  let list = [];

  gameServers.forEach((v, i) => {
    list[i] = v.seek;
  });
  res.send({ list: list, max: Const.KKUTU_MAX });
});

App.get("/adminList", (req, res) => {
  res.send({ admin: GLOBAL.ADMIN });
});

App.get("/newUser", (req, res) => {
  let id = req.query.id;

  if (!req.query.cp) {
    DB.users.findOne(["_id", id]).on(($u) => {
      if (!$u) return res.sendStatus(404);
      else {
        return res.send({ newUser: $u.newuser });
      }
    });
  } else if (req.query.cp == `${id}cp`) {
    DB.users.findOne(["_id", id]).on(($u) => {
      if (!$u) return res.sendStatus(404);
      else {
        if ($u.newuser)
          DB.users.update(["_id", id]).set(["newuser", false]).on();
        else return res.sendStatus(404);
      }
    });
  } else return res.sendStatus(404);
});

App.get("/legal/:page", (req, res) => {
  page(req, res, "legal/" + req.params.page);
});

App.get("*", (req, res) => {
  page(req, res, "Notfound");
});
