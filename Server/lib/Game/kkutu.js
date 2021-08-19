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

const Cluster = require("cluster");
const Const = require("../const");
const Lizard = require("../sub/lizard");
const Outer = require("../sub/outer");
const JLog = require("../sub/jjlog");
const fs = require("fs");
const moment = require("moment");

let GUEST_PERMISSION;
let DB;
let SHOP;
let DIC;
let ROOM;
let _rid;
let Rule;
let CHAN;
let GLOBAL = require("../sub/global.json");

const channel = process.env["CHANNEL"] || 0;
const NUM_SLAVES = 4;
const GUEST_IMAGE = "/img/kkutu/guest.png";
const MAX_OKG = 18;
const PER_OKG = 600000;

fs.watchFile("./lib/sub/global.json", () => {
    GLOBAL = require("../sub/global.json");
    JLog.info("global.json is Auto-Updated at {lib/Game/kkutu.js}");
});

const getFreeChannel = () => {
    const list = {};

    if (Cluster.isMaster) {
        var mk = 1;

        for (let i in CHAN) {
            // if(CHAN[i].isDead()) continue;
            list[i] = 0;
        }
        for (let i in ROOM) {
            // if(!list.hasOwnProperty(i)) continue;
            mk = ROOM[i].channel;
            list[mk]++;
        }
        for (let i in list) {
            if (list[i] < list[mk]) mk = i;
        }
        return Number(mk);
    } else {
        return channel || 0;
    }
};
const getGuestName = (sid) => {
    const len = sid.length;
    let res = 0;

    for (let i = 0; i < len; i++) {
        res += sid.charCodeAt(i) * (i + 1);
    }
    return "GUEST" + (1000 + (res % 9000));
};
const shuffle = (arr) => {
    const r = [];

    for (let i in arr) r.push(arr[i]);
    r.sort((a, b) => {
        return Math.random() - 0.5;
    });

    return r;
};
const getRewards = (
    rankPoint,
    mode,
    score,
    bonus,
    rank,
    all,
    ss,
    srp,
    opts,
    nscore
) => {
    if (opts.unknownword) return { score: 0, money: 0, rankPoint: 0 }; // 언노운워드는 보상이 없다.
    if (Const.GAME_TYPE[mode] == "ADL")
        return { score: 0, money: 0, rankPoint: 0 }; // 노운워드는 보상이 없다.

    //score 점수, rw.score 획득 점수, rankPoint 랭크 포인트, rw.rankPoint 획득 랭크 포인트

    const rw = { score: 0, money: 0, rankPoint: 0 };
    const sr = score / ss;
    const rr = rankPoint / srp;
    /*
	if (opts.manner) rw.score = rw.score * 0.9; // 매너
	if (opts.injeong) rw.score = rw.score * 0.75; // 어인정
	if (opts.mission) { // 미션
		if (!opts.randommission) rw.score = rw.score * 0.8; // 랜덤 미션
		if (!opts.abcmission) rw.score = rw.score * 0.8; //가나다 미션
		else rw.score = rw.score * 0.7;
	};
	if (opts.proverb) rw.score = rw.score * 1.3; // 속담
	if (opts.loanword) rw.score = rw.score * 1.2; // 우리말
	if (opts.strict) rw.score = rw.score * 1.3; // 깐깐
	if (opts.sami) rw.score = rw.score * 1.5; // 3232
	if (opts.no2) rw.score = rw.score * 1.5; // 2글자 금지

	if (opts.returns) rw.score = rw.score * 0.25 // 리턴
	if (opts.randomturn) rw.score = rw.score * 1.3; // 랜덤 턴
	if (opts.noreturn) rw.score = rw.score * 0.9; // 도돌이 금지
	if (opts.ignoreinitial) rw.score = rw.score * 1.6; // 두음 법칙 파괴
	// if (opts.unknownplayer) rw.score = rw.score * 3; // 언노운 플레이어
	// if (opts.leng) rw.score = rw.score * 1.3; // 길이제한
	*/
    if (opts.manner) rw.score = rw.score * 0.95; // 매너
    if (opts.midmanner) rw.score = rw.score * 0.95; // 미들킬 금지
    if (opts.injeong) rw.score = rw.score * 0.8; // 어인정
    if (opts.mission) {
        // 미션
        if (!opts.randommission) {
            rw.score = rw.score * 0.95;
        } else {
            rw.score = rw.score * 0.9;
        }
        if (opts.moremission) {
            rw.score = rw.score * 1.25;
        } else {
            rw.score = rw.score * 0.9;
        }
    }
    if (opts.proverb) rw.score = rw.score * 1.4; // 속담
    if (opts.loanword) rw.score = rw.score * 1.3; // 우리말
    if (opts.strict) rw.score = rw.score * 1.4; // 깐깐
    if (opts.sami) rw.score = rw.score * 1.6; // 3232
    if (opts.no2) rw.score = rw.score * 1.6; // 2글자 금지

    if (opts.returns) rw.score = rw.score * 0.25; // 리턴
    if (opts.randomturn) rw.score = rw.score * 1.4; // 랜덤 턴
    if (opts.noreturn) rw.score = rw.score * 1.1; // 도돌이 금지
    if (opts.ignoreinitial) rw.score = rw.score * 2.1; // 두음 법칙 파괴
    if (opts.blockWord) rw.score = rw.score * 1.0; // 단어 금지
    if (opts.ogow) rw.score = rw.score * 1.1; // 한번만
    if (opts.selecttheme) rw.score = rw.score * 1.2; // 주제 선택 (한국어 끝말잇기)
    if (opts.bantheme) rw.score = rw.score * 1.0; // 주제 금지 (한국어 끝말잇기)
    if (opts.middletoss) rw.score = rw.score * 1.2; // 미들 토스
    if (opts.twenty) rw.score = rw.score * 0.95; // 20자 제한
    if (opts.item) rw.score = rw.score * 0.8; // 아이템 전
    if (opts.tournament) rw.score = rw.score * 3.0; // 토너먼트
    // all은 1~16
    // rank는 0~15
    /*switch(Const.GAME_TYPE[mode]){
		case "EKT":
			rw.score += score * 1.4;
			break;
		case "ESH":
			rw.score += score * 0.5;
			break;
		case "KKT":
			rw.score += score * 1.25;
			break;
		case "KSH":
			rw.score += score * 0.57;
			break;
		case "CSQ": // 한국어 자음퀴즈
			rw.score += score * 0.4;
			break;
		case 'KCW':
			rw.score += score * 1.0;
			break;
		case 'KTY':
			rw.score += score * 0.3;
			break;
		case 'ETY':
			rw.score += score * 0.37;
			break;
		case 'KAP':
			rw.score += score * 0.8;
			break;
		case 'HUN':
			rw.score += score * 0.5;
			break;
		case 'KDA':
			rw.score += score * 0.57;
			break;
		case 'EDA':
			rw.score += score * 0.65;
			break;
		case 'KSS':
			rw.score += score * 0.5;
			break;
		case 'ESS':
			rw.score += score * 0.22;
			break;
		case 'KDG': //한국어 그림 퀴즈
			rw.score += score * 0.1;
			break;
		case 'EDG': //영어 그림 퀴즈
			rw.score += score * 0.1;
			break;
		case 'KUT': //한국어 끄투
			rw.score += score * 1.4;
			break;
		case 'KRH': //한국어 랜덤잇기
			rw.score += score * 0.6;
			break;
		case 'ERH': //영어 랜덤잇기
			rw.score += score * 0.6;
			break;
		case 'KMH': //한국어 가운데잇기
			rw.score += score * 0.58;
			break;
		default:
			break;
	}*/
    switch (Const.GAME_TYPE[mode]) {
        case "EKT":
            rw.score += score * 1.5;
            break;
        case "ESH":
            rw.score += score * 0.6;
            break;
        case "KKT":
            rw.score += score * 1.35;
            break;
        case "KSH":
            rw.score += score * 0.67;
            break;
        case "CSQ": // 한국어 자음퀴즈
            rw.score += score * 0.5;
            break;
        case "KCW":
            rw.score += score * 1.1;
            break;
        case "KTY":
            rw.score += score * 0.4;
            break;
        case "ETY":
            rw.score += score * 0.47;
            break;
        case "KAP":
            rw.score += score * 0.9;
            break;
        case "HUN":
            rw.score += score * 0.6;
            break;
        case "KDA":
            rw.score += score * 0.67;
            break;
        case "EDA":
            rw.score += score * 0.75;
            break;
        case "KSS":
            rw.score += score * 1.05;
            break;
        case "ESS":
            rw.score += score * 0.32;
            break;
        case "KDG": //한국어 그림 퀴즈
            rw.score += score * 0.2;
            break;
        case "EDG": //영어 그림 퀴즈
            rw.score += score * 0.2;
            break;
        case "KUT": //한국어 끄투
            rw.score += score * 1.5;
            break;
        case "KRH": //한국어 랜덤잇기
            rw.score += score * 0.7;
            break;
        case "ERH": //영어 랜덤잇기
            rw.score += score * 0.7;
            break;
        case "KMH": //한국어 가운데잇기
            rw.score += score * 0.68;
            break;
        default:
            break;
    }

    if (opts.rankgame) rw.rankPoint = rw.score * 0.05;
    else rw.rankPoint = 0;

    rw.score =
        (rw.score *
            (0.77 + 0.05 * (all - rank) * (all - rank)) * // 순위
            1.25) /
        (1 + 1.25 * sr * sr); // 점차비(양학했을 수록 ↓)

    // TODO: 랭크 포인트 획득 알고리즘 개선하기
    rw.rankPoint =
        (rw.rankPoint *
            (0.77 + 0.05 * (all - rank) * (all - rank)) * // 순위
            1.25) /
        (1 + 1.25 * rr * rr); // 점차비(양학했을 수록 ↓)

    rw.money = 1 + rw.score * 0.01;
    if (all < 2) {
        rw.score = rw.score * 0.05;
        rw.money = rw.money * 0.05;
        rw.rankPoint = 0;
    } else {
        rw.together = true;
    }

    if (all >= 2 && all <= 4) rw.rankPoint = rw.rankPoint * 0.5;
    else if (all > 4 && all <= 8) rw.rankPoint = rw.rankPoint * 0.75;

    /*if(robot){
		rw.score = rw.score * 0.001;
		rw.money = rw.money * 0.001;
		rw.rankPoint = 0;
	}*/
    rw.score += bonus;
    rw.score = rw.score || 0;
    rw.money = rw.money || 0;
    rw.rankPoint = rw.rankPoint || 0;

    if (nscore <= "-1") {
        rw.score = 0;
    }

    if (rankPoint >= 2850 && rankPoint <= 2999) {
        rw.rankPoint = rw.rankPoint * 0.7;
    } else if (rankPoint >= 3700 && rankPoint <= 3999) {
        rw.rankPoint = rw.rankPoint * 0.6;
    } else if (rankPoint >= 4500 && rankPoint <= 4999) {
        rw.rankPoint = rw.rankPoint * 0.5;
    }

    //rw.rankPoint = rw.rankPoint * 0.65;

    // 크리스마스 이벤트
    /*rw.score = rw.score * 2;
	rw.money = rw.money * 2;
	rw.rankPoint = rw.rankPoint * 2;*/

    // applyEquipOptions에서 반올림한다.

    //rw.rankPoint = rw.rankPoint * 2; //1시즌 시작 기념 이벤트

    //rw.score = rw.score * 1.5; // 새시즌 시작 기념 이벤트
    //rw.rankPoint = rw.rankPoint * 1.5; // 새시즌 시작 기념 이벤트

    /*if (rankPoint >= 5000){
		rw.rankPoint = 0; //마스터 달성 시 추가 랭크 포인트 획득 제한
	}*/

    if (rankPoint >= 5000) {
        // 마스터 이상 구간에서 하위 티어가 상위 티어를 따라잡기 더 쉽게 하기 위함.
        if (rankPoint <= 5999) {
            rw.rankPoint = rw.rankPoint * 0.99;
        } else if (rankPoint >= 6000 && rankPoint <= 6999) {
            rw.rankPoint = rw.rankPoint * 0.98;
        } else if (rankPoint >= 7000 && rankPoint <= 7999) {
            rw.rankPoint = rw.rankPoint * 0.97;
        } else if (rankPoint >= 8000 && rankPoint <= 8999) {
            rw.rankPoint = rw.rankPoint * 0.96;
        } else if (rankPoint >= 9000 && rankPoint <= 9999) {
            rw.rankPoint = rw.rankPoint * 0.95;
        } else if (rankPoint >= 10000 && rankPoint <= 10999) {
            rw.rankPoint = rw.rankPoint * 0.94;
        } else if (rankPoint >= 11000 && rankPoint <= 11999) {
            rw.rankPoint = rw.rankPoint * 0.93;
        } else if (rankPoint >= 12000 && rankPoint <= 12999) {
            rw.rankPoint = rw.rankPoint * 0.92;
        } else if (rankPoint >= 13000 && rankPoint <= 13999) {
            rw.rankPoint = rw.rankPoint * 0.91;
        } else if (rankPoint >= 14000 && rankPoint <= 14999) {
            rw.rankPoint = rw.rankPoint * 0.9;
        } else if (rankPoint >= 15000 && rankPoint <= 15999) {
            rw.rankPoint = rw.rankPoint * 0.89;
        } else if (rankPoint >= 16000 && rankPoint <= 16999) {
            rw.rankPoint = rw.rankPoint * 0.88;
        } else if (rankPoint >= 17000 && rankPoint <= 17999) {
            rw.rankPoint = rw.rankPoint * 0.87;
        } else if (rankPoint >= 18000 && rankPoint <= 18999) {
            rw.rankPoint = rw.rankPoint * 0.86;
        } else if (rankPoint >= 19000 && rankPoint <= 19999) {
            rw.rankPoint = rw.rankPoint * 0.85;
        }
    }

    if (opts.randomturn && all <= 3)
        rw.rankPoint = rw.rankPoint - rw.rankPoint * 0.7; // 랜덤 턴
    if (opts.returns) rw.rankPoint = 0; // 리턴

    return rw;
};
const filterRobot = (item) => {
    if (!item) return {};
    return item.robot && item.getData ? item.getData() : item;
};

exports.NIGHT = false;
exports.init = function (_DB, _DIC, _ROOM, _GUEST_PERMISSION, _CHAN) {
    DB = _DB;
    DIC = _DIC;
    ROOM = _ROOM;
    GUEST_PERMISSION = _GUEST_PERMISSION;
    CHAN = _CHAN;
    _rid = 100;

    DB.kkutu_shop.find().on(($shop) => {
        SHOP = {};

        $shop.forEach((item) => {
            SHOP[item._id] = item;
        });
    });
    Rule = {};
    for (let i in Const.RULE) {
        let k = Const.RULE[i].rule;
        Rule[k] = require(`./games/${k.toLowerCase()}`);
        Rule[k].init(DB, DIC);
    }
};
exports.getUserList = () => {
    let res = {};

    for (let i in DIC) {
        res[i] = DIC[i].getData();
    }

    return res;
};
exports.getRoomList = () => {
    let res = {};

    for (let i in ROOM) {
        res[i] = ROOM[i].getData();
    }

    return res;
};
exports.narrate = (list, type, data) => {
    list.forEach((v) => {
        if (DIC[v]) DIC[v].send(type, data);
    });
};
exports.publish = function (type, data, _room) {
    if (Cluster.isMaster) {
        for (let i in DIC) {
            DIC[i].send(type, data);
        }
    } else if (Cluster.isWorker) {
        if (type == "room")
            process.send({ type: "room-publish", data: data, password: _room });
        else if (type == "breakroom") {
            for (let i in ROOM[data].players) {
                const $c = ROOM[data].players[i];

                if (!DIC) return null;
                if (!$c) return null;
                DIC[$c].place = null;
            }
            delete ROOM[data];
        } else if (type == "forceready") DIC[data].ready = true;
        else if (type == "forcespectate") DIC[data].spectate = true;
        else if (type == "roomtitle") {
            const [target, newtitle] = data.split(",");
            ROOM[target].title = newtitle;
        } else
            for (let i in DIC) {
                DIC[i].send(type, data);
            }
    }
};
exports.Robot = function (target, place, level) {
    const my = this;

    my.id = target + place + Math.floor(Math.random() * 1000000000);
    my.robot = true;
    my.game = {};
    my.data = {};
    my.place = place;
    my.target = target;
    my.equip = { robot: true };

    my.getData = () => {
        return {
            id: my.id,
            robot: true,
            game: my.game,
            data: my.data,
            place: my.place,
            target: target,
            equip: my.equip,
            level: my.level,
            ready: true,
        };
    };
    my.setLevel = (level) => {
        my.level = level;
        my.data.score = Math.pow(10, level + 2);
    };
    my.setTeam = (team) => {
        my.game.team = team;
    };
    my.send = () => {};
    my.obtain = () => {};
    my.invokeWordPiece = (text, coef) => {};
    my.publish = (type, data) => {
        if (my.target == null) {
            for (let i in DIC) {
                if (DIC[i].place == place) DIC[i].send(type, data);
            }
        } else if (DIC[my.target]) {
            DIC[my.target].send(type, data);
        }
    };
    my.chat = (msg, code) => {
        my.publish("chat", { value: msg });
    };
    my.setLevel(level);
    my.setTeam(0);
};
exports.Data = function (data) {
    let j;
    if (!data) data = {};

    this.score = data.score || 0;
    this.playTime = data.playTime || 0;
    this.rankPoint = data.rankPoint || 0;
    this.connectDate = data.connectDate || 0;
    this.record = {};
    for (let i in Const.GAME_TYPE) {
        this.record[(j = Const.GAME_TYPE[i])] = data.record
            ? data.record[Const.GAME_TYPE[i]] || [0, 0, 0, 0]
            : [0, 0, 0, 0];
        if (!this.record[j][3]) this.record[j][3] = 0;
    }
    // 전, 승, 점수, 플레이 타임
};
exports.WebServer = function (socket) {
    const my = this;

    my.socket = socket;

    my.send = (type, data) => {
        const r = data || {};

        r.type = type;

        if (socket.readyState == 1) socket.send(JSON.stringify(r));
    };
    my.onWebServerMessage = (msg) => {
        try {
            msg = JSON.parse(msg);
        } catch (e) {
            return;
        }

        switch (msg.type) {
            case "seek":
                my.send("seek", { value: Object.keys(DIC).length });
                break;
            case "narrate-friend":
                exports.narrate(msg.list, "friend", {
                    id: msg.id,
                    s: msg.s,
                    stat: msg.stat,
                });
                break;
            default:
        }
    };
    socket.on("message", my.onWebServerMessage);
};
exports.Gwalli = class Gwalli {
	constructor(socket){
		this.socket = socket;
		
		socket.on("message", (msg) => {
			let data;
			if (!msg) return;
			//if(!JSON.parse(msg)) return;

			try {
				data = JSON.parse(msg);
			} catch (e) {
				JLog.error(
					`ERROR OCCURRED ON THE KKuTu! Cannot Parse Received Message. from kkutu.js, Received: ${msg}`
				);
				return;
			}

			if (data.type != "wsrefresh" && data.type != "reloadData")
				JLog.log(`Chan @${channel} Msg #gwalli: ${msg}`);

			exports.onGwalliMessage(data);
		});
	}
	
	send(type, data){
		const r = data || {};

        r.type = type;

        if (socket.readyState == 1) socket.send(JSON.stringify(r));
	}
};
exports.Client = function (socket, profile, sid) {
    var my = this;

    my.send = (type, data) => {
        const r = data || {};

        r.type = type;

        if (socket.readyState == 1) socket.send(JSON.stringify(r));
    };
    my.sendError = (code, msg) => {
        my.send("error", { code: code, message: msg });
    };

    if (profile) {
        if (!sid.includes("undefined")) {
            my.id = profile.id;
            my.profile = profile;

            delete my.profile.token;
            delete my.profile.sid;

            if (my.profile.title) my.profile.name = "anonymous";
        }
    } else {
        my.sendError(402);
        socket.close();
    }
    my.nickname = null;
    my.socket = socket;
    my.place = 0;
    my.team = 0;
    my.ready = false;
    my.game = {};

    my.subPlace = 0;
    my.error = false;
    my.blocked = false;
    my.spam = 0;
    my._pub = new Date();

    if (Cluster.isMaster) {
        my.onOKG = (time) => {
            // ?? 이럴 일이 없어야 한다.
        };
    } else {
        my.onOKG = (time) => {
            const date = new Date().getDate();

            if (my.guest) return;
            if (date != my.data.connectDate) {
                my.data.connectDate = date;
                my.data.playTime = 0;
                my.okgCount = 0;
            }
            my.data.playTime += time;

            while (my.data.playTime >= PER_OKG * (my.okgCount + 1)) {
                if (my.okgCount >= MAX_OKG) return;
                my.okgCount++;
            }
            my.send("okg", { time: my.data.playTime, count: my.okgCount });
        };
    }
    socket.on("close", (code) => {
        if (ROOM[my.place]) ROOM[my.place].go(my);
        if (my.subPlace) my.pracRoom.go(my);
        exports.onClientClosed(my, code);
    });
    socket.on("data", (src, start, end) => {
        src = src.slice(start, end);
        const maskKeys = [src[2], src[3], src[4], src[5]];
        let dest = new Array();

        for (let i = 0; i < src.length - 6; i++) {
            const mKey = maskKeys[i % 4];
            dest[i] = mKey ^ src[6 + i];
        }

        const msg = new Buffer.from(dest).toString();
        const data = JSON.parse(msg);

        if (data.type != "wsrefresh" && data.type != "reloadData")
            JLog.log(`Chan @${channel} Msg #${my.id}: ${msg}`);
        if (Cluster.isWorker)
            process.send({
                type: "tail-report",
                id: my.id,
                chan: channel,
                place: my.place,
                msg: data.error ? msg : data,
            });

        exports.onClientMessage(my, data);
    });
    socket.on("message", (msg) => {
        let data;
        if (!my) return;
        if (!msg) return;
        if (!my.id) return;
        //if(!JSON.parse(msg)) return;

        try {
            data = JSON.parse(msg);
        } catch (e) {
            JLog.error(
                `ERROR OCCURRED ON THE KKuTu! Cannot Parse Received Message. from kkutu.js, Received: ${msg}`
            );
            return;
        }

        if (data.type != "wsrefresh" && data.type != "reloadData")
            JLog.log(`Chan @${channel} Msg #${my.id}: ${msg}`);
        if (Cluster.isWorker)
            process.send({
                type: "tail-report",
                id: my.id,
                chan: channel,
                place: my.place,
                msg: data.error ? msg : data,
            });

        exports.onClientMessage(my, data);
    });
    my.drawingCanvas = (msg) => {
        const $room = ROOM[my.place];

        if (!$room) return;
        if (!$room.gaming) return;
        if ($room.rule.rule != "Drawing") return;

        $room.drawingCanvas(msg);
    };
    my.getData = (gaming) => {
        const o = {
            id: my.id,
            guest: my.guest,
            game: {
                ready: my.ready,
                form: my.form,
                team: my.team,
                practice: my.subPlace,
                score: my.game.score,
                item: my.game.item,
            },
        };
        if (!gaming) {
            o.profile = my.profile;
            o.place = my.place;
            o.data = my.data;
            o.money = my.money;
            o.equip = my.equip;
            o.nickname = my.nickname;
            o.exordial = my.exordial;
        }
        return o;
    };
    my.send = (type, data) => {
        const r = data || {};

        r.type = type;

        if (socket.readyState == 1) socket.send(JSON.stringify(r));
    };
    my.sendError = (code, msg) => {
        my.send("error", { code: code, message: msg });
    };
    my.publish = (type, data, noBlock) => {
        const now = new Date();
        const st = now - my._pub;

        if (st <= Const.SPAM_ADD_DELAY) my.spam++;
        else if (st >= Const.SPAM_CLEAR_DELAY) my.spam = 0;
        if (my.spam >= Const.SPAM_LIMIT) {
            if (!my.blocked) my.numSpam = 0;
            my.blocked = true;
        }
        if (!noBlock) {
            my._pub = now;
            if (my.blocked) {
                if (st < Const.BLOCKED_LENGTH) {
                    if (++my.numSpam >= Const.KICK_BY_SPAM) {
                        if (Cluster.isWorker)
                            process.send({ type: "kick", target: my.id });
                        return my.socket.close();
                    }
                    return my.send("blocked");
                } else my.blocked = false;
            }
        }
        data.profile = my.profile;
        if (my.subPlace && type != "chat") my.send(type, data);
        else
            for (let i in DIC) {
                if (DIC[i].place == my.place) DIC[i].send(type, data);
            }
        if (Cluster.isWorker && type == "user")
            process.send({ type: "user-publish", data: data });
    };
    my.chat = (msg, code /*, origin*/) => {
        const date = moment().format("MM월-DD일|HH시-mm분");
        if (my.noChat) return my.send("chat", { notice: true, code: 443 });
        fs.appendFileSync(
            `./lib/Web/chatlog/all/${my.id}.log`,
            `[${date}] ${my.id}: ${msg}\n`,
            "utf8"
        );
        my.publish("chat", {
            value: msg,
            notice: code ? true : false,
            code: code /*, origin: origin*/,
        });
    };
    my.checkExpire = () => {
        let now = new Date();
        const date = now.getDate();
        const expired = [];

        now = now.getTime() * 0.001;
        if (date != my.data.connectDate) {
            my.data.connectDate = date;
            my.data.playTime = 0;
        }
        for (let i in my.box) {
            if (!my.box[i]) {
                delete my.box[i];
                continue;
            }
            if (!my.box[i].expire) continue;
            if (my.box[i].expire < now) {
                let gr = SHOP[i].group;

                if (gr.substr(0, 3) == "BDG") gr = "BDG";
                if (my.equip[gr] == i) delete my.equip[gr];
                delete my.box[i];
                expired.push(i);
            }
        }
        if (expired.length) {
            my.send("expired", { list: expired });
            my.flush(my.box, my.equip);
        }
    };
    my.refresh = () => {
        const R = new Lizard.Tail();

        if (my.guest) {
            my.equip = {};
            my.data = new exports.Data();
            my.money = 0;
            my.friends = {};

            R.go({ result: 200 });
        } else
            DB.users.findOne(["_id", my.id]).on(($user) => {
                let first = !$user;
                let ban = first
                    ? {
                          isBanned: false,
                          reason: "",
                          bannedAt: "",
                          bannedUntil: "",
                      }
                    : $user.ban;
                let chatban = first
                    ? {
                          isBanned: false,
                          reason: "",
                          bannedAt: "",
                          bannedUntil: "",
                      }
                    : $user.chatban;

                if (first)
                    $user = {
                        nickname: my.profile.title || my.profile.name,
                        money: 0,
                    };
                if (chatban.isBanned) {
                    my.noChat = true;
                }
                my.nickname = $user.nickname || undefined;
                my.exordial = $user.exordial || "";
                if (my.nickname)
                    my.profile.title = my.profile.name = my.nickname;
                my.equip = $user.equip || {};
                my.box = $user.box || {};
                my.careful = $user.careful || null;

                my.data = new exports.Data($user.kkutu);
                my.money = Number($user.money);
                my.friends = $user.friends || {};
                if (first) {
                    my.flush();
                    DB.users
                        .update(["_id", my.id])
                        .set(["nickname", my.nickname || "별명 미지정"])
                        .on(() => {
                            if (!my.nickname)
                                JLog.warn(
                                    `OAuth로부터 별명을 받아오지 못한 유저가 있습니다. #${my.id}`
                                );
                            DB.session
                                .update(["_id", sid])
                                .set(["nickname", my.nickname || "별명 미지정"])
                                .on();
                        });
                } else {
                    my.checkExpire();
                    my.okgCount = Math.floor((my.data.playTime || 0) / PER_OKG);
                }
                if (chatban.isBanned) {
                    const now = moment().format("YYYYMMDDHH");

                    if (now >= Number(chatban.bannedUntil)) {
                        chatban.isBanned = false;
                        chatban.reason = "";
                        chatban.bannedAt = "";
                        chatban.bannedUntil = "";
                        DB.users
                            .update(["_id", my.id])
                            .set(["chatban", JSON.stringify(chatban)])
                            .on();
                    }
                }
                if (ban.isBanned) {
                    const now = moment().format("YYYYMMDDHH");

                    if (now >= Number(ban.bannedUntil)) {
                        ban.isBanned = false;
                        ban.reason = "";
                        ban.bannedAt = "";
                        ban.bannedUntil = "";
                        DB.users
                            .update(["_id", my.id])
                            .set(["ban", JSON.stringify(ban)])
                            .on();
                        R.go({ result: 444, isBanned: false });
                    } else {
                        R.go({
                            result: 444,
                            isBanned: ban.isBanned,
                            reason: ban.reason,
                            bannedAt: ban.bannedAt,
                            bannedUntil: ban.bannedUntil,
                        });
                    }
                } else if (Cluster.isMaster && $user.server)
                    R.go({ result: 409, isBanned: $user.server });
                else if (exports.NIGHT && my.isAjae === false)
                    R.go({ result: 440 });
                else R.go({ result: 200 });
            });
        return R;
    };
    my.flush = (box, equip, friends) => {
        const R = new Lizard.Tail();

        if (my.guest) {
            R.go({ id: my.id, prev: 0 });
            return R;
        }
        DB.users
            .upsert(["_id", my.id])
            .set(
                !isNaN(my.money) ? ["money", my.money] : undefined,
                my.data && !isNaN(my.data.score)
                    ? ["kkutu", my.data]
                    : undefined,
                box ? ["box", my.box] : undefined,
                equip ? ["equip", my.equip] : undefined,
                friends ? ["friends", my.friends] : undefined
            )
            .on((__res) => {
                DB.users.findOne(["_id", my.id]).on(($ec) => {
                    if (!$ec) return;
                    else if (!$ec.clan) return;
                    else {
                        DB.clans.findOne(["_id", $ec.clan]).on(($data) => {
                            if (!$data) return;
                            else if (!$data.score) $data.score = 0;
                            $data.score = Number($data.score) + 1;
                            DB.clans
                                .update(["_id", $ec.clan])
                                .set(["score", $data.score])
                                .on();
                        });
                        return;
                    }
                });
                DB.redis.getGlobal(my.id).then((_res) => {
                    DB.rRedis.putGlobal(my.id, my.data.rankPoint);
                    DB.redis.putGlobal(my.id, my.data.score).then((res) => {
                        JLog.log(
                            `FLUSHED [${my.id}] PTS=${my.data.score} MNY=${my.money} RP=${my.data.rankPoint}`
                        );
                        R.go({ id: my.id, prev: _res });
                    });
                });
            });
        return R;
    };
    my.invokeWordPiece = (text, coef) => {
        if (!my.game.wpc) return;

        if (Math.random() <= 0.04 * coef) {
            const v = text.charAt(Math.floor(Math.random() * text.length));
            if (!v.match(/[a-z가-힣]/)) return;
            my.game.wpc.push(v);
        }
    };
    my.enter = (room, password, spectate, joinWhileGaming) => {
        let $room;

        if (my.place) {
            my.send("roomStuck");
            JLog.warn(
                `Enter the room ${room.id} in the place ${my.place} by ${my.id}!`
            );
            return;
        } else if (room.id) {
            // 이미 있는 방에 들어가기... 여기서 유효성을 검사한다.
            $room = ROOM[room.id];

            if (!$room) {
                if (Cluster.isMaster) {
                    for (let i in CHAN)
                        CHAN[i].send({ type: "room-invalid", room: room });
                } else {
                    process.send({ type: "room-invalid", room: room });
                }
                return my.sendError(430, room.id);
            }
            if (!joinWhileGaming && !spectate) {
                if ($room.gaming && $room.opts.joinwhilegaming) {
                    return my.send("error", { code: 466, target: $room.id });
                } else if ($room.gaming) {
                    return my.send("error", { code: 416, target: $room.id });
                } else if (my.guest)
                    if (!GUEST_PERMISSION.enter) {
                        return my.sendError(401);
                    }
            }
            if ($room.time == 9999999 && !my.admin) return my.sendError(460);
            if (
                $room.players.length >=
                $room.limit + (spectate ? Const.MAX_OBSERVER : 0)
            ) {
                if (!my.admin) return my.sendError(429);
            }
            if ($room.players.indexOf(my.id) != -1) {
                return my.sendError(409);
            }
            if (Cluster.isMaster) {
                my.send("preRoom", {
                    id: $room.id,
                    pw: room.password,
                    channel: $room.channel,
                });
                CHAN[$room.channel].send({
                    type: "room-reserve",
                    session: sid,
                    room: room,
                    spectate: spectate,
                    joinWhileGaming: joinWhileGaming,
                    password: password,
                });

                $room = undefined;
            } else {
                if (!password && $room) {
                    if ($room.kicked.includes(my.id)) {
                        return my.sendError(406);
                    }
                    if ($room.password != room.password && $room.password) {
                        $room = undefined;
                        return my.sendError(403);
                    }
                }
            }
        } else if (my.guest && !GUEST_PERMISSION.enter) {
            my.sendError(401);
        } else {
            // 새 방 만들어 들어가기
            /*
				1. 마스터가 ID와 채널을 클라이언트로 보낸다.
				2. 클라이언트가 그 채널 일꾼으로 접속한다.
				3. 일꾼이 만든다.
				4. 일꾼이 만들었다고 마스터에게 알린다.
				5. 마스터가 방 정보를 반영한다.
			*/
            if (Cluster.isMaster) {
                const av = getFreeChannel();

                room.id = _rid;
                room._create = true;
                my.send("preRoom", { id: _rid, channel: av });
                CHAN[av].send({
                    type: "room-reserve",
                    create: true,
                    session: sid,
                    room: room,
                });

                do {
                    if (++_rid > 999) _rid = 100;
                } while (ROOM[_rid]);
            } else {
                if (room._id) {
                    room.id = room._id;
                    delete room._id;
                }
                if (my.place != 0) {
                    my.sendError(409);
                }
                $room = new exports.Room(room, getFreeChannel());

                process.send({
                    type: "room-new",
                    target: my.id,
                    room: $room.getData(),
                });
                ROOM[$room.id] = $room;
                spectate = false;
            }
        }
        if ($room) {
            if (spectate) $room.spectate(my, room.password);
            else if (joinWhileGaming) $room.joinWhileGaming(my, room.password);
            else $room.come(my, room.password, password);
        }
    };
    my.leave = (kickVote) => {
        const $room = ROOM[my.place];

        if (my.subPlace) {
            my.pracRoom.go(my);
            if ($room)
                my.send("room", { target: my.id, room: $room.getData() });
            my.publish("user", my.getData());
            if (!kickVote) return;
        }
        if ($room) $room.go(my, kickVote);
    };
    my.setForm = (mode) => {
        const $room = ROOM[my.place];

        if (!$room) return;

        my.form = mode;
        my.ready = false;
        my.publish("user", my.getData());
    };
    my.setTeam = (team) => {
        my.team = team;
        my.publish("user", my.getData());
    };
    my.kick = (target, kickVote) => {
        const $room = ROOM[my.place];
        let len = $room.players.length;

        if (target == null) {
            // 로봇 (이 경우 kickVote는 로봇의 식별자)
            $room.removeAI(kickVote);
            return;
        }
        for (let i in $room.players) {
            if ($room.players[i].robot) len--;
        }
        if (len < 4) kickVote = { target: target, Y: 1, N: 0 };
        if (kickVote) {
            $room.kicked.push(target);
            $room.kickVote = null;
            if (DIC[target]) DIC[target].leave(kickVote);
        } else {
            $room.kickVote = { target: target, Y: 1, N: 0, list: [] };
            for (let i in $room.players) {
                const $c = DIC[$room.players[i]];
                if (!$c) continue;
                if ($c.id == $room.master) continue;

                $c.kickTimer = setTimeout($c.kickVote, 10000, $c, true);
            }
            my.publish("kickVote", $room.kickVote, true);
        }
    };
    my.kickVote = (client, agree) => {
        const $room = ROOM[client.place];

        if (!$room) return;

        const $m = DIC[$room.master];
        if ($room.kickVote) {
            $room.kickVote[agree ? "Y" : "N"]++;
            if (
                $room.kickVote.list.push(client.id) >=
                $room.players.length - 2
            ) {
                if ($room.gaming) return;

                if ($room.kickVote.Y >= $room.kickVote.N)
                    $m.kick($room.kickVote.target, $room.kickVote);
                else
                    $m.publish(
                        "kickDeny",
                        {
                            target: $room.kickVote.target,
                            Y: $room.kickVote.Y,
                            N: $room.kickVote.N,
                        },
                        true
                    );

                $room.kickVote = null;
            }
        }
        clearTimeout(client.kickTimer);
    };
    my.toggle = () => {
        const $room = ROOM[my.place];

        if (!$room) return;
        if ($room.master == my.id) return;
        if (my.form != "J") return;

        my.ready = !my.ready;
        my.publish("user", my.getData());
    };
    my.start = () => {
        const $room = ROOM[my.place];

        if (!$room) return;
        if ($room.master != my.id) return;
        if ($room.players.length < 2) return my.sendError(411);

        $room.ready();
    };
    my.practice = (level) => {
        const $room = ROOM[my.place];
        let pr;

        if (!$room) return;
        if (my.subPlace) return;
        if (my.form != "J") return;

        my.team = 0;
        my.ready = false;
        const ud = my.getData();
        my.pracRoom = new exports.Room($room.getData());
        my.pracRoom.id = $room.id + 1000;
        ud.game.practice = my.pracRoom.id;
        if ((pr = $room.preReady())) return my.sendError(pr);
        my.publish("user", ud);
        my.pracRoom.time /= my.pracRoom.rule.time;
        my.pracRoom.limit = 1;
        my.pracRoom.password = "";
        my.pracRoom.practice = true;
        my.subPlace = my.pracRoom.id;
        my.pracRoom.come(my);
        my.pracRoom.start(level);
        my.pracRoom.game.hum = 1;
    };
    my.setRoom = (room) => {
        const $room = ROOM[my.place];

        if ($room) {
            if (!$room.gaming) {
                if ($room.master == my.id) {
                    $room.set(room);
                    exports.publish(
                        "room",
                        { target: my.id, room: $room.getData(), modify: true },
                        room.password
                    );
                } else {
                    my.sendError(400);
                }
            }
        } else {
            my.sendError(400);
        }
    };
    my.applyEquipOptions = (rw) => {
        var pm = rw.playTime / 60000;

        rw._score = Math.round(rw.score);
        rw._money = Math.round(rw.money);
        rw._rankPoint = Math.round(rw.rankPoint);
        rw._blog = [];
        my.checkExpire();
        for (let i in my.equip) {
            const $obj = SHOP[my.equip[i]];
            if (!$obj) continue;
            if (!$obj.options) continue;
            for (j in $obj.options) {
                if (j == "gEXP") rw.score += rw._score * $obj.options[j];
                else if (j == "hEXP") rw.score += $obj.options[j] * pm;
                else if (j == "gMNY") rw.money += rw._money * $obj.options[j];
                else if (j == "hMNY") rw.money += $obj.options[j] * pm;
                else if (j == "gRPT")
                    rw.rankPoint += rw._rankPoint * $obj.options[j];
                else if (j == "hRPT") rw.rankPoint += $obj.options[j] * pm;
                else continue;
                rw._blog.push("q" + j + $obj.options[j]);
            }
        }
        if (rw.together && my.okgCount > 0) {
            i = 0.05 * my.okgCount;
            j = 0.05 * my.okgCount;
            z = 0.05 * my.okgCount;

            rw.score += rw._score * i;
            rw.money += rw._money * j;
            rw.rankPoint += rw._rankPoint * z;

            rw._blog.push("kgEXP" + i);
            rw._blog.push("kgMNY" + j);
            rw._blog.push("kgRPT" + z);
        }
        rw.score = Math.round(rw.score);
        rw.money = Math.round(rw.money);
        rw.rankPoint = Math.round(rw.rankPoint);
    };
    my.obtain = (k, q, flush) => {
        if (my.guest) return;
        if (my.box[k]) my.box[k] += q;
        else my.box[k] = q;

        my.send("obtain", { key: k, q: q });
        if (flush) my.flush(true);
    };
    my.addFriend = function (id) {
        const fd = DIC[id];

        if (!fd) return;
        my.friends[id] = fd.profile.title || fd.profile.name;
        my.flush(false, false, true);
        my.send("friendEdit", { friends: my.friends });
    };
    my.removeFriend = (id) => {
        DB.users
            .findOne(["_id", id])
            .limit(["friends", true])
            .on(function ($doc) {
                if (!$doc) return;

                let f = $doc.friends;

                delete f[my.id];
                DB.users.update(["_id", id]).set(["friends", f]).on();
            });
        delete my.friends[id];
        my.flush(false, false, true);
        my.send("friendEdit", { friends: my.friends });
    };
};
exports.Room = function (room, channel) {
    var my = this;

    my.id = room.id || _rid;
    my.channel = channel;
    my.opts = {};
    my.master = null;
    my.tail = [];
    my.players = [];
    my.kicked = [];
    my.kickVote = null;

    my.gaming = false;
    my.game = {};

    my.adminRoom = false;

    my.getData = () => {
        const readies = {};
        const pls = [];
        const seq = my.game.seq ? my.game.seq.map(filterRobot) : [];
        let o;

        for (let i in my.players) {
            if ((o = DIC[my.players[i]])) {
                readies[my.players[i]] = {
                    r: o.ready || o.game.ready,
                    f: o.form || o.game.form,
                    t: o.team || o.game.team,
                };
            }
            pls.push(filterRobot(my.players[i]));
        }
        for (let i in my.players) {
            if ((o = DIC[my.players[i]])) {
                if (JSON.stringify(GLOBAL.ADMINS).indexOf(o.id) != -1) {
                    my.adminRoom = true;
                    break;
                } else my.adminRoom = false;
            }
        }
        return {
            id: my.id,
            channel: my.channel,
            title: my.title,
            password: my.password ? true : false,
            limit: my.limit,
            mode: my.mode,
            round: my.round,
            wordLimit: my.wordLimit,
            time: my.time,
            master: my.master,
            players: pls,
            readies: readies,
            gaming: my.gaming,
            admin: my.adminRoom,
            game: {
                round: my.game.round,
                wordLimit: my.game.wordLimit,
                turn: my.game.turn,
                seq: seq,
                title: my.game.title,
                mission: my.game.mission,
                blockWord: my.game.blockWord,
            },
            practice: my.practice ? true : false,
            opts: my.opts,
        };
    };
    my.addAI = (caller) => {
        if (my.players.length >= my.limit) {
            return caller.sendError(429);
        }
        if (my.gaming) {
            return caller.send("error", { code: 416, target: my.id });
        }
        if (!my.rule.ai) {
            return caller.sendError(415);
        }
        my.players.push(new exports.Robot(null, my.id, 2));
        my.export();
    };
    my.setAI = (target, level, team) => {
        for (let i in my.players) {
            if (!my.players[i]) continue;
            if (!my.players[i].robot) continue;
            if (my.players[i].id == target) {
                my.players[i].setLevel(level);
                my.players[i].setTeam(team);
                my.export();
                return true;
            }
        }
        return false;
    };
    my.removeAI = (target, noEx) => {
        for (let i in my.players) {
            if (!my.players[i]) continue;
            if (!my.players[i].robot) continue;
            if (!target || my.players[i].id == target) {
                if (my.gaming) {
                    j = my.game.seq.indexOf(my.players[i]);
                    if (j != -1) my.game.seq.splice(j, 1);
                }
                my.players.splice(i, 1);
                if (!noEx) my.export();
                return true;
            }
        }
        return false;
    };
    my.come = (client) => {
        if (!my.practice) client.place = my.id;

        if (my.players.push(client.id) == 1) {
            my.master = client.id;
        }
        if (Cluster.isWorker) {
            client.ready = false;
            client.team = 0;
            client.cameWhenGaming = false;
            client.form = "J";

            if (!my.practice)
                process.send({
                    type: "room-come",
                    target: client.id,
                    id: my.id,
                });
            my.export(client.id);
        }
    };
    my.spectate = (client, password) => {
        if (!my.practice) client.place = my.id;
        const len = my.players.push(client.id);

        if (Cluster.isWorker) {
            client.ready = false;
            client.team = 0;
            client.cameWhenGaming = true;
            client.form = len > my.limit ? "O" : "S";

            process.send({
                type: "room-spectate",
                target: client.id,
                id: my.id,
                pw: password,
            });
            my.export(client.id, false, true);
        }
    };
    my.joinWhileGaming = (client, password) => {
        client.place = my.id;
        const len = my.players.push(client.id);

        my.game.seq.push(client.id);

        if (Cluster.isWorker) {
            client.ready = true;
            client.team = 0;
            client.cameWhenGaming = true;
            client.form = len > my.limit ? "O" : "J";

            process.send({
                type: "room-joinWhileGaming",
                target: client.id,
                id: my.id,
                pw: password,
            });
            my.export(client.id, false, len > my.limit);
        }
    };
    my.go = (client, kickVote) => {
        let x = my.players.indexOf(client.id);
        let me;

        if (x == -1) {
            client.place = 0;
            if (my.players.length < 1) delete ROOM[my.id];
            return client.sendError(430);
        }
        my.players.splice(x, 1);
        client.game = {};
        if (client.id == my.master) {
            while (my.removeAI(false, true));
            my.master = my.players[0];
        }
        if (DIC[my.master]) {
            DIC[my.master].ready = false;
            if (my.gaming) {
                x = my.game.seq.indexOf(client.id);
                if (x != -1) {
                    if (my.game.seq.length <= 2) {
                        my.game.seq.splice(x, 1);
                        my.roundEnd();
                    } else {
                        me = my.game.turn == x;
                        if (me && my.rule.ewq) {
                            clearTimeout(my.game._rrt);
                            my.game.loading = false;
                            if (Cluster.isWorker) my.turnEnd();
                        }
                        my.game.seq.splice(x, 1);
                        if (my.game.turn > x) {
                            my.game.turn--;
                            if (my.game.turn < 0)
                                my.game.turn = my.game.seq.length - 1;
                        }
                        if (my.game.turn >= my.game.seq.length)
                            my.game.turn = 0;
                    }
                }
            }
        } else {
            if (my.gaming) {
                my.interrupt();
                my.game.late = true;
                my.gaming = false;
                my.game = {};
            }
            delete ROOM[my.id];
        }
        if (my.practice) {
            clearTimeout(my.game.turnTimer);
            client.subPlace = 0;
        } else client.place = 0;

        if (Cluster.isWorker) {
            if (!my.practice) {
                client.socket.close();
                process.send({
                    type: "room-go",
                    target: client.id,
                    id: my.id,
                    removed: !ROOM.hasOwnProperty(my.id),
                });
            }
            my.export(client.id, kickVote);
        }
    };
    my.set = (room) => {
        let ijc;

        my.title = room.title;
        my.password = room.password;
        my.limit = Math.max(
            Math.min(8, my.players.length),
            Math.round(room.limit)
        );
        my.mode = room.mode;
        my.rule = Outer.getRule(room.mode);
        my.round = Math.round(room.round);
        my.wordLimit = room.wordLimit;
        my.time = room.time * my.rule.time;
        if (room.opts && my.opts) {
            for (let i in Const.OPTIONS) {
                const k = Const.OPTIONS[i].name.toLowerCase();
                my.opts[k] = room.opts[k] && my.rule.opts.includes(i);
            }
            if ((ijc = my.rule.opts.includes("ijp"))) {
                const ij = Const[`${my.rule.lang.toUpperCase()}_IJP`];
                my.opts.injpick = (room.opts.injpick || []).filter(function (
                    item
                ) {
                    return ij.includes(item);
                });
            } else my.opts.injpick = [];
        }
        if (!my.rule.ai) {
            while (my.removeAI(false, true));
        }
        for (let i in my.players) {
            if (DIC[my.players[i]]) DIC[my.players[i]].ready = false;
        }
    };
    my.preReady = (teams) => {
        const avTeam = [];
        let j;
        let t = 0;
        let l = 0;

        // 팀 검사
        if (teams) {
            if (teams[0].length) {
                if (
                    teams[1].length > 1 ||
                    teams[2].length > 1 ||
                    teams[3].length > 1 ||
                    teams[4].length > 1
                )
                    return 418;
            } else {
                for (let i = 1; i < 5; i++) {
                    if ((j = teams[i].length)) {
                        if (t) {
                            if (t != j) return 418;
                        } else t = j;
                        l++;
                        avTeam.push(i);
                    }
                }
                if (l < 2) return 418;
                my._avTeam = shuffle(avTeam);
            }
        }
        // 인정픽 검사
        if (!my.rule) return 400;
        if (my.rule.opts.includes("ijp")) {
            if (!my.ijr) return false; // 인정픽 필수 여부
            if (!my.opts.injpick) return 400;
            if (!my.opts.injpick.length) return 413;
            if (
                !my.opts.injpick.every(function (item) {
                    return !Const.IJP_EXCEPT.includes(item);
                })
            )
                return 414;
        }
        return false;
    };

    my.drawingCanvas = (msg) => {
        my.byMaster("drawCanvas", { data: msg.data }, true);
    };
    my.ready = () => {
        const teams = [[], [], [], [], []];
        let i;
        let all = true;
        let len = 0;

        for (i in my.players) {
            if (my.players[i].robot) {
                len++;
                teams[my.players[i].game.team].push(my.players[i]);
                continue;
            }
            if (!DIC[my.players[i]]) continue;
            if (DIC[my.players[i]].form == "S") continue;

            len++;
            teams[DIC[my.players[i]].team].push(my.players[i]);

            if (my.players[i] == my.master) continue;
            if (!DIC[my.players[i]].ready) {
                all = false;
                break;
            }
        }
        if (!DIC[my.master]) return;
        if (len < 2) return DIC[my.master].sendError(411);
        if ((i = my.preReady(teams))) return DIC[my.master].sendError(i);
        if (all) {
            my._teams = teams;
            my.start();
        } else DIC[my.master].sendError(412);
    };
    my.start = (pracLevel) => {
        const now = new Date().getTime();
        let j;
        let o;
        let hum = 0;

        my.gaming = true;
        my.game.late = true;
        my.game.round = 0;
        my.game.turn = 0;
        my.game.seq = [];
        my.game.robots = [];
        if (my.practice) {
            my.game.robots.push(
                (o = new exports.Robot(my.master, my.id, pracLevel))
            );
            my.game.seq.push(o, my.master);
        } else {
            for (let i in my.players) {
                if (my.players[i].robot) {
                    my.game.robots.push(my.players[i]);
                } else {
                    if (!(o = DIC[my.players[i]])) continue;
                    if (o.form != "J") continue;
                    hum++;
                }
                if (my.players[i]) my.game.seq.push(my.players[i]);
            }
            if (my._avTeam) {
                o = my.game.seq.length;
                j = my._avTeam.length;
                my.game.seq = [];
                for (let i = 0; i < o; i++) {
                    var v = my._teams[my._avTeam[i % j]].shift();

                    if (!v) continue;
                    my.game.seq[i] = v;
                }
            } else {
                my.game.seq = shuffle(my.game.seq);
            }
        }
        my.game.mission = null;
        my.game.blockWord = null;
        for (let i in my.game.seq) {
            o = DIC[my.game.seq[i]] || my.game.seq[i];
            if (!o) continue;
            if (!o.game) continue;

            o.playAt = now;
            o.ready = false;
            o.game.score = 0;
            o.game.bonus = 0;
            o.game.item = [
                /*0, 0, 0, 0, 0, 0*/
            ];
            o.game.wpc = [];
        }
        my.game.hum = hum;
        my.getTitle().then((title) => {
            my.game.title = title;
            my.export();
            setTimeout(my.roundReady, 2000);
        });
        my.byMaster("starting", { target: my.id });
        delete my._avTeam;
        delete my._teams;
    };
    my.roundReady = () => {
        if (!my.gaming) return;

        return my.route("roundReady");
    };
    my.interrupt = () => {
        clearTimeout(my.game._rrt);
        clearTimeout(my.game.turnTimer);
        clearTimeout(my.game.hintTimer);
        clearTimeout(my.game.hintTimer2);
        clearTimeout(my.game.qTimer);
    };
    my.roundEnd = (data) => {
        const res = [];
        const users = {};
        const suv = [];
        const teams = [null, [], [], [], []];
        const now = new Date().getTime();
        let sumScore = 0;
        let sumRankPoint = 0;
        let pv = -1;

        my.interrupt();
        for (let i in my.players) {
            const o = DIC[my.players[i]];
            if (!o) continue;
            if (o.cameWhenGaming) {
                o.cameWhenGaming = false;
                if (o.form == "O") {
                    if (!o.admin) {
                        o.sendError(428);
                        o.leave();
                    }
                    continue;
                }
                o.setForm("J");
            }
        }
        for (let i in my.game.seq) {
            const o = DIC[my.game.seq[i]] || my.game.seq[i];
            if (!o) continue;
            if (o.robot) {
                if (o.game.team) teams[o.game.team].push(o.game.score);
            } else if (o.team) teams[o.team].push(o.game.score);
        }
        for (let i = 1; i < 5; i++)
            if ((o = teams[i].length))
                teams[i] = [
                    o,
                    teams[i].reduce(function (p, item) {
                        return p + item;
                    }, 0),
                ];
        for (let i in my.game.seq) {
            const o = DIC[my.game.seq[i]];
            if (!o) continue;
            sumScore += o.game.score;
            sumRankPoint += o.game.score;
            res.push({
                id: o.id,
                score: o.team ? teams[o.team][1] : o.game.score,
                dim: o.team ? teams[o.team][0] : 1,
            });
        }
        res.sort((a, b) => {
            return b.score - a.score;
        });
        const rl = res.length;
        for (let i in res) {
            const o = DIC[res[i].id];
            if (pv == res[i].score) {
                res[i].rank = res[Number(i) - 1].rank;
            } else {
                res[i].rank = Number(i);
            }
            pv = res[i].score;
            const rw = getRewards(
                o.data.rankPoint,
                my.mode,
                o.game.score / res[i].dim,
                o.game.bonus,
                res[i].rank,
                rl,
                sumScore,
                sumRankPoint,
                my.opts,
                o.data.score
            );
            rw.playTime = now - o.playAt;
            o.applyEquipOptions(rw); // 착용 아이템 보너스 적용
            if (rw.together) {
                if (o.game.wpc) {
                    if (!my.opts.returns)
                        o.game.wpc.forEach((item) => {
                            o.obtain("$WPC" + item, 1);
                        }); // 글자 조각 획득 처리
                    /*var list = [
						"광", "복", "절", "대", "한", "독", "립", "만", "세"
						, "유", "관", "순", "열", "안", "중", "근", "의"
						, "사", "운", "동", "가", "일", "제", "강", "점"
						, "기", "헤", "이", "그", "특", "민", "족", "표"
						, "3", "인", "공", "자", "거", "태", "극", "국"
					];
					var luck = Outer.randomInt(200);
					if(luck >= list.length - 1){
						o.game.wpc.forEach(function(item){ o.obtain("$WPC" + item, 1); }); // 글자 조각 획득 처리
					}else{
						o.obtain("$WPE" + list[luck], 1);
					}*/
                    //o.obtain("", 1); // 이벤트 용
                }
                o.onOKG(rw.playTime);
            }
            res[i].reward = rw;
            o.data.score += rw.score || 0;
            o.money += rw.money || 0;
            o.data.rankPoint += rw.rankPoint || 0;
            o.data.record[Const.GAME_TYPE[my.mode]][2] += rw.score || 0;
            o.data.record[Const.GAME_TYPE[my.mode]][3] += rw.playTime;
            if (!my.practice && rw.together) {
                o.data.record[Const.GAME_TYPE[my.mode]][0]++;
                if (res[i].rank == 0)
                    o.data.record[Const.GAME_TYPE[my.mode]][1]++;
            }
            users[o.id] = o.getData();

            suv.push(o.flush(true));
        }
        Lizard.all(suv).then((uds) => {
            const o = {};
            const suv = [];

            for (let i in uds) {
                o[uds[i].id] = { prev: uds[i].prev };
                suv.push(DB.redis.getSurround(uds[i].id));
            }
            Lizard.all(suv).then((ranks) => {
                for (let i in ranks) {
                    if (!o[ranks[i].target]) continue;

                    o[ranks[i].target].list = ranks[i].data;
                }
                my.byMaster(
                    "roundEnd",
                    { result: res, users: users, ranks: o, data: data },
                    true
                );
            });
        });
        my.gaming = false;
        my.export();
        delete my.game.seq;
        delete my.game.wordLength;
        delete my.game.dic;
    };
    my.byMaster = (type, data, nob) => {
        if (DIC[my.master]) DIC[my.master].publish(type, data, nob);
    };
    my.export = (target, kickVote, spectate) => {
        const obj = { room: my.getData() };

        if (!my.rule) return;
        if (target) obj.target = target;
        if (kickVote) obj.kickVote = kickVote;
        if (spectate && my.gaming) {
            if (my.rule.rule == "Classic") {
                if (my.game.chain) obj.chain = my.game.chain.length;
                if (my.game.theme) obj.theme = my.game.theme;
                else my.game.theme = false;
            } else if (my.rule.rule == "Jaqwi") {
                obj.theme = my.game.theme;
                obj.conso = my.game.conso;
            } else if (my.rule.rule == "Crossword") {
                obj.prisoners = my.game.prisoners;
                obj.boards = my.game.boards;
                obj.means = my.game.means;
            }
            obj.spectate = {};
            for (let i in my.game.seq) {
                if ((o = DIC[my.game.seq[i]]))
                    obj.spectate[o.id] = o.game.score;
            }
        }
        if (my.practice) {
            if (DIC[my.master || target])
                DIC[my.master || target].send("room", obj);
        } else {
            exports.publish("room", obj, my.password);
        }
    };
    my.turnStart = (force) => {
        if (!my.gaming) return;

        return my.route("turnStart", force);
    };
    my.readyRobot = (robot) => {
        if (!my.gaming) return;

        return my.route("readyRobot", robot);
    };
    my.turnRobot = (robot, text, data) => {
        if (!my.gaming) return;

        my.submit(robot, text, data);
    };
    my.turnNext = (force) => {
        if (!my.gaming) return;
        if (!my.game.seq) return;
        if (my.opts && my.opts.randomturn) {
            my.game.turn = Math.floor(Math.random() * my.game.seq.length);
        } else {
            my.game.turn = (my.game.turn + 1) % my.game.seq.length;
        }
        my.turnStart(force);
    };
    my.turnEnd = () => {
        return my.route("turnEnd");
    };
    my.submit = (client, text, data) => {
        return my.route("submit", client, text, data);
    };
    my.getScore = (text, delay, ignoreMission) => {
        return my.routeSync("getScore", text, delay, ignoreMission);
    };
    my.getTurnSpeed = (rt) => {
        if (rt < 5000) return 10;
        else if (rt < 11000) return 9;
        else if (rt < 18000) return 8;
        else if (rt < 26000) return 7;
        else if (rt < 35000) return 6;
        else if (rt < 45000) return 5;
        else if (rt < 56000) return 4;
        else if (rt < 68000) return 3;
        else if (rt < 81000) return 2;
        else if (rt < 95000) return 1;
        else return 0;
    };
    my.getTitle = () => {
        return my.route("getTitle");
    };
    my.route = my.routeSync = (func, ...args) => {
        let cf;

        if (!(cf = my.checkRoute(func))) return;
        return cf.apply(my, args);
    };
    my.checkRoute = (func) => {
        let c;

        if (!my.rule) return JLog.warn("Unknown mode: " + my.mode), false;
        if (!(c = Rule[my.rule.rule]))
            return JLog.warn("Unknown rule: " + my.rule.rule), false;
        if (!c[func]) return JLog.warn("Unknown function: " + func), false;
        return c[func];
    };
    my.set(room);
};
