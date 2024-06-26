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

const Const = require("../../const");
const Outer = require("../../sub/outer");
const Lizard = require("../../sub/lizard");
let DB;
let DIC;
/* 봇 정보 */
const ROBOT_START_DELAY = [1200, 800, 400, 200, 0];
const ROBOT_TYPE_COEF = [1250, 750, 500, 250, 0];
const ROBOT_THINK_COEF = [4, 2, 1, 0, 0]; /* 생각하는 시간 */
const ROBOT_HIT_LIMIT = [1000]; /* 횟수 제한 */
var ROBOT_LENGTH_LIMIT = [3, 4, 9, 99, 99]; /* 길이 제한 */
/* 두음 법칙 */
const RIEUL_TO_NIEUN = [4449, 4450, 4457, 4460, 4462, 4467]; /* ㄹ - ㄴ */
const RIEUL_TO_IEUNG = [4451, 4455, 4456, 4461, 4466, 4469]; /* ㄹ - ㅇ */
const NIEUN_TO_IEUNG = [4455, 4461, 4466, 4469]; /* ㄴ - ㅇ */

exports.init = function (_DB, _DIC) {
  DB = _DB;
  DIC = _DIC;
};
exports.getTitle = function () {
  var R = new Lizard.Tail();
  var my = this;
  var l = my.rule;
  var EXAMPLE;
  var eng, ja;
  var gamemode = Const.GAME_TYPE[my.mode];

  if (!l) {
    R.go("undefinedd");
    return R;
  }
  if (!l.lang) {
    R.go("undefinedd");
    return R;
  }
  EXAMPLE = Const.EXAMPLE_TITLE[l.lang];
  my.game.dic = {};
  my.game.endWords = [];

  switch (gamemode) {
    case "EUT":
    case "ERH":
    case "ESH":
      eng = "^" + String.fromCharCode(97 + Math.floor(Math.random() * 26));
      break;
    case "EAP":
      eng = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + "$";
      break;
    case "KLH":
      my.game.wordLength = my.wordLimit;
      ja = 44032 + 588 * Math.floor(Math.random() * 18);
      eng = "^[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
      break;
    case "KKT":
    case "KRK":
    case "EKT":
      my.game.wordLength = gamemode == "EKT" ? 4 : 3;
    case "KUT":
    case "KRH":
    case "KMH":
    case "KSH":
      ja = 44032 + 588 * Math.floor(Math.random() * 18);
      eng = "^[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
      break;
    case "KAP":
      ja = 44032 + 588 * Math.floor(Math.random() * 18);
      eng = "[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
      break;
  }
  function tryTitle(h) {
    if (h > 50) {
      R.go(EXAMPLE);
      return;
    }
    DB.kkutu[l.lang]
      .find(
        ["_id", new RegExp(eng + ".{" + Math.max(1, my.round - 1) + "}$")],
        // [ 'hit', { '$lte': h } ],
        l.lang == "ko" ? ["type", Const.KOR_GROUP] : ["_id", Const.ENG_ID]
        // '$where', eng+"this._id.length == " + Math.max(2, my.round) + " && this.hit <= " + h
      )
      .limit(20)
      .on(function ($md) {
        var list;

        if ($md.length) {
          list = shuffle($md);
          checkTitle(list.shift()._id).then(onChecked);

          function onChecked(v) {
            if (v) R.go(v);
            else if (list.length) checkTitle(list.shift()._id).then(onChecked);
            else R.go(EXAMPLE);
          }
        } else {
          tryTitle(h + 10);
        }
      });
  }
  function checkTitle(title) {
    var R = new Lizard.Tail();
    var i,
      list = [];
    var len;

    /* 부하가 너무 걸린다면 주석을 풀자.
		R.go(true);
		return R;
		*/
    if (title == null) {
      R.go(EXAMPLE);
    } else {
      len = title.length;
      if (!my.opts.ignoreinitial) {
        for (i = 0; i < len; i++)
          list.push(
            getAuto.call(
              my,
              my.game.theme,
              title[i],
              getSubChar.call(my, title[i]),
              1
            )
          );
      } else if (my.opts.ignoreinitial) {
        for (i = 0; i < len; i++)
          list.push(getAuto.call(my, my.game.theme, title[i], 1));
      }
      Lizard.all(list).then(function (res) {
        for (i in res) if (!res[i]) return R.go(EXAMPLE);

        return R.go(title);
      });
    }
    return R;
  }
  tryTitle(10);

  return R;
};
exports.roundReady = function () {
  var my = this;
  if (!my.game.title) return;

  my.game.robotChain = [];
  my.game.history = {};

  clearTimeout(my.game.turnTimer);
  my.game.round++;
  my.game.roundTime = my.time * 1000;
  if (my.game.round <= my.round) {
    if (my.opts.injpick.length > 0) {
      // injpick은 무조건 존재하므로 존재 여부 말고 길이로 유효성을 판단함
      var ijl = my.opts.injpick.length;
      my.game.theme = my.opts.injpick[Math.floor(Math.random() * ijl)];
    } else my.game.theme = false;
    if (Const.RULE[Const.GAME_TYPE[my.mode]].randomChar)
      my.game.char = my.game.title[Math.floor(Math.random() * my.round)];
    else my.game.char = my.game.title[my.game.round - 1];
    if (!my.opts.ignoreinitial) {
      my.game.subChar = getSubChar.call(my, my.game.char);
    } else if (my.opts.ignoreinitial) {
      my.game.subChar = null;
    }

    if (my.game.round === 1) my.game.chain = [];
    else my.game.endWords.push(my.game.chain[my.game.chain.length - 1]);

    if (!my.opts.ogow) my.game.chain = []; // RESET

    if (my.opts.mission)
      if (my.opts.moremission)
        my.game.mission = getMission(my.rule.lang, "more");
      else if (my.opts.randommission)
        my.game.mission = getMission(my.rule.lang, "random");
      else my.game.mission = getMission(my.rule.lang, "normal");

    if (my.opts.blockword) my.game.blockWord = getBlockWord(my.rule.lang);

    if (my.opts.sami) my.game.wordLength = 2;

    my.byMaster(
      "roundReady",
      {
        round: my.game.round,
        wordLimit: my.game.wordLimit,
        char: my.game.char,
        subChar: my.game.subChar,
        theme: my.game.theme,
        mission: my.game.mission,
        blockWord: my.game.blockWord,
      },
      true
    );
    my.game.turnTimer = setTimeout(my.turnStart, 2400);
  } else my.roundEnd();
};
exports.turnStart = function (force) {
  var my = this;
  var speed;
  var si;

  if (!my.game.chain) return;

  my.game.roundTime = Math.min(
    my.game.roundTime,
    Math.max(10000, 600000 - my.game.chain.length * 1500)
  );
  speed = my.getTurnSpeed(my.game.roundTime);
  clearTimeout(my.game.turnTimer);
  clearTimeout(my.game.robotTimer);
  my.game.late = false;
  my.game.turnTime = 15000 - 1400 * speed;
  my.game.turnAt = new Date().getTime();
  if (my.opts.sami) my.game.wordLength = my.game.wordLength == 3 ? 2 : 3;

  //if(my.game.chain.length && Const.GAME_TYPE[my.mode] === "KRH") my.game.char = my.game.chain[my.game.chain.length - 1][(Math.floor(Math.random() * my.game.chain[my.game.chain.length - 1].length))];
  if (
    my.game.chain.length &&
    my.game.chain[my.game.chain.length - 1].length > 2 &&
    Const.RULE[Const.GAME_TYPE[my.mode]].randomChar
  )
    my.game.char = my.game.chain[my.game.chain.length - 1][my.game.randomChar];

  if (
    my.game.chain.length &&
    my.game.chain[my.game.chain.length - 1].length > 2 &&
    Const.GAME_TYPE[my.mode] === "KMH"
  )
    my.game.char = my.game.chain[my.game.chain.length - 1][my.game.middleChar];

  if (my.game.chain.length && my.game.middleToss)
    if (my.game.mtp) my.game.char = my.game.chain[my.game.chain.length - 1][1];

  if (my.opts.blockword) my.game.blockWord = getBlockWord(my.rule.lang);

  my.byMaster(
    "turnStart",
    {
      turn: my.game.turn,
      char: my.game.char,
      subChar: my.game.subChar,
      speed: speed,
      roundTime: my.game.roundTime,
      turnTime: my.game.turnTime,
      mission: my.game.mission,
      blockWord: my.game.blockWord,
      wordLength: my.game.wordLength,
      wordLimit: my.game.wordLimit,
      seq: force ? my.game.seq : undefined,
    },
    true
  );
  my.game.turnTimer = setTimeout(
    my.turnEnd,
    Math.min(my.game.roundTime, my.game.turnTime + 100)
  );
  if ((si = my.game.seq[my.game.turn]))
    if (si.robot) {
      //si._done = [];
      my.readyRobot(si);
    }
};
exports.turnEnd = function () {
  var my = this;
  var target;
  var score;

  if (!my.game.seq) return;
  target = DIC[my.game.seq[my.game.turn]] || my.game.seq[my.game.turn];

  if (my.game.loading) {
    my.game.turnTimer = setTimeout(my.turnEnd, 100);
    return;
  }
  my.game.late = true;
  if (target)
    if (target.game) {
      score = Outer.getPenalty(my.game.chain, target.game.score);
      target.game.score += score;
    }
  getAuto
    .call(my, my.game.theme, my.game.char, my.game.subChar, 0)
    .then(function (w) {
      my.byMaster(
        "turnEnd",
        {
          ok: false,
          target: target ? target.id : null,
          score: score,
          hint: w,
        },
        true
      );
      my.game._rrt = setTimeout(my.roundReady, 3000);
    });
  clearTimeout(my.game.robotTimer);
};
exports.submit = function (client, text, item) {
  var score, l, t;
  var my = this;
  var tv = new Date().getTime();
  var mgt = my.game.seq[my.game.turn];

  if (!mgt) return;
  if (!mgt.robot) if (mgt != client.id) return;
  if (!my.game.char) return;

  if (item) {
    let data = { nickname: item.user.nickname };
    let isApproved = true;
    switch (item.id) {
      case "turnSkip": {
        if (my.game.late) return;
        if (!my.game.chain) return;
        /*if (my.game.skipped) {
          DIC[item.user.id].game.item.turnSkip.count--;
          client.publish("alreadySkipped", {});
          isApproved = false;
          return;
        }*/

        my.game.skipped = true;
        my.game.loading = false;
        my.game.late = true;
        clearTimeout(my.game.turnTimer);
        t = tv - my.game.turnAt;
        my.game.roundTime -= t;
        client.publish(
          "turnEnd",
          {
            ok: true,
            value: item,
            score: 0,
            bonus: 0,
          },
          true
        );
        my.game.nextTimer = setTimeout(my.turnNext, my.game.turnTime / 6);
        break;
      }
      case "changeMission": {
        if (my.opts.moremission)
          my.game.mission = getMission(my.rule.lang, "more");
        else if (my.opts.randommission)
          my.game.mission = getMission(my.rule.lang, "random");
        else my.game.mission = getMission(my.rule.lang, "normal");

        data.mission = my.game.mission;
        break;
      }
      case "reverse": {
        my.game.reversed = !my.game.reversed;
        break;
      }
      case "jump": {
        my.game.jump = true;
        data.next = my.game.reversed
          ? my.game.seq[(my.game.turn || my.game.seq.length) - 1]
          : my.game.seq[(my.game.turn + 1) % my.game.seq.length];
        break;
      }
      case "middleToss": {
        // KKT/EKT Only
        if (
          Const.GAME_TYPE[my.mode] != "KKT" &&
          Const.GAME_TYPE[my.mode] != "EKT"
        )
          return;
        my.game.middleToss = true;
      }
    }
    if (isApproved) client.publish(item.id, data);
    return;
  }

  if (!isChainable(text, my.mode, my.game.char, my.game.subChar))
    return client.chat(text);
  if (my.game.chain.indexOf(text) != -1 && !my.opts.returns && !my.opts.history)
    return client.publish("turnError", { code: 409, value: text }, true);
  if (my.opts.twenty && text.length > 20)
    return client.publish("turnError", { code: 415, value: text }, true);
  if (my.opts.bandouble && text.length == 2)
    return client.publish("turnError", { code: 417, value: text }, true);

  l = my.rule.lang;
  my.game.loading = true;
  function onDB($doc) {
    if (!my.game.chain) return;
    var preChar = getChar.call(my, text, my.game.round);
    if (!my.opts.ignoreinitial) {
      var preSubChar = getSubChar.call(my, preChar);
    } else if (my.opts.ignoreinitial) {
      var preSubChar;
    }
    var firstMove = my.game.chain.length < 1;

    function preApproved() {
      function approved() {
        if (my.game.late) return;
        if (!my.game.chain) return;
        if (!my.game.dic) return;

        my.game.skipped = false;
        my.game.loading = false;
        my.game.late = true;
        my.game.middleToss = false;
        clearTimeout(my.game.turnTimer);
        t = tv - my.game.turnAt;
        score = my.getScore(text, t);
        my.game.dic[text] = (my.game.dic[text] || 0) + 1;
        my.game.chain.push(text);
        my.game.roundTime -= t;
        my.game.char = preChar;
        my.game.subChar = preSubChar;
        my.game.history[text] = my.game.chain.length;
        client.game.score += score;
        client.publish(
          "turnEnd",
          {
            ok: true,
            value: text,
            mean: $doc && $doc.mean,
            theme: $doc && $doc.theme,
            wc: $doc && $doc.type,
            score: score,
            bonus: my.game.mission ? score - my.getScore(text, t, true) : 0,
            baby: $doc && $doc.baby,
          },
          true
        );
        if (my.opts.mission && text.includes(my.game.mission))
          my.game.mission = getMission(
            my.rule.lang,
            my.opts.moremission ? "more" : "normal"
          );
        else if (my.opts.randommission)
          my.game.mission = getMission(my.rule.lang, "random");

        if (my.opts.blockword) my.game.blockWord = getBlockWord(my.rule.lang);

        my.game.nextTimer = setTimeout(my.turnNext, my.game.turnTime / 6);
        if (!client.robot) {
          client.invokeWordPiece(text, 1);
          try {
            DB.kkutu[l]
              .update(["_id", text])
              .set(["hit", $doc.hit + 1])
              .on();
          } catch (a) {}
        }
      }
      if (!my.opts.unknownword && (firstMove || my.opts.manner))
        getAuto
          .call(
            my,
            my.game.theme,
            my.game.middleToss ? text[1] /* text[2] */ : preChar,
            preSubChar,
            1
          )
          .then((w) => {
            if (w || my.game.middleToss) approved();
            else {
              my.game.loading = false;
              client.publish(
                "turnError",
                { code: firstMove ? 402 : 403, value: text },
                true
              );
              if (client.robot) {
                //client._done = [];
                my.readyRobot(client);
              }
            }
          });
      else approved();
    }
    function denied(code) {
      my.game.loading = false;
      client.publish("turnError", { code: code || 404, value: text }, true);
    }
    function check_word(word) {
      return word.match(/^[ \-\_0-9A-Za-zぁ-ヾㄱ-ㅣ가-힣]*$/);
    }
    /*function replaceWord(word) {
			if (word.match(/^[ \-\_0-9A-Za-zぁ-ヾㄱ-ㅣ가-힣]*$/)) return word.replace(/^[ \-\_0-9A-Za-zぁ-ヾㄱ-ㅣ가-힣]*$/gi, "");
			return word;
		}*/
    if ($doc) {
      //var gamemode = Const.GAME_TYPE[my.mode];
      if (my.opts.blockword && my.opts.mission) return denied();
      if (my.opts.blockword && text.match(my.game.blockWord))
        return denied(415);
      if (my.opts.history && my.game.chain.length - my.game.history[text] < 5)
        return denied(420);
      //else preApproved();
      if (my.opts.endwords && my.game.endWords.includes(text))
        return denied(419);
      /*if(my.opts.selecttheme){
				if($doc.theme.match(toRegex(my.game.theme)) == null) denied(407);
				else preApproved();
			}else if(my.opts.bantheme){
				if($doc.theme.match(toRegex(my.game.theme)) == null) preApproved();
				else denied(407);
			}else */
      if (
        my.opts.edbpick.length &&
        $doc.type != "INJEONG" &&
        !my.opts.edbpick.includes($doc.type)
      )
        return denied(421);
      if (!my.opts.injeong && $doc.flag & Const.KOR_FLAG.INJEONG)
        return denied();
      //else if(my.opts.strict && (!$doc.type.match(Const.KOR_STRICT) || $doc.flag >= 4)) denied(406);
      //else if(my.opts.loanword && ($doc.flag & Const.KOR_FLAG.LOANWORD)) denied(405);
      else if (my.opts.leng && text.length > my.leng.max) return denied(410);
      else if (my.opts.leng && text.length < my.leng.min) return denied(411);
      //else if(my.opts.noreturn && (((gamemode == 'EUT') && ((text.substr(0,2) == text.substr((text.length-2),2))) || (text.substr(0,3) == text.substr((text.length-3),3))) || ((gamemode != 'EUT') && (text.substr(0,1) == text.substr((text.length-1),1))))) denied(412);
      //else if(my.opts.noreturn && (((gamemode == 'KUT') && ((text.substr(0,2) == text.substr((text.length-2),2))) || (text.substr(0,3) == text.substr((text.length-3),3))) || ((gamemode != 'KUT') && (text.substr(0,1) == text.substr((text.length-1),1))))) denied(412);
      else {
        /*if(my.opts.unknownword) denied(414);
				else */ if (!check_word(text)) return denied(413);
        else preApproved();
      }
    } else {
      /*if(my.opts.unknownword){
				if (check_word(text)) preApproved();
				else denied(413);
			}
			else */ denied();
    }
  }
  function isChainable() {
    var type = Const.GAME_TYPE[my.mode];
    var char = my.game.char,
      subChar = my.game.subChar;
    var l = char.length;

    if (!text) return false;
    if (text.length <= l) return false;
    if (my.game.wordLength && text.length != my.game.wordLength) return false;
    if (type == "KAP" || type == "EAP" || type == "JAP")
      return text.slice(-1) == char || text.slice(-1) == subChar;
    switch (l) {
      case 1:
        return text[0] == char || text[0] == subChar;
      case 2:
        return text.substr(0, 2) == char;
      case 3:
        return text.substr(0, 3) == char || text.substr(0, 2) == char.slice(1);
      default:
        return false;
    }
  }
  DB.kkutu[l]
    .findOne(
      ["_id", text],
      l == "ko"
        ? ["type", Const.KOR_GROUP]
        : l == "en"
        ? ["_id", Const.ENG_ID]
        : ["_id", Const.ENG_ID] // 임시
    )
    .on(onDB);
};
exports.getScore = function (text, delay, ignoreMission) {
  var my = this;
  var tr = 1 - delay / my.game.turnTime;
  var score, arr;

  if (!text || !my.game.chain || !my.game.dic) return 0;
  score = Outer.getPreScore(text, my.game.chain, tr);

  if (my.game.dic[text]) score *= 15 / (my.game.dic[text] + 15);
  if (!ignoreMission)
    if ((arr = text.match(new RegExp(my.game.mission, "g")))) {
      score += score * 0.5 * arr.length;
      if (my.opts.blockword) my.game.blockWord = getBlockWord(my.rule.lang);
    }
  return Math.round(score);
};
exports.readyRobot = function (robot) {
  var my = this;
  var level = robot.level;
  var delay = ROBOT_START_DELAY[level];
  var ended = {};
  var w, text, i;
  var lmax;
  var isRev =
    Const.GAME_TYPE[my.mode] == "KAP" ||
    Const.GAME_TYPE[my.mode] == "EAP" ||
    Const.GAME_TYPE[my.mode] == "JAP";

  if (my.opts.twenty) ROBOT_LENGTH_LIMIT = [3, 4, 9, 20, 20];

  getAuto
    .call(my, my.game.theme, my.game.char, my.game.subChar, 2)
    .then(function (list) {
      if (list.length) {
        list.sort(function (a, b) {
          return b.hit - a.hit;
        });
        if (ROBOT_HIT_LIMIT[level] > list[0].hit) denied();
        else {
          if (level >= 3 && !(my.game.robotChain || []).length) {
            if (Math.random() < 0.5)
              list.sort(function (a, b) {
                return b._id.length - a._id.length;
              });
            if (list[0]._id.length < 8 && my.game.turnTime >= 2300) {
              for (i in list) {
                w = list[i]._id.charAt(isRev ? 0 : list[i]._id.length - 1);
                if (!ended.hasOwnProperty(w)) ended[w] = [];
                ended[w].push(list[i]);
              }
              getWishList(Object.keys(ended)).then(function (key) {
                var v = ended[key];

                if (!v) denied();
                else pickList(v, my.game.theme);
              });
            } else {
              pickList(list, my.game.theme);
            }
          } else pickList(list, my.game.theme);
        }
      } else denied();
    });
  function denied() {
    if (Math.floor(Math.random() * 25) != 0) {
      text = isRev ? `T.T ...${my.game.char}` : `${my.game.char}... T.T`;
    } else {
      text = isRev ? `TωT ...${my.game.char}` : `${my.game.char}... TωT`;
    }
    after();
  }
  function pickList(list, theme) {
    if (my.opts.selecttheme) {
      if (list)
        do {
          if (!(w = list.shift())) break;
        } while (
          w._id.length > ROBOT_LENGTH_LIMIT[level] ||
          my.game.robotChain.includes(w._id) ||
          !w.theme.includes(theme) ||
          my.game.robotChain.includes(text)
        );
    } else if (my.opts.bantheme) {
      if (list)
        do {
          if (!(w = list.shift())) break;
        } while (
          w._id.length > ROBOT_LENGTH_LIMIT[level] ||
          my.game.robotChain.includes(w._id) ||
          w.theme.includes(theme) ||
          my.game.robotChain.includes(text)
        );
    } else {
      if (list)
        do {
          if (!(w = list.shift())) break;
        } while (
          w._id.length > ROBOT_LENGTH_LIMIT[level] ||
          my.game.robotChain.includes(w._id) ||
          my.game.robotChain.includes(text)
        );
    }
    if (w) {
      text = w._id;
      delay +=
        (500 * ROBOT_THINK_COEF[level] * Math.random()) / Math.log(1.1 + w.hit);
      after();
    } else denied();
  }
  function after() {
    delay += text.length * ROBOT_TYPE_COEF[level];
    //robot._done.push(text);
    my.game.robotChain.push(text);
    setTimeout(my.turnRobot, delay, robot, text);
  }
  function getWishList(list) {
    var R = new Lizard.Tail();
    var wz = [];
    var res;

    for (i in list) wz.push(getWish(list[i]));
    Lizard.all(wz).then(function ($res) {
      if (!my.game.chain) return;
      $res.sort(function (a, b) {
        return a.length - b.length;
      });

      if (my.opts.manner || !my.game.chain.length) {
        while ((res = $res.shift())) if (res.length) break;
      } else res = $res.shift();
      R.go(res ? res.char : null);
    });
    return R;
  }
  function getWish(char) {
    var R = new Lizard.Tail();

    DB.kkutu[my.rule.lang]
      .find(["_id", new RegExp(isRev ? `.${char}$` : `^${char}.`)])
      .limit(10)
      .on(function ($res) {
        R.go({ char: char, length: $res.length });
      });
    return R;
  }
};
exports.pause = function () {
  clearTimeout(this.game.turnTimer);
  clearTimeout(this.game._rrt);
  clearTimeout(this.game.nextTimer);
};
exports.resume = function () {
  this.game.turnTimer = setTimeout(this.turnStart, 2400);
};
function toRegex(theme) {
  return new RegExp(`(^|,)${theme}($|,)`);
}
function getMission(l, mode) {
  if (l == "ko") {
    var nrm = Const.MISSION_ko; //일반 미션
    var more = Const.MISSION_ko_more; //더 많은 미션
  }
  if (l == "en") {
    var nrm = Const.MISSION_en; //일반 미션
    var more = Const.MISSION_en;
  }

  if (!mode || mode == "normal" || mode == "random") {
    if (!nrm) return "-";
    return nrm[Math.floor(Math.random() * nrm.length)];
  }
  if (mode == "more") {
    if (!more) return "-";
    return more[Math.floor(Math.random() * more.length)];
  }
}
function getBlockWord(l) {
  var my = this;
  var arr = Const.MISSION_ko;

  if (!arr) return "-";
  return arr[Math.floor(Math.random() * arr.length)];
}
function getAuto(theme, char, subc, type) {
  /* type
		0 무작위 단어 하나
		1 존재 여부
		2 단어 목록
	*/
  var my = this;
  var R = new Lizard.Tail();
  var gameType = Const.GAME_TYPE[my.mode];
  var adv, adc;
  var key = gameType + "_" + keyByOptions(my.opts);
  var MAN = DB.kkutu_manner[my.rule.lang];
  var bool = type == 1;

  if (my.opts.ignoreinitial) key = "IGIN";

  adc = char + (subc ? "|" + subc : "");
  switch (gameType) {
    case "KUT":
    case "EUT":
      adv = `^(${adc})..`;
      break;
    case "KMH":
    case "KRH":
    case "KSH":
      adv = `^(${adc}).`;
      break;
    case "KLH":
      adv = `^(${adc}).{${my.game.wordLength - 1}}$`;
      break;
    case "ESH":
      adv = `^(${adc})...`;
      break;
    case "KKT":
    case "KRK":
    case "EKT":
      adv = `^(${adc}).{${my.game.wordLength - 1}}$`;
      break;
    case "KAP":
      adv = `.(${adc})$`;
      break;
    case "EAP":
      adv = `...(${adc})$`;
      break;
  }
  if (!char) {
    console.log(`Undefined char detected! key=${key} type=${type} adc=${adc}`);
  }
  MAN.findOne(["_id", char || "★"]).on(function ($mn) {
    if ($mn && bool) {
      if ($mn[key] === null) produce();
      else R.go($mn[key]);
    } else {
      produce();
    }
  });
  function produce() {
    var aqs = [["_id", new RegExp(adv)]];
    var aft;
    var lst;

    if (!my.opts.injeong) aqs.push(["flag", { $nand: Const.KOR_FLAG.INJEONG }]);
    if (my.rule.lang == "ko") {
      if (my.opts.loanword)
        aqs.push(["flag", { $nand: Const.KOR_FLAG.LOANWORD }]);
      if (my.opts.strict)
        aqs.push(["type", Const.KOR_STRICT], ["flag", { $lte: 3 }]);
      else aqs.push(["type", Const.KOR_GROUP]);
    } else if (my.rule.lang == "en") {
      aqs.push(["_id", Const.ENG_ID]);
    } else {
      aqs.push(["_id", Const.ENG_ID]); // 임시
    }
    switch (type) {
      case 0:
      default:
        aft = function ($md) {
          R.go($md[Math.floor(Math.random() * $md.length)]);
        };
        break;
      case 1:
        aft = function ($md) {
          R.go($md.length ? true : false);
        };
        break;
      case 2:
        aft = function ($md) {
          R.go($md);
        };
        break;
    }
    DB.kkutu[my.rule.lang].find
      .apply(this, aqs)
      .limit(bool ? 1 : 123)
      .on(function ($md) {
        if (!my.opts.unknownword) {
          forManner($md);
        }
        if (my.game.chain)
          aft(
            $md.filter(function (item) {
              return !my.game.chain.includes(item);
            })
          );
        else aft($md);
      });
    function forManner(list) {
      lst = list;
      MAN.upsert(["_id", char])
        .set([key, lst.length ? true : false])
        .on(null, null, onFail);
    }
    function onFail() {
      MAN.createColumn(key, "boolean").on(function () {
        forManner(lst);
      });
    }
  }
  return R;
}
function keyByOptions(opts) {
  var arr = [];

  if (opts.injeong) arr.push("X");
  if (opts.loanword) arr.push("L");
  if (opts.strict) arr.push("S");
  return arr.join("");
}
function shuffle(arr) {
  var i,
    r = [];

  for (i in arr) r.push(arr[i]);
  r.sort(function (a, b) {
    return Math.random() - 0.5;
  });

  return r;
}
function getChar(text, lim) {
  var my = this;

  if (Const.RULE[Const.GAME_TYPE[my.mode]].randomChar) {
    if (text.length > 2)
      my.game.randomChar = Math.floor(Math.random() * text.length);
    else my.game.randomChar = 1;
    return text.charAt(my.game.randomChar);
  }
  switch (Const.GAME_TYPE[my.mode]) {
    case "KUT":
      return text.slice(text.length - 3);
    case "EUT":
      return text.slice(text.length - 3);
    case "ESH":
    case "KLH":
    case "KKT":
    case "KRK":
    case "EKT":
      if (my.game.middleToss) {
        my.game.mtp = Math.random() < 1 / 3;
        if (my.game.mtp) return text.charAt(1);
      }
    case "KSH":
      return text.slice(-1);
    case "EAP":
    case "JAP":
    case "KAP":
      return text.charAt(0);
    case "KRH":
    case "ERH":
      return text.charAt(1);
    case "KMH":
      if (Const.GAME_TYPE[my.mode] == "KMH") {
        if (text.length == 2) my.game.middleChar = 1;
        else my.game.middleChar = text.indexOf(getMiddleChar(text));
        if (my.game.middleChar != -1) return text.charAt(my.game.middleChar);
        else return text.charAt(text.length - 1);
      }
  }
}
function getMiddleChar(text) {
  var value = "";
  if (text.length % 2 == 0) {
    // 짝
    value = value.concat(text[text.length / 2 - 1]);
    value = value.concat(text[text.length / 2]);
    if (Outer.random(0, 1) == 0) value = value.substr(0, 1);
    else value = value.substr(1);
  } else {
    // 홀
    value = value.concat(text[Math.floor(text.length / 2)]);
  }
  return value;
}
function getSubChar(char) {
  var my = this;
  var r;
  var c = char.charCodeAt();
  var k;
  var ca, cb, cc;

  switch (Const.GAME_TYPE[my.mode]) {
    case "EUT":
    case "KUT":
      if (char.length > 2) r = char.slice(1);
      break;
    case "KKT":
    case "KRK":
    case "EKT":
    case "KSH":
    case "KAP":
    case "KLH":
    case "KRH":
    case "KMH":
      k = c - 0xac00;
      if (k < 0 || k > 11171) break;
      ca = [Math.floor(k / 28 / 21), Math.floor(k / 28) % 21, k % 28];
      cb = [ca[0] + 0x1100, ca[1] + 0x1161, ca[2] + 0x11a7];
      cc = false;
      if (cb[0] == 4357) {
        // ㄹ에서 ㄴ, ㅇ
        cc = true;
        if (RIEUL_TO_NIEUN.includes(cb[1])) cb[0] = 4354;
        else if (RIEUL_TO_IEUNG.includes(cb[1])) cb[0] = 4363;
        else cc = false;
      } else if (cb[0] == 4354) {
        // ㄴ에서 ㅇ
        if (NIEUN_TO_IEUNG.indexOf(cb[1]) != -1) {
          cb[0] = 4363;
          cc = true;
        }
      }
      if (cc) {
        cb[0] -= 0x1100;
        cb[1] -= 0x1161;
        cb[2] -= 0x11a7;
        r = String.fromCharCode((cb[0] * 21 + cb[1]) * 28 + cb[2] + 0xac00);
      }
      break;
    case "ESH":
    case "EAP":
    case "ERH":
    default:
      break;
  }
  return r;
}
