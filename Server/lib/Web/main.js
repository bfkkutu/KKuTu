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

const WS = require("ws");
const Express = require("express");
const Exession = require("express-session");
const Redission = require("connect-redis")(Exession);
const Redis = require("redis");
const Server = Express();
const webServer = Express();
const vHost = require("vhost");
const DB = require("./db");
const JLog = require("../sub/jjlog");
const WebInit = require("../sub/webinit");
const fs = require("fs");
const Secure = require("../sub/secure");
const passport = require("passport");
const Const = require("../const");
const https = require("https");
const hpkp = require("hpkp");
const referrerPolicy = require("referrer-policy");
const helmet = require("helmet");
const cors = require("cors");
const hsc = require("http-status-codes");
const PACKAGE = require("../package.json");

const hpkp_DIS = 15768000;
const Router = Express.Router();
const page = WebInit.page;
const ROUTES = { major: {}, consume: {}, admin: {}, login: {} };
const gameServers = [];

let Language = {
  ko_KR: require("./lang/ko_KR.json"),
  en_US: require("./lang/en_US.json"),
};
let IpFilters = JSON.parse(fs.readFileSync("./lib/Web/filters/User.json"));
let GLOBAL = require("../sub/global.json");

const HTML_TEMPLATE = fs.readFileSync(
  "./lib/Web/front/templates/template.html",
  "utf8"
);
const LOADING_TEMPLATE = fs.readFileSync(
  "./lib/Web/front/templates/loading.html",
  "utf8"
);
function Engine(path, $, callback) {
  const REACT_SUFFIX = "production.min";
  const CLIENT_SETTINGS = {};

  $.title = $.locale.title;
  $.version = PACKAGE["version"];
  const HTML = HTML_TEMPLATE.replace(
    new RegExp(`("?)/\\* %%SSR%% \\*/\\1`, "g"),
    LOADING_TEMPLATE
  ).replace(/("?)\/\*\{(.+?)\}\*\/\1/g, (v, p1, p2) => String(eval(p2)));
  callback(null, HTML);
}

WebInit.MOBILE_AVAILABLE = ["portal", "main", "kkutu"];

require("../sub/checkpub");
require("../Game/bot");
JLog.info("<< KKuTu Web >>");
fs.watchFile("./lib/Web/filters/User.json", (res) => {
  IpFilters = JSON.parse(fs.readFileSync("./lib/Web/filters/User.json"));
  JLog.info("IP-Ban Data is Auto-Updated at {lib/Web/main.js}");
});
fs.watchFile("./lib/sub/global.json", () => {
  GLOBAL = require("../sub/global.json");
  JLog.info("global.json is Auto-Updated at {lib/Web/main.js}");
});

const getClientIp = (req, res) => {
  let clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (typeof clientIp == "string" && clientIp.includes(","))
    clientIp = clientIp.split(",")[0];
  if (clientIp.startsWith("::ffff:")) return clientIp.substr(7);

  return clientIp;
};
class GameClient {
  constructor(id, url) {
    let override = url.match(/127\.0\.0\.\d{1,3}/);

    this.id = id;
    this.tryConnect = 0;
    this.connected = false;
    this.socket = new WS(url, {
      perMessageDeflate: false,
      rejectUnauthorized: !override,
    });

    const onOpen = () => {
      this.connected = true;
      JLog.info(`Game server #${this.id} connected`);
    };
    const onError = (err) => {
      this.connected = true;
      if (GLOBAL.GAME_SERVER_RETRY > 0) this.tryConnect++;
      JLog.warn(
        `Game server #${this.id} has an error: ${err.toString()} | ${err.code}`
      );
    };
    const onClose = (code) => {
      this.connected = false;
      JLog.error(`Game server #${this.id} closed: ${code}`);
      this.socket.removeAllListeners();
      delete this.socket;

      if (this.tryConnect <= GLOBAL.GAME_SERVER_RETRY) {
        JLog.info(
          `Retry connect ..` +
            (GLOBAL.GAME_SERVER_RETRY > 0 ? `, try: ${this.tryConnect}` : "")
        );
        setTimeout(() => {
          this.socket = new WS(url, {
            perMessageDeflate: false,
            rejectUnauthorized: override,
            handshakeTimeout: 2000,
          });
          this.socket.on("open", onOpen);
          this.socket.on("error", onError);
          this.socket.on("close", onClose);
          this.socket.on("message", onMessage);
        }, 5000);
      } else {
        JLog.info("Connect fail.");
      }
    };
    const onMessage = (data) => {
      data = JSON.parse(data);

      switch (data.type) {
        case "seek":
          this.seek = data.value;
          break;
        case "narrate-friend":
          for (let i in data.list) {
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

    this.socket.on("open", onOpen);
    this.socket.on("error", onError);
    this.socket.on("close", onClose);
    this.socket.on("message", onMessage);
  }
  send(type, data) {
    if (!data) data = {};
    data.type = type;

    this.socket.send(JSON.stringify(data));
  }
}
Server.use((req, res, _next) => {
  let clientIp = getClientIp(req, res);

  if (IpFilters.ips.indexOf(clientIp) == -1) _next();
  else
    res.send(
      `<head><title>BF끄투 - 406</title><style>body{ font-family:나눔바른고딕,맑은 고딕,돋움; }</style></head><body><center><h1>406 Not Acceptable</h1><div>서버가 요청을 거절했습니다.</div><br/>서버에서 받아들일 수 없는 요청이거나 서버에서 차단한 요청입니다.</body></center>`
    );
});
Server.set("views", __dirname + "/views");
Server.engine("tsx", Engine);
Server.set("view engine", "pug");
Server.set("view engine", "tsx");
Server.use(Express.static(__dirname + "/public"));
Server.use(Express.urlencoded({ extended: true }));
Server.use(
  Exession({
    store: new Redission({
      client: Redis.createClient(),
      ttl: 3600 * 12,
    }),
    secret: "kkutu",
    resave: false,
    saveUninitialized: true,
  })
);
//볕뉘 수정
Server.use(passport.initialize());
Server.use(passport.session());
Server.use((req, res, next) => {
  if (req.session.passport) {
    delete req.session.passport;
  }
  next();
});
Server.use((req, res, next) => {
  if (Const.HTTPS_ONLY) {
    if (req.protocol == "http") {
      let url = "https://" + req.get("host") + req.path;
      res.status(302).redirect(url);
    } else next();
  } else next();
});
WebInit.init(Server, true);
Object.keys(ROUTES).forEach((v) => {
  ROUTES[v] = require(`./routes/${v}`);
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
  JLog.success("DB is ready.");

  DB.kkutu_shop_desc.refreshLanguage(Language);

  webServer.use(vHost("bfkkutu.kr", Server));
  webServer.get("*", (req, res) => {
    res.status(hsc.StatusCodes.FORBIDDEN).send(`<h1>403 Forbidden</h1>`);
  });
  if (Const.IS_SECURED || Const.WS.ENABLED) {
    const options = Secure();
    https.createServer(options, webServer).listen(443);
  }
  if (!Const.WS.ENABLED) webServer.listen(80);
};
Const.MAIN_PORTS.forEach((v, i) => {
  let KEY = process.env["WS_KEY"];
  let protocol = Const.WS.ENABLED ? "ws" : Const.IS_SECURED ? "wss" : "ws";

  gameServers[i] = new GameClient(
    KEY,
    `${protocol}://${GLOBAL.GAME_SERVER_HOST}:${v}/${KEY}`
  );
});

for (let i of Object.values(ROUTES))
  i.run(
    Server,
    WebInit.page,
    require.cache[require.resolve("../Game/bot")].exports
  );

//Server.listen(3000);

Server.use(helmet());
Server.use(helmet.xssFilter());
//Server.use(helmet.frameguard({ action: "SAMEORIGIN" }));
Server.use(helmet.frameguard());

Server.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);

Server.use(
  hpkp({
    maxAge: hpkp_DIS,
    sha256s: [],

    setIf: (req, res) => {
      return req.secure;
    },
  })
);

Server.use(referrerPolicy({ policy: "same-origin" }));

Server.use(referrerPolicy({ policy: "unsafe-url" }));

Server.use(referrerPolicy());

Server.get("/", cors(), (req, res) => {
  let server = req.query.server;
  let loc = Const.MAIN_PORTS[server] ? "Kkutu" : "Portal";

  res.setHeader("X-Frame-Options", "deny");

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  //볕뉘 수정 구문삭제(220~229, 240)
  DB.session.findOne(["_id", req.session.id]).on(($ses) => {
    if (global.isPublic) {
      onFinish($ses);
      // DB.jjo_session.findOne([ '_id', sid ]).limit([ 'profile', true ]).on(onFinish);
    } else {
      if ($ses) $ses.profile.sid = $ses._id;
      onFinish($ses);
    }
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

Server.get("/servers", (req, res) => {
  let list = [];

  gameServers.forEach((v, i) => {
    list[i] = v.seek;
  });
  res.send({ list: list, max: Const.KKUTU_MAX });
});

Server.get("//servers", (req, res) => {
  let list = [];

  gameServers.forEach((v, i) => {
    list[i] = v.seek;
  });
  res.send({ list: list, max: Const.KKUTU_MAX });
});

Server.get("/adminList", (req, res) => {
  res.send({ admin: GLOBAL.ADMIN });
});

Server.get("/newUser", (req, res) => {
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

Server.get("/legal/:page", (req, res) => {
  page(req, res, "legal/" + req.params.page);
});

Server.get("/maintanance", (req, res) => {
  page(req, res, "Maintanance");
});

Server.get("/unsupported", (req, res) => {
  page(req, res, "Unsupported");
});

Server.get("*", (req, res) => {
  page(req, res, "Notfound");
});
