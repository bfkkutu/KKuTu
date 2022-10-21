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

const Web = require("request");
const MainDB = require("../db");
const JLog = require("../../sub/jjlog");
const Const = require("../../const");
const fs = require("fs");
const Outer = require("../../sub/outer");
const moment = require("moment");
const sha256 = require("sha256");

const translateToPromise = (query) =>
  new Promise((res, rej) => {
    query.on(
      (doc) => {
        res(doc);
      },
      null,
      (err) => {
        rej(err);
      }
    );
  });
const obtain = ($user, key, value, term, addValue) => {
  const now = new Date().getTime();

  if (term) {
    if ($user.box[key]) {
      if (addValue) $user.box[key].value += value;
      else $user.box[key].expire += term;
    } else
      $user.box[key] = {
        value: value,
        expire: Math.round(now * 0.001 + term),
      };
  } else {
    $user.box[key] = ($user.box[key] || 0) + value;
  }
};
const consume = ($user, key, value, force) => {
  const bd = $user.box[key];

  if (bd.value) {
    // 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
    if ((bd.value -= value) <= 0) {
      if (force || !bd.expire) delete $user.box[key];
    }
  } else {
    if (($user.box[key] -= value) <= 0) delete $user.box[key];
  }
};
const getDirectories = (path, callback) => {
  let files = null;
  try {
    files = fs.readdirSync(path);
  } catch (e) {
    return callback(e);
  }
  return callback(false, files);
};
const getCFRewards = (word, level, blend, event) => {
  const R = [];
  const f = {
    len: word.length, // 최대 6
    lev: level, // 최대 18
  };
  let cost = 20 * f.lev;
  let wur = f.len / 36; // 최대 2.867

  if (blend) {
    if (wur >= 0.5) {
      R.push({ key: "$WPA?", value: 1, rate: 1 });
    } else if (wur >= 0.35) {
      R.push({ key: "$WPB?", value: 1, rate: 1 });
    } else if (wur >= 0.05) {
      R.push({ key: "$WPC?", value: 1, rate: 1 });
    }
    cost = Math.round(cost * 0.2);
  } /*else if(event){
		R.push({ key: "dictPage", value: Math.round(f.len * 0.6), rate: 1 });
		R.push({ key: "korea_flag", value: 1, rate: 0.07 });
		R.push({ key: "clock_minju", value: 1, rate: 0.07 });
		R.push({ key: "minju", value: 1, rate: 0.07 });
		R.push({ key: "pants_korea", value: 1, rate: 0.07 });
		R.push({ key: "korea", value: 1, rate: 0.07 });
		R.push({ key: "mustache", value: 1, rate: 0.07 });
		R.push({ key: "brave_eyes", value: 1, rate: 0.07 });
		cost = 0;
	}*/ else {
    R.push({ key: "dictPage", value: Math.round(f.len * 0.6), rate: 1 });
    R.push({ key: "boxB4", value: 1, rate: Math.min(1, f.lev / 7) });
    if (f.lev >= 5) {
      R.push({ key: "boxB3", value: 1, rate: Math.min(1, f.lev / 15) });
      cost += 10 * f.lev;
      wur += f.lev / 20;
    }
    if (f.lev >= 10) {
      R.push({ key: "boxB2", value: 1, rate: Math.min(1, f.lev / 30) });
      cost += 20 * f.lev;
      wur += f.lev / 10;
    }
    if (wur >= 0.05) {
      if (wur > 1) R.push({ key: "$WPC?", value: Math.floor(wur), rate: 1 });
      R.push({ key: "$WPC?", value: 1, rate: wur % 1 });
    }
    if (wur >= 0.35) {
      if (wur > 2)
        R.push({ key: "$WPB?", value: Math.floor(wur / 2), rate: 1 });
      R.push({ key: "$WPB?", value: 1, rate: (wur / 2) % 1 });
    }
    if (wur >= 0.5) {
      R.push({ key: "$WPA?", value: 1, rate: wur / 3 });
    }
  }
  return { data: R, cost: cost };
};
const blendWord = (word) => {
  const lang = parseLanguage(word);
  const kl = [];
  const kr = [];

  if (lang == "en")
    return String.fromCharCode(97 + Math.floor(Math.random() * 26));
  if (lang == "ko") {
    for (let i = word.length - 1; i >= 0; i--) {
      const k = word.charCodeAt(i) - 0xac00;

      kl.push([Math.floor(k / 28 / 21), Math.floor(k / 28) % 21, k % 28]);
    }
    [0, 1, 2]
      .sort((a, b) => Math.random() < 0.5)
      .forEach((v, i) => {
        kr.push(kl[v][i]);
      });
    return String.fromCharCode((kr[0] * 21 + kr[1]) * 28 + kr[2] + 0xac00);
  }
};
const parseLanguage = (word) => {
  return word.match(/[a-zA-Z]/) ? "en" : "ko";
};

exports.run = (Server, page, Bot) => {
  Server.get("/box", (req, res) => {
    if (req.session.profile) {
      /*if(Const.ADMIN.indexOf(req.session.profile.id) == -1){
			return res.send({ error: 555 });
		}*/
    } else {
      return res.send({ error: 400 });
    }
    MainDB.users
      .findOne(["_id", req.session.profile.id])
      .limit(["box", true])
      .on(($body) => {
        if (!$body) {
          res.send({ error: 400 });
        } else {
          res.send($body.box);
        }
      });
  });
  Server.get("/help", (req, res) => {
    page(req, res, "help", {
      KO_INJEONG: Const.KO_INJEONG,
    });
  });
  Server.get("/ranking", (req, res) => {
    let pg = Number(req.query.p);
    let id = req.query.id;

    if (id) {
      MainDB.redis.getSurround(id, 15).then(($body) => {
        res.send($body);
      });
    } else {
      if (isNaN(pg)) pg = 0;
      MainDB.redis.getPage(pg, 15).then(($body) => {
        res.send($body);
      });
    }
  });
  Server.get("/rpRanking", (req, res) => {
    let pg = Number(req.query.p);
    let id = req.query.id;

    if (id) {
      MainDB.rRedis.getSurround(id, 15).then(($body) => {
        res.send($body);
      });
    } else {
      if (isNaN(pg)) pg = 0;
      MainDB.rRedis.getPage(pg, 15).then(($body) => {
        res.send($body);
      });
    }
  });
  Server.get("/client/session", (req, res) => {
    MainDB.localUsers
      .findOne(["id", req.query.id], ["password", sha256.x2(req.query.pw)])
      .on(($body) => {
        if (!$body) return res.sendStatus(404);

        return res.send($body.sessionId);
      });
  });
  Server.get("/client/data", (req, res) => {
    MainDB.localUsers
      .findOne(["id", req.query.id], ["password", sha256.x2(req.query.pw)])
      .on(($body) => {
        if (!$body) return res.sendStatus(404);

        MainDB.users.findOne(["_id", `l${$body.id}`]).on(($user) => {
          if ($user) return res.send(`${$body.sessionId}|${$user.nickname}`);
          else return res.send(`${$body.sessionId}|l${body.id}`);
        });
      });
  });
  Server.get("/client/loadgame", (req, res) => {
    const data = {};

    data.MOREMI_PART = Const.MOREMI_PART;
    data.MODE = Const.GAME_TYPE;
    data.RULE = Const.RULE;
    data.OPTIONS = Const.OPTIONS;
    data.lang = require("../lang/ko_KR.json").kkutu;
    return res.send(data);
  });

  /*
	Clan System
	
	System Structure
	유저 권한: 클랜 마스터 (2), 클랜 부마스터 (1), 클랜원 (0)
	클랜 마스터 1명: 유저 추방 O, 유저 차단/해제 O, 클랜원을 승급 O, 부마스터를 강등 O, 클랜 해체 O, 최대 인원수 확장 O, 탈퇴 X
	클랜 부마스터 1명: 유저 추방 O, 유저 차단/해제 O, 클랜원을 승급 X, 부마스터를 강등 X, 클랜 해체 X, 최대 인원수 확장 O, 탈퇴 O
	클랜원: 유저 추방 X, 유저 차단/해제 X, 클랜원을 승급 X, 부마스터를 강등 X, 클랜 해체 X, 최대 인원수 확장 X, 탈퇴 O
	
	DB Structure
	_id: 클랜 고유 번호 (123456789)
	name: 클랜명 (abcd)
	score: 클랜 점수 (에 따라 클랜 레벨 결정) (1234)
	users: 클랜원 목록 ({"userid":permission,"6355565464":0})
	max: 최대 인원수
	blacklist: 차단된 클랜원 목록
	uname: 클랜원 닉네임
*/
  Server.post("/clan/create", (req, res) => {
    function generateClanID() {
      let id = "";
      for (let i = 0; i < 9; i++) id += Outer.random(0, 9);
      return id;
    }

    let newClanID = generateClanID();

    MainDB.clans.findOne(["_id", newClanID]).on(($ec) => {
      if ($ec) {
        newClanID = generateClanID();
        return;
      }
    });

    MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
      if (!$user) return res.send({ message: "FAIL" });
      else {
        const postM = $user.money - 5000;

        if (postM < 0) return res.send({ message: "MONEYFAIL" });
        else {
          MainDB.users
            .update(["_id", req.body.me])
            .set(["money", postM])
            .on(($fin) => {
              JLog.log(`[CLAN PURCHASED] ${req.body.name} by ${req.body.me}`);
              MainDB.users
                .update(["_id", req.body.me])
                .set(["clan", newClanID])
                .on();
              MainDB.clans
                .insert(
                  ["_id", newClanID],
                  ["users", JSON.parse(`{"${req.body.me}":2}`)],
                  ["name", req.body.name],
                  ["blacklist", JSON.parse(`{"${req.body.me}":false}`)],
                  ["password", sha256.x2(req.body.password)],
                  [
                    "uname",
                    JSON.parse(`{"${req.body.me}":"${$user.nickname}"}`),
                  ]
                )
                .on();
              return res.send({ message: "OK" });
            });
        }
      }
    });
  });
  Server.post("/clan/remove", (req, res) => {
    MainDB.clans.findOne(["_id", req.body.id]).on(($ec) => {
      if (!$ec) return res.send({ message: "FAIL" });
      else if ($ec.password != sha256.x2(req.body.password))
        return res.send({ message: "PASSWORDFAIL" });
      else {
        if ($ec.users[req.body.me] == 2) {
          MainDB.users.find(["clan", req.body.id]).on(($res) => {
            for (let i in $res)
              MainDB.users
                .update(["_id", $res[i]._id])
                .set(["clan", null])
                .on();
            MainDB.clans.remove(["_id", req.body.id]).on();
          });
          return res.send({ message: "OK" });
        } else return res.sendStatus(403);
      }
    });
  });
  Server.post("/clan/extend", (req, res) => {
    MainDB.clans.findOne(["_id", req.body.id]).on(($ec) => {
      if (!$ec) return res.send({ message: "FAIL" });
      if ($ec.max >= 50) return res.send({ message: "MAX" });
      if ($ec.password != sha256.x2(req.body.password))
        return res.send({ message: "PASSWORDFAIL" });
      if ($ec.users[req.body.me] == 0)
        return res.send({ message: "PERMISSIONFAIL" });
      else {
        MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
          if (!$user) return res.send({ message: "FAIL" });
          else {
            const postM = $user.money - 5000;

            if (postM < 0) return res.send({ message: "MONEYFAIL" });
            else {
              MainDB.users
                .update(["_id", req.body.me])
                .set(["money", postM])
                .on(($fin) => {
                  JLog.log(
                    `[CLAN EXTEND PURCHASED] New Max ${
                      Number($ec.max) + 10
                    } for ${$ec.name}`
                  );
                  MainDB.clans
                    .update(["_id", req.body.id])
                    .set(["max", Number($ec.max) + 10])
                    .on();
                  return res.send({ message: "OK" });
                });
            }
          }
        });
      }
    });
  });
  Server.post("/clan/user/add", (req, res) => {
    MainDB.clans.findOne(["_id", req.body.id]).on(($ec) => {
      if (!$ec) return res.send(400);
      else {
        if (Object.keys($ec.users).length == $ec.max)
          return res.sendStatus(401);
        else if ($ec.blacklist[req.body.me]) return res.sendStatus(402);
        else {
          MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
            if ($user.clan) return res.sendStatus(403);
            $ec.uname[req.body.me] = $user.nickname;
            $ec.users[req.body.me] = 0;
            $ec.blacklist[req.body.me] = false;
            MainDB.users
              .update(["_id", req.body.me])
              .set(["clan", $ec._id])
              .on();
            MainDB.clans
              .update(["_id", req.body.id])
              .set(["users", $ec.users], ["uname", $ec.uname])
              .on();
            return res.sendStatus(200);
          });
        }
      }
    });
  });
  Server.post("/clan/user/remove", (req, res) => {
    MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
      if (!$user) return res.send({ message: "FAIL" });
      else {
        MainDB.clans.findOne(["_id", req.body.id]).on(($ec) => {
          if (!$ec) return res.send({ message: "FAIL" });
          else if ($ec.password != sha256.x2(req.body.password))
            return res.send({ message: "PASSWORDFAIL" });
          else {
            delete $ec.users[req.body.me];
            delete $ec.uname[req.body.me];
            MainDB.users.update(["_id", req.body.me]).set(["clan", ""]).on();
            MainDB.clans
              .update(["_id", req.body.id])
              .set(["users", $ec.users])
              .on();
          }
        });
        return res.send({ message: "OK" });
      }
    });
  });
  Server.post("/clan/user/leave", (req, res) => {
    MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
      if (!$user) return res.sendStatus(500);
      else {
        MainDB.clans.findOne(["_id", $user.clan]).on(($ec) => {
          delete $ec.users[req.body.me];
          delete $ec.uname[req.body.me];
          MainDB.users.update(["_id", req.body.me]).set(["clan", ""]).on();
          MainDB.clans
            .update(["_id", $user.clan])
            .set(["users", $ec.users])
            .on();
        });
        return res.sendStatus(200);
      }
    });
  });
  Server.post("/clan/user/ban", (req, res) => {
    MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
      if (!$user) return res.send({ message: "FAIL" });
      else {
        MainDB.clans.findOne(["_id", $user.clan]).on(($ec) => {
          if (!$ec) return res.send({ message: "FAIL" });
          else if ($ec.password != sha256.x2(req.body.password))
            return res.send({ message: "PASSWORDFAIL" });
          else if ($ec.users[req.body.me] == 0)
            return res.send({ message: "PERMISSIONFAIL" });
          else {
            $ec.blacklist[req.body.id] = true;
            MainDB.clans
              .update(["_id", $user.clan])
              .set(["blacklist", $ec.blacklist])
              .on();
          }
        });
        return res.send({ message: "OK" });
      }
    });
  });
  Server.post("/clan/user/unban", (req, res) => {
    MainDB.users.findOne(["_id", req.body.me]).on(($user) => {
      if (!$user) return res.send({ message: "FAIL" });
      else {
        MainDB.clans.findOne(["_id", $user.clan]).on(($ec) => {
          if (!$ec) return res.send({ message: "FAIL" });
          else if ($ec.password != sha256.x2(req.body.password))
            return res.send({ message: "PASSWORDFAIL" });
          else if ($ec.users[req.body.me] == 0)
            return res.send({ message: "PERMISSIONFAIL" });
          else {
            $ec.blacklist[req.body.id] = false;
            MainDB.clans
              .update(["_id", $user.clan])
              .set(["blacklist", $ec.blacklist])
              .on();
          }
        });
        return res.send({ message: "OK" });
      }
    });
  });
  Server.post("/clan/user/promote", (req, res) => {
    MainDB.users.findOne(["_id", req.body.id]).on(($user) => {
      if (!$user) return res.send({ message: "FAIL" });
      else {
        MainDB.clans.findOne(["_id", $user.clan]).on(($ec) => {
          if (!$ec) return res.send({ message: "FAIL" });
          else if ($ec.password != sha256.x2(req.body.password))
            return res.send({ message: "PASSWORDFAIL" });
          else if ($ec.users[req.body.id] != 0)
            return res.send({ message: "PERMISSIONFAIL" });
          else {
            $ec.users[req.body.id] = 1;
            MainDB.clans
              .update(["_id", $ec._id])
              .set(["users", $ec.users])
              .on();
          }
        });
        return res.send({ message: "OK" });
      }
    });
  });
  Server.post("/clan/user/demote", (req, res) => {
    MainDB.users.findOne(["_id", req.body.id]).on(($user) => {
      if (!$user) return res.send({ message: "FAIL" });
      else {
        MainDB.clans.findOne(["_id", $user.clan]).on(($ec) => {
          if (!$ec) return res.send({ message: "FAIL" });
          else if ($ec.password != sha256.x2(req.body.password))
            return res.send({ message: "PASSWORDFAIL" });
          else if ($ec.users[req.body.id] != 1)
            return res.send({ message: "PERMISSIONFAIL" });
          else {
            $ec.users[req.body.id] = 0;
            MainDB.clans
              .update(["_id", $ec._id])
              .set(["users", $ec.users])
              .on();
          }
        });
        return res.send({ message: "OK" });
      }
    });
  });
  Server.get("/clan/user", (req, res) => {
    // 유저의 클랜 정보 알아내기
    MainDB.users.findOne(["_id", req.query.id]).on(($user) => {
      if (!$user.clan) return res.send({ _id: undefined, name: undefined });
      else {
        MainDB.clans.findOne(["_id", $user.clan]).on(($ec) => {
          if (!$ec) return res.send({ _id: undefined, name: undefined });
          delete $ec.password;
          return res.send($ec);
        });
      }
    });
  });
  Server.get("/clan/list", (req, res) => {
    MainDB.clans.find().on(($ec) => {
      if (!$ec) return res.send({ message: "FAIL" });
      else {
        for (let i in $ec) delete $ec[i].password;
        return res.send({ list: $ec });
      }
    });
  });
  Server.post("/report", (req, res) => {
    if (!req.body.target) return res.send({ error: 404 });
    else if (!req.body.submitter) return res.send({ error: 404 });
    else if (!req.body.reason) return res.send({ error: 404 });
    const target = req.body.target;
    const submitter = req.body.submitter;
    const reason = req.body.reason;
    const date = moment().format("YYYY_MM_DD_HH_mm");

    fs.writeFileSync(
      `./lib/Web/report/${target}_${date}.json`,
      JSON.stringify({ target, submitter, date, reason, compt: false }),
      "utf8",
      (err) => {
        if (err) return res.send({ error: 404 });
      }
    );
  });
  Server.post("/inquire", (req, res) => {
    if (!req.body.inquirer) return res.send({ error: 404 });

    const date = moment().format("YYYY_MM_DD_HH_mm");
    const data = {
      inquiry: {
        submitter: req.body.inquirer || req.body.sender,
        nickname: req.body.nickname,
        date: date,
        title: req.body.title,
        body: req.body.data,
      },
      answer: {
        answered: false,
        submitter: "",
        nickname: "",
        date: "",
        body: "",
      },
    };

    fs.writeFileSync(
      `./lib/Web/inquire/${req.body.inquirer}_${date}.json`,
      JSON.stringify(data),
      "utf8",
      (err) => {
        if (err) return res.send({ error: 404 });
      }
    );
    return res.send({ result: 200 });
  });
  Server.get("/inquire", async (req, res) => {
    const mine = [];
    const inquiries = [];
    async function* asyncGenerator(num) {
      let i = 0;
      while (i < num) {
        yield i++;
      }
    }
    await getDirectories("./lib/Web/inquire", async (err, files) => {
      for await (let i of asyncGenerator(files.length)) {
        if (files[i].includes(req.query.id)) {
          mine.push(files[i]);
        } else continue;
      }
    });
    for await (let i of asyncGenerator(mine.length)) {
      inquiries.push(fs.readFileSync(`./lib/Web/inquire/${mine[i]}`, "utf8"));
    }
    return res.send(inquiries);
  });
  Server.post("/warn", (req, res) => {
    if (!req.body.target) return res.send({ error: 404 });
    else if (!req.body.warn) return res.send({ error: 404 });

    const target = req.body.target;
    const warn = Number(req.body.warn);

    MainDB.users.findOne(["_id", target]).on(($user) => {
      if (!$user) return res.send({ error: 404 });
      else if (!$user.bandate) return res.send({ error: 404 });
      else if (!$user.warn) return res.send({ error: 404 });
      else if ($user.warn + warn >= 4) {
        MainDB.users.update(["_id", target]).set(["warn", 0]).on();
        MainDB.users.update(["_id", target]).set(["black", "경고 누적"]).on();
        MainDB.users
          .update(["_id", target])
          .set(["bandate", 99999999999999])
          .on();
      } else {
        MainDB.users
          .update(["_id", target])
          .set(["warn", Number($user.warn) + warn])
          .on();
      }
    });
  });
  Server.get("/getwarn", (req, res) => {
    if (!req.query.target) return res.send({ error: 404 });

    const target = req.query.target;

    MainDB.users.findOne(["_id", target]).on(($user) => {
      if (!$user) return res.send({ error: 404 });
      else if (!$user.warn) return res.send({ error: 404 });
      else return res.send({ message: $user.warn });
    });
  });
  Server.get("/getid", (req, res) => {
    if (!req.query.target) return res.send({ error: 404 });

    const target = req.query.target;

    MainDB.users.findOne(["nickname", target]).on(($user) => {
      if (!$user) return res.send({ error: 404 });
      else if (!$user._id) return res.send({ error: 404 });
      else return res.send({ id: $user._id });
    });
  });
  Server.get("/injeong/:word", (req, res) => {
    if (!req.session.profile) return res.send({ error: 402 });

    const word = req.params.word;
    const theme = req.query.theme;
    const now = Date.now();

    if (now - req.session.injBefore < 2000) return res.send({ error: 429 });
    req.session.injBefore = now;

    MainDB.kkutu["ko"]
      .findOne(["_id", word.replace(/[^가-힣0-9]/g, "")])
      .on(($word) => {
        if ($word) return res.send({ error: 409 });
        MainDB.kkutu_injeong.findOne(["_id", word]).on(($ij) => {
          if ($ij) {
            if ($ij.theme == "~") return res.send({ error: 406 });
            else return res.send({ error: 403 });
          }
          Web.get("https://namu.moe/w/" + encodeURI(word), (err, _res) => {
            if (err) return res.send({ error: 400 });
            else if (_res.statusCode != 200) return res.send({ error: 405 });
            MainDB.kkutu_injeong
              .insert(
                ["_id", word],
                ["theme", theme],
                ["createdAt", now],
                ["writer", req.session.profile.id]
              )
              .on(($res) => {
                res.send({ message: "OK" });
              });
          });
        });
      });
  });
  Server.get("/cf/:word", (req, res) => {
    res.send(
      getCFRewards(
        req.params.word,
        Number(req.query.l || 0),
        req.query.b == "1",
        req.query.e
      )
    );
  });
  Server.get("/shop", (req, res) => {
    MainDB.kkutu_shop
      .find()
      .limit(
        ["cost", true],
        ["term", true],
        ["group", true],
        ["options", true],
        ["updatedAt", true]
      )
      .on(($goods) => {
        res.json({ goods: $goods });
      });
    // res.json({ error: 555 });
  });
  Server.get("/validation/inventory", async (req, res) => {
    const userInventory = (
      await translateToPromise(MainDB.users.findOne(["_id", req.query.id]))
    ).box;
    const shopList = await translateToPromise(MainDB.kkutu_shop.find());
    const shopItems = [];

    for (let i of shopList) {
      shopItems.push(i._id);
    }
    for (let i in userInventory) {
      if (i.includes("WPC")) continue;
      if (!shopItems.includes(i)) delete userInventory[i];
    }
    MainDB.users
      .update(["_id", req.query.id])
      .set(["box", userInventory])
      .on(() => {
        return res.sendStatus(200);
      });
  });
  Server.get("/from", (req, res) => {
    MainDB.statistics.findOne(["url", "every"]).on(($data) => {
      MainDB.statistics
        .update(["url", "every"])
        .set([req.query.loc, Number($data[req.query.loc]) + 1])
        .on();
    });
    MainDB.statistics.findOne(["url", req.query.from]).on(($data) => {
      if (!$data || $data == null)
        MainDB.statistics
          .insert(["url", req.query.from], [req.query.loc, 1])
          .on();
      else
        MainDB.statistics
          .update(["url", req.query.from])
          .set([req.query.loc, Number($data[req.query.loc]) + 1])
          .on();
    });
    return res.sendStatus(200);
  });

  // POST
  Server.post("/profile", (req, res) => {
    let nickname = req.body.nickname;
    let exordial = req.body.exordial;

    if (req.session.profile) {
      if (exordial || exordial === "") {
        if (exordial.length > 100) exordial = exordial.slice(0, 100);
        MainDB.users
          .update(["_id", req.session.profile.id])
          .set(["exordial", exordial])
          .on();
      }

      if (nickname) {
        if (nickname.length > 14) nickname = nickname.slice(0, 14);
        MainDB.users.findOne(["nickname", nickname]).on((data) => {
          if (data) return res.send({ error: 465 });
          else {
            MainDB.nicknameLog
              .insert(
                ["_id", req.session.profile.id],
                ["prev", req.session.profile.nickname],
                ["new", nickname],
                ["at", new Date()]
              )
              .on();
            MainDB.users
              .update(["_id", req.session.profile.id])
              .set(["nickname", nickname])
              .on();
            MainDB.session
              .update(["_id", req.session.id])
              .set(["nickname", nickname])
              .on();
            return res.send({ result: 200 });
          }
        });
      }

      if (!nickname) return res.send({ result: 200 });
    } else return res.send({ error: 400 });
  });
  Server.post("/request/word", (req, res) => {
    Bot.wordReq(req.body.submitter, req.body.theme, req.body.list);
    return res.sendStatus(200);
  });

  Server.post("/buy/:id", (req, res) => {
    if (req.session.profile) {
      const uid = req.session.profile.id;
      const gid = req.params.id;

      MainDB.kkutu_shop.findOne(["_id", gid]).on(($item) => {
        if (!$item) return res.json({ error: 400 });
        if ($item.cost < 0) return res.json({ error: 400 });
        MainDB.users
          .findOne(["_id", uid])
          .limit(["money", true], ["box", true])
          .on(($user) => {
            if (!$user) return res.json({ error: 400 });
            if (!$user.box) $user.box = {};
            var postM = $user.money - $item.cost;

            if (postM < 0) return res.send({ result: 400 });

            obtain($user, gid, 1, $item.term);
            MainDB.users
              .update(["_id", uid])
              .set(["money", postM], ["box", $user.box])
              .on(($fin) => {
                res.send({
                  result: 200,
                  money: postM,
                  box: $user.box,
                });
                JLog.log("[PURCHASED] " + gid + " by " + uid);
              });
            // HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
            MainDB.kkutu_shop
              .update(["_id", gid])
              .set(["hit", $item.hit + 1])
              .on();
          });
      });
    } else res.json({ error: 423 });
  });
  Server.post("/equip/:id", (req, res) => {
    if (!req.session.profile) return res.json({ error: 400 });

    const uid = req.session.profile.id;
    const gid = req.params.id;
    const isLeft = req.body.isLeft == "true";
    const now = Date.now() * 0.001;

    MainDB.users
      .findOne(["_id", uid])
      .limit(["box", true], ["equip", true])
      .on(($user) => {
        if (!$user) return res.json({ error: 400 });
        if (!$user.box) $user.box = {};
        if (!$user.equip) $user.equip = {};

        const q = $user.box[gid];
        let r;

        MainDB.kkutu_shop
          .findOne(["_id", gid])
          .limit(["group", true])
          .on(($item) => {
            if (!$item) return res.json({ error: 430 });
            if (!Const.AVAIL_EQUIP.includes($item.group))
              return res.json({ error: 400 });

            let part = $item.group;
            if (part.substr(0, 3) == "BDG") part = "BDG";
            if (part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
            const qid = $user.equip[part];

            if (qid) {
              r = $user.box[qid];
              if (r && r.expire) {
                obtain($user, qid, 1, r.expire, true);
              } else {
                obtain($user, qid, 1, now + $item.term, true);
              }
            }
            if (qid == $item._id) {
              delete $user.equip[part];
            } else {
              if (!q) return res.json({ error: 430 });
              consume($user, gid, 1);
              $user.equip[part] = $item._id;
            }
            MainDB.users
              .update(["_id", uid])
              .set(["box", $user.box], ["equip", $user.equip])
              .on(($res) => {
                res.send({
                  result: 200,
                  box: $user.box,
                  equip: $user.equip,
                });
              });
          });
      });
  });
  Server.post("/payback/:id", (req, res) => {
    if (!req.session.profile) return res.json({ error: 400 });
    const uid = req.session.profile.id;
    const gid = req.params.id;
    const isDyn = gid.charAt() == "$";

    MainDB.users
      .findOne(["_id", uid])
      .limit(["money", true], ["box", true])
      .on(($user) => {
        if (!$user) return res.json({ error: 400 });
        if (!$user.box) $user.box = {};
        var q = $user.box[gid];

        if (!q) return res.json({ error: 430 });
        MainDB.kkutu_shop
          .findOne(["_id", isDyn ? gid.slice(0, 4) : gid])
          .limit(["cost", true])
          .on(($item) => {
            if (!$item) return res.json({ error: 430 });

            consume($user, gid, 1, true);
            $user.money =
              Number($user.money) + Math.round(0.2 * Number($item.cost));
            MainDB.users
              .update(["_id", uid])
              .set(["money", $user.money], ["box", $user.box])
              .on(($res) => {
                res.send({
                  result: 200,
                  box: $user.box,
                  money: $user.money,
                });
              });
          });
      });
  });
  Server.post("/cf", (req, res) => {
    if (!req.session.profile) return res.json({ error: 400 });
    const uid = req.session.profile.id;
    const tray = (req.body.tray || "").split("|");
    let o;

    if (tray.length < 1 || tray.length > 6) return res.json({ error: 400 });
    MainDB.users
      .findOne(["_id", uid])
      .limit(["money", true], ["box", true])
      .on(($user) => {
        if (!$user) return res.json({ error: 400 });
        if (!$user.box) $user.box = {};

        const req = {};
        const gain = [];
        let blend;
        let event;
        let word = "";
        let level = 0;
        let cfr;

        for (let i in tray) {
          if (tray[i].includes("$WPE")) event = true;
          else if (event) return res.json({ error: 461 });
          word += tray[i].slice(4);
          level += 68 - tray[i].charCodeAt(3);
          req[tray[i]] = (req[tray[i]] || 0) + 1;
          if (($user.box[tray[i]] || 0) < req[tray[i]])
            return res.json({ error: 434 });
        }
        MainDB.kkutu[parseLanguage(word)].findOne(["_id", word]).on(($dic) => {
          if (!$dic && !event) {
            if (word.length == 3) {
              blend = true;
            } else return res.json({ error: 404 });
          }
          //if(!blend && event && !$dic.theme.includes("NLD")) return res.json({ error: 462 });
          cfr = getCFRewards(word, level, blend, event);
          if ($user.money < cfr.cost) return res.json({ error: 407 });
          for (i in req) consume($user, i, req[i]);
          for (i in cfr.data) {
            o = cfr.data[i];

            if (Math.random() >= o.rate) continue;
            if (o.key.charAt(4) == "?") {
              o.key =
                o.key.slice(0, 4) +
                (blend
                  ? blendWord(word)
                  : word.charAt(Math.floor(Math.random() * word.length)));
            }
            obtain($user, o.key, o.value, o.term);
            gain.push(o);
          }
          $user.money -= cfr.cost;
          MainDB.users
            .update(["_id", uid])
            .set(["money", $user.money], ["box", $user.box])
            .on(($res) => {
              res.send({
                result: 200,
                box: $user.box,
                money: $user.money,
                gain: gain,
              });
            });
        });
      });
  });
  Server.get("/dict/:word", (req, res) => {
    const word = req.params.word;
    const lang = req.query.lang;
    const DB = MainDB.kkutu[lang];

    if (!DB) return res.send({ error: 400 });
    if (!DB.findOne) return res.send({ error: 400 });
    DB.findOne(["_id", word]).on(($word) => {
      if (!$word) return res.send({ error: 404 });
      res.send({
        word: $word._id,
        mean: $word.mean,
        theme: $word.theme,
        type: $word.type,
      });
    });
  });

  Server.get("/record", async (req, res) => {
    let { id } = req.session.profile;

    if (req.query.nickname) {
      const $user = await translateToPromise(
        MainDB.users.findOne(["nickname", req.query.nickname])
      );
      if (!$user) return res.send({ error: 404 });
      id = $user._id;
    }

    MainDB.record
      .find(["players", new RegExp(`(${id})`)])
      .limit(7)
      .sort(["time", 0])
      .on(($records) => res.send($records));
  });
};
