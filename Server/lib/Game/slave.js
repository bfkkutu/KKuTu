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

const WebSocket = require("ws");
const fs = require("fs");
const Const = require("../const");
const https = require("https");
const secure = require("../sub/secure");
const Master = require("./master");
const KKuTu = require("./kkutu");
const MainDB = require("../Web/db");
const JLog = require("../sub/jjlog");

let GLOBAL = require("../sub/global.json");

let Server;
let HTTPS_Server;

if (GLOBAL.IS_SECURED) {
  const options = secure();
  HTTPS_Server = https
    .createServer(options)
    .listen(global.test ? Const.TEST_PORT + 416 : process.env["KKUTU_PORT"]);
  Server = new WebSocket.Server({ server: HTTPS_Server });
} else {
  Server = new WebSocket.Server({
    port: global.test ? Const.TEST_PORT + 416 : process.env["KKUTU_PORT"],
    perMessageDeflate: false,
  });
}

const DIC = {};
const DNAME = {};
const ROOM = {};
const RESERVED = {};
const CHAN = process.env["CHANNEL"];
const DEVELOP = Master.DEVELOP;
const GUEST_PERMISSION = Master.GUEST_PERMISSION;
const ENABLE_ROUND_TIME = Master.ENABLE_ROUND_TIME;
const ENABLE_FORM = Master.ENABLE_FORM;
const MODE_LENGTH = Master.MODE_LENGTH;

JLog.info(`<< KKuTu Server:${Server.options.port} >>`);

process.on("uncaughtException", (err) => {
  const text = `:${
    process.env["KKUTU_PORT"]
  } [${new Date().toLocaleString()}] ERROR: ${err.toString()}\n${err.stack}`;

  for (let i in DIC) {
    DIC[i].send("dying");
  }
  fs.appendFile("../KKUTU_ERROR.log", text, (res) => {
    JLog.error(`ERROR OCCURRED! This worker will die in 10 seconds.`);
    console.log(text);
  });
  setTimeout(() => {
    process.exit();
  }, 10000);
});
process.on("message", (msg) => {
  switch (msg.type) {
    case "invite-error": {
      if (!DIC[msg.target]) break;
      DIC[msg.target].sendError(msg.code);
      break;
    }
    case "room-reserve": {
      if (RESERVED[msg.session]) {
        // 이미 입장 요청을 했는데 또 하는 경우
        break;
      } else
        RESERVED[msg.session] = {
          profile: msg.profile,
          room: msg.room,
          spectate: msg.spectate,
          joinWhileGaming: msg.joinWhileGaming,
          password: msg.password,
          _expiration: setTimeout(
            (tg, create) => {
              process.send({
                type: "room-expired",
                id: msg.room.id,
                create: create,
              });
              delete RESERVED[tg];
            },
            10000,
            msg.session,
            msg.create
          ),
        };
      break;
    }
    case "room-invalid": {
      delete ROOM[msg.room.id];
      break;
    }
    default:
      JLog.warn(`Unhandled IPC message type: ${msg.type}`);
  }
});
MainDB.ready = () => {
  JLog.success("DB is ready.");
  KKuTu.init(MainDB, DIC, ROOM, GUEST_PERMISSION);
};
Server.on("connection", (socket, info) => {
  const chunk = info.url.slice(1).split("&");
  const key = chunk[0];
  const reserve = RESERVED[key] || {};
  let room;

  socket.on("error", (err) => {
    JLog.warn("Error on #" + key + " on ws: " + err.toString());
  });
  if (CHAN != Number(chunk[1])) {
    JLog.warn(`Wrong channel value ${chunk[1]} on @${CHAN}`);
    socket.close();
    return;
  }
  if ((room = reserve.room)) {
    if (room._create) {
      room._id = room.id;
      delete room.id;
    }
    clearTimeout(reserve._expiration);
    delete reserve._expiration;
    delete RESERVED[key];
  } else {
    JLog.warn(`Not reserved from ${key} on @${CHAN}`);
    socket.close();
    return;
  }
  MainDB.session
    .findOne(["_id", key])
    .limit(["profile", true])
    .on(($body) => {
      const $c = new KKuTu.Client(socket, $body ? $body.profile : null, key);
      $c.admin = GLOBAL.ADMIN.indexOf($c.id) != -1;

      if (DIC[$c.id]) {
        DIC[$c.id].send("error", { code: 408 });
        DIC[$c.id].socket.close();
      }
      if (DEVELOP && !Const.TESTER.includes($c.id)) {
        $c.send("error", { code: 500 });
        $c.socket.close();
        return;
      }
      $c.refresh().then((ref, ip, path) => {
        if (ref.result == 200) {
          DIC[$c.id] = $c;
          DNAME[($c.profile.title || $c.profile.name).replace(/\s/g, "")] =
            $c.id;

          $c.enter(
            room,
            reserve.password,
            reserve.spectate,
            reserve.joinWhileGaming
          );
          if ($c.place == room.id) {
            $c.publish("connRoom", {
              user: $c.getData(),
              joinWhileGaming: reserve.joinWhileGaming,
            });
          } else {
            // 입장 실패
            $c.socket.close();
          }
          JLog.info(`Chan @${CHAN} New #${$c.id}`);
        } else {
          $c.send("error", {
            code: ref.result,
            message: ref.black,
          });
          $c._error = ref.result;
          $c.socket.close();
        }
      });
    });
});
Server.on("error", (err) => {
  JLog.warn("Error on ws: " + err.toString());
});
KKuTu.onClientMessage = ($c, msg) => {
  let temp;

  if (!msg) return;

  switch (msg.type) {
    case "drawingCanvas": {
      $c.drawingCanvas(msg);
    }
    case "yell": {
      if (!msg.value) return;
      if (!$c.admin) return;

      $c.publish("yell", { value: msg.value });
      break;
    }
    case "updateProfile": {
      $c.nickname = msg.nickname;
      $c.exordial = msg.exordial;
      KKuTu.publish("updateProfile", msg);
      $c.updateProfile(msg.nickname, msg.exordial);
      $c.send("updateData", {
        id: $c.id,
        guest: $c.guest,
        box: $c.box,
        nickname: $c.nickname,
        exordial: $c.exordial,
        playTime: $c.data.playTime,
        rankPoint: $c.data.rankPoint,
        okg: $c.okgCount,
        careful: $c.careful, // 주의
        chatFreeze: chatFreeze,
        users: KKuTu.getUserList(),
        rooms: KKuTu.getRoomList(),
        friends: $c.friends,
        admin: $c.admin,
        test: global.test,
        caj: $c._checkAjae,
      });
      break;
    }
    case "updateData": {
      $c.send("updateData", {
        id: $c.id,
        guest: $c.guest,
        box: $c.box,
        nickname: $c.nickname,
        exordial: $c.exordial,
        playTime: $c.data.playTime,
        rankPoint: $c.data.rankPoint,
        okg: $c.okgCount,
        careful: $c.careful, // 주의
        chatFreeze: chatFreeze,
        users: KKuTu.getUserList(),
        rooms: KKuTu.getRoomList(),
        friends: $c.friends,
        admin: $c.admin,
        test: global.test,
        caj: $c._checkAjae,
      });
      break;
    }
    case "refresh": {
      $c.refresh();
      break;
    }
    case "wsrefresh": {
      $c.refresh();
      break;
    }
    case "talk": {
      if (!msg.value) return;
      if (!msg.value.substr) return;
      if (!GUEST_PERMISSION.talk)
        if ($c.guest) {
          $c.send("error", { code: 401 });
          return;
        }
      msg.value = msg.value.substr(0, 200);
      if (msg.relay) {
        if ($c.subPlace) temp = $c.pracRoom;
        else if (!(temp = ROOM[$c.place])) return;
        if (!temp.gaming) return;
        if (temp.game.late) {
          $c.chat(msg.value);
        } else if (!temp.game.loading) {
          temp.submit($c, msg.value, msg.data);
        }
      } else {
        if ($c.admin) {
          if (msg.value.charAt() == "#") {
            process.send({
              type: "admin",
              id: $c.id,
              value: msg.value,
            });
            break;
          }
        }
        if (msg.whisper) {
          process.send({
            type: "tail-report",
            id: $c.id,
            chan: CHAN,
            place: $c.place,
            msg: msg,
          });
          msg.whisper.split(",").forEach((v) => {
            if ((temp = DIC[DNAME[v]])) {
              temp.send("chat", {
                from: $c.profile.title || $c.profile.name,
                profile: $c.profile,
                value: msg.value,
              });
            } else {
              $c.sendError(424, v);
            }
          });
        } else {
          $c.chat(msg.value);
        }
      }
      break;
    }
    case "item": {
      if (typeof msg != "object") return;
      if (!msg.id) return;

      if ($c.subPlace) temp = $c.pracRoom;
      else if (!(temp = ROOM[$c.place])) return;

      if (
        DIC[$c.id].game.item[msg.id].limit ==
        DIC[$c.id].game.item[msg.id].count++
      )
        return;

      temp.submit($c, "item", {
        id: msg.id,
        user: { id: $c.id, nickname: $c.nickname },
        ...DIC[$c.id].game.item[msg.id],
      });
      break;
    }
    case "pause": {
      if (typeof msg != "object") return;
      if (!msg.id) return;

      if ($c.subPlace) temp = $c.pracRoom;
      else if (!(temp = ROOM[msg.id])) return;

      temp.pause();
      break;
    }
    case "resume": {
      if (typeof msg != "object") return;
      if (!msg.id) return;

      if ($c.subPlace) temp = $c.pracRoom;
      else if (!(temp = ROOM[msg.id])) return;

      temp.resume();
      break;
    }
    case "enter":
    case "setRoom": {
      let stable = true;

      if (!msg.title) stable = false;
      if (!msg.limit) stable = false;
      if (!msg.round) stable = false;
      if (!msg.time) stable = false;
      if (!msg.opts) stable = false;

      msg.code = false;
      msg.limit = Number(msg.limit);
      msg.mode = Number(msg.mode);
      msg.round = Number(msg.round);
      msg.time = Number(msg.time);

      if (isNaN(msg.limit)) stable = false;
      if (isNaN(msg.mode)) stable = false;
      if (isNaN(msg.round)) stable = false;
      if (isNaN(msg.time)) stable = false;

      if (stable) {
        if (msg.title.length > 20) stable = false;
        if (msg.password.length > 20) stable = false;
        if (msg.limit < 2 || msg.limit > 8) {
          if (!msg.opts.tournament) {
            msg.code = 432;
            stable = false;
          }
        }
        if (
          msg.type != "setRoom" &&
          msg.opts.tournament &&
          $c.id != GLOBAL.MAINADMIN &&
          $c.id != GLOBAL.ESPORTSTMNT
        ) {
          msg.code = 460;
          stable = false;
        }
        if (msg.mode < 0 || msg.mode >= MODE_LENGTH) stable = false;
        if (msg.round < 1 || msg.round > 10) {
          msg.code = 433;
          stable = false;
        }
        if (ENABLE_ROUND_TIME.indexOf(msg.time) == -1) stable = false;
      }
      if (msg.type == "enter") {
        if (msg.id || stable)
          $c.enter(msg, null, msg.spectate, msg.joinWhileGaming);
        else $c.sendError(msg.code || 431);
      } else if (msg.type == "setRoom") {
        if (stable) $c.setRoom(msg);
        else $c.sendError(msg.code || 431);
      }
      break;
    }
    case "leave": {
      if (!$c.place) return;

      $c.leave();
      break;
    }
    case "ready": {
      if (!$c.place) return;
      if (!GUEST_PERMISSION.ready) if ($c.guest) return;

      $c.toggle();
      break;
    }
    case "start": {
      if (!$c.place) return;
      if (!ROOM[$c.place]) return;
      if (ROOM[$c.place].gaming) return;
      if (!GUEST_PERMISSION.start) if ($c.guest) return;

      $c.start();
      break;
    }
    case "practice": {
      if (!ROOM[$c.place]) return;
      if (ROOM[$c.place].gaming) return;
      if (!GUEST_PERMISSION.practice) if ($c.guest) return;
      if (isNaN((msg.level = Number(msg.level)))) return;
      if (ROOM[$c.place].rule.ai) {
        if (msg.level < 0 || msg.level >= 5) return;
      } else if (msg.level != -1) return;

      $c.practice(msg.level);
      break;
    }
    case "invite": {
      if (!ROOM[$c.place]) return;
      if (ROOM[$c.place].gaming) return;
      if (ROOM[$c.place].master != $c.id) return;
      if (!GUEST_PERMISSION.invite) if ($c.guest) return;
      if (msg.target == "AI") {
        ROOM[$c.place].addAI($c);
      } else {
        process.send({
          type: "invite",
          id: $c.id,
          place: $c.place,
          target: msg.target,
        });
      }
      break;
    }
    case "inviteRes": {
      if (!(temp = ROOM[msg.from])) return;
      if (!GUEST_PERMISSION.inviteRes) if ($c.guest) return;
      if (msg.res) {
        $c.enter({ id: msg.from }, true, false, false);
      } else {
        if (DIC[temp.master])
          DIC[temp.master].send("inviteNo", { target: $c.id });
      }
      break;
    }
    case "form": {
      if (!msg.mode) return;
      if (!ROOM[$c.place]) return;
      if (ENABLE_FORM.indexOf(msg.mode) == -1) return;

      $c.setForm(msg.mode);
      break;
    }
    case "team": {
      if (!ROOM[$c.place]) return;
      if (ROOM[$c.place].gaming) return;
      if ($c.ready) return;
      if (isNaN((temp = Number(msg.value)))) return;
      if (temp < 0 || temp > 4) return;

      $c.setTeam(Math.round(temp));
      break;
    }
    case "kick": {
      if (!msg.robot) if (!(temp = DIC[msg.target])) return;
      if (!ROOM[$c.place]) return;
      if (ROOM[$c.place].gaming) return;
      if (!msg.robot) if ($c.place != temp.place) return;
      if (ROOM[$c.place].master != $c.id) return;
      if (ROOM[$c.place].kickVote) return;
      if (!GUEST_PERMISSION.kick) if ($c.guest) return;

      if (msg.robot) $c.kick(null, msg.target);
      else $c.kick(msg.target);
      break;
    }
    case "kickVote": {
      if (!(temp = ROOM[$c.place])) return;
      if (!temp.kickVote) return;
      if ($c.id == temp.kickVote.target) return;
      if ($c.id == temp.master) return;
      if (temp.kickVote.list.indexOf($c.id) != -1) return;
      if (!GUEST_PERMISSION.kickVote) if ($c.guest) return;

      $c.kickVote($c, msg.agree);
      break;
    }
    case "handover": {
      if (!DIC[msg.target]) return;
      if (!(temp = ROOM[$c.place])) return;
      if (temp.gaming) return;
      if ($c.place != DIC[msg.target].place) return;
      if (temp.master != $c.id) return;

      temp.master = msg.target;
      temp.export();
      break;
    }
    case "wp": {
      if (!msg.value) return;
      if (!GUEST_PERMISSION.wp)
        if ($c.guest) {
          $c.send("error", { code: 401 });
          return;
        }

      msg.value = msg.value.substr(0, 200);
      msg.value = msg.value.replace(/[^a-z가-힣]/g, "");
      if (msg.value.length < 2) return;
      break;
    }
    case "setAI": {
      if (!msg.target) return;
      if (!ROOM[$c.place]) return;
      if (ROOM[$c.place].gaming) return;
      if (ROOM[$c.place].master != $c.id) return;
      if (isNaN((msg.level = Number(msg.level)))) return;
      if (msg.level < 0 || msg.level >= 5) return;
      if (isNaN((msg.team = Number(msg.team)))) return;
      if (msg.team < 0 || msg.team > 4) return;

      ROOM[$c.place].setAI(
        msg.target,
        Math.round(msg.level),
        Math.round(msg.team)
      );
      break;
    }
    default:
      break;
  }
};
KKuTu.onClientClosed = ($c, code) => {
  delete DIC[$c.id];
  if ($c.profile) delete DNAME[$c.profile.title || $c.profile.name];
  if ($c.socket) $c.socket.removeAllListeners();
  KKuTu.publish("disconnRoom", { id: $c.id });

  JLog.alert(`Chan @${CHAN} Exit #${$c.id}`);
};
