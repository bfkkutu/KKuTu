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

var Cluster = require("cluster");
var File = require('fs');
var WebSocket = require('ws');
var https = require('https');
var HTTPS_Server;
// var Heapdump = require("heapdump");
var KKuTu = require('./kkutu');
var GLOBAL = require("../sub/global.json");
var Const = require("../const");
var JLog = require('../sub/jjlog');
var Secure = require('../sub/secure');
var Recaptcha = require('../sub/recaptcha');
var electron = require("electron");
var WS		 = require("ws");
var Express	 = require("express");
var Exession = require("express-session");
var Redission= require("connect-redis")(Exession);
var Redis	 = require("redis");
var Parser	 = require("body-parser");
var DDDoS	 = require("dddos");
var Server	 = Express();
//볕뉘 수정 구문삭제 (28)
var JLog	 = require("../sub/jjlog");
var WebInit	 = require("../sub/webinit");
var GLOBAL	 = require("../sub/global.json");
var Secure = require('../sub/secure');
//볕뉘 수정
var passport = require('passport');
//볕뉘 수정 끝
var Const	 = require("../const");
var https	 = require('https');
var fs		 = require('fs');

var MainDB;

var Server;
var DIC = {};
var DNAME = {};
var ROOM = {};
var $data = {};

var T_ROOM = {};
var T_USER = {};

var SID;
var WDIC = {};

// Discord Markdown and Emojify
const { toHTML } = require('discord-markdown');
const emoji = require('node-emoji');
// Discord Markdown and Emojify

const DEVELOP = exports.DEVELOP = global.test || false;
const GUEST_PERMISSION = exports.GUEST_PERMISSION = {
	'create': true,
	'enter': true,
	'talk': true,
	'practice': true,
	'ready': true,
	'start': true,
	'invite': true,
	'inviteRes': true,
	'kick': true,
	'kickVote': true,
	'wp': true
};
const ENABLE_ROUND_TIME = exports.ENABLE_ROUND_TIME = [ 5, 10, 30, 60, 90, 120, 150, 200, 300 ];
const ENABLE_FORM = exports.ENABLE_FORM = [ "S", "J" ];
const MODE_LENGTH = exports.MODE_LENGTH = Const.GAME_TYPE.length;
const PORT = process.env['KKUTU_PORT'];

let moment = require('moment'); //moment.js를 사용 (IP Logs 기록)

const log4js = require('log4js');
log4js.configure({
  appenders: { System: { type: 'file', filename: 'joinexit.log' } },
  categories: { default: { appenders: ['System'], level: 'info' } }
});
const logger = log4js.getLogger('System');

File.watchFile("./lib/kkutu.js", () => {
	KKuTu = require('./kkutu');
	JLog.info("kkutu.js is Auto-Updated at {lib/Game/master.js}");
})
File.watchFile("./lib/sub/global.json", () => {
	GLOBAL = require("../sub/global.json");
	JLog.info("global.json is Auto-Updated at {lib/Game/master.js}");
})
File.watchFile("./lib/const.js", () => {
	Const = require("../const");
	JLog.info("const.js is Auto-Updated at {lib/Game/master.js}");
})

process.on('uncaughtException', function(err){
	var text = `:${PORT} [${new Date().toLocaleString()}] ERROR: ${err.toString()}\n${err.stack}\n`;
	
	File.appendFile("/jjolol/KKUTU_ERROR.log", text, function(res){
		if(text.indexOf("$not")==-1){
			JLog.error(`ERROR OCCURRED ON THE MASTER!`);
			console.log(text);
		}
	});
});
function getClientIp(req, res) {
	var clientIp = req.remoteAddress;
	//var clientIp = req.info.connection.remoteAddress;
	if (!clientIp) {
		JLog.warn(`clientIp is empty.   (${clientIp})`)
		return "";
	}
	if (clientIp.startsWith("::ffff:")) return clientIp.substr(7);
	
	return clientIp;
}
function getTempIp($c) {
	var tempIp = $c.remoteAddress;
	if (!tempIp) {
		JLog.warn(`tempIp is empty.   (${tempIp})`)
		return "";
	}
	if (tempIp.startsWith("::ffff:")) return tempIp.substr(7);
	
	return tempIp;
}
function processAdmin(id, value, requestId){
	var cmd, temp, i, j;
	
	value = value.replace(/^(#\w+\s+)?(.+)/, function(v, p1, p2){
		if(p1) cmd = p1.slice(1).trim();
		return p2;
	});
	switch(cmd){
		case "yell":
			KKuTu.publish('yell', { value: value });
			return null;
		case "fix": //점검
			var fix = "곧 서버 점검이 있을 예정입니다. " + value + " 뒤 서버가 종료됩니다.";
			KKuTu.publish('yell', { value: fix });
			return null;
		case "end": //서버 종료
			var end = "서버 종료 시간이 되어 " + value + " 뒤 서버가 종료됩니다.";
			KKuTu.publish('yell', { value: end });
			return null;
		case "error": //서버 에러
			var error = "서버에 문제가 발생하여 " + value + " 뒤 서버가 종료됩니다.";
			KKuTu.publish('yell', { value: error });
			return null;
		case "fixtime": //서버 종료
			var fixtime = value + "에 서버 점검이 있을 예정입니다.";
			KKuTu.publish('yell', { value: fixtime });
			return null;
		case "kick": // 유저 킥
			if(temp = DIC[value]){
				var clientId = temp.id;
				var clientIp = getClientIp(temp);
				//var clientIp = temp.info.connection.remoteAddress;
				
				JLog.info(`[${clientId}](ID) was kicked At [${requestId}]`);
				temp.socket.send('{"type":"error","code":410}');
				temp.socket.close();
			}
			return null;
		case "ban": // 유저 밴
		case "ipban":
			if(temp = DIC[value]){
				var clientId = temp.id;
				var clientIp = getClientIp(temp);
				//var clientIp = temp.info.connection.remoteAddress;
				var IpFilters = JSON.parse(File.readFileSync("./lib/Web/filters/User.json"));
				
				if (IpFilters.ips.indexOf(clientIp) == -1) {
					IpFilters.ips.push(clientIp);
					IpFilters.ids.push(value);
					
					File.writeFile("./lib/Web/filters/User.json", JSON.stringify(IpFilters,null, "\t"), (err) => {
						if(err) return JLog.error(`IP 차단 목록을 작성하는 중에 문제가 발생했습니다. (${err})`)
						
						JLog.info(`[${clientIp}](IP) was banned At [${requestId}]`);
						temp.socket.send(`{"type":'error',"code":410}`);
						temp.socket.close();
					})
				}
			}
			return null;
		case "unban": // 유저 언밴(해제)
		case "unipban":
		case "ipunban":
			if(DIC[id]) DIC[id].send('yell', { value: "해당 기능은 현재 지원하지 않습니다." });
			/*if(temp = DIC[value]){
				var clientId = temp.id;
				var clientIp = getClientIp(temp);
				//var clientIp = temp.info.connection.remoteAddress;
				var IpFilters = JSON.parse(File.readFileSync("./lib/Web/filters/User.json"));
				
				if(IpFilters.ids.indexOf(value) != -1){
					var index = IpFilters.ids.indexOf(value);
					IpFilters.ips.splice(index, 1)
					IpFilters.ids.splice(index, 1)
					
					File.writeFile("./lib/Web/filters/User.json", JSON.stringify(IpFilters,null, "\t"), () => {
						if(err) return JLog.error(`IP 차단 목록을 작성하는 중에 문제가 발생했습니다. (${err})`)
						
						JLog.info(`[${clientIp}](IP) was unbanned At [${requestId}]`);
					})
				}
			}*/
			return null;
		case "warn": // 유저 경고
			if(temp = DIC[value]){
				var thisDate = moment().format("MM월-DD일|HH시-mm분");
				var clientId = temp.id;
				var clientIp = getClientIp(temp);
				//var warnList = JSON.parse(File.readFileSync("../../../"));
				
				if (value.startsWith("guest__"))
					File.appendFileSync(`../../../Warn/log.txt`,`\n[${clientIp}] is Warned.     (${thisDate})`, 'utf8',(err) => {
						if(err) return JLog.error(`경고 목록을 작성하는 중에 문제가 발생했습니다.   (${err})`)
					})
				else
					File.appendFileSync(`../../../Warn/log.txt`,`\n[${clientId}] is Warned.     (${thisDate})`, 'utf8',(err) => {
						if(err) return JLog.error(`경고 목록을 작성하는 중에 문제가 발생했습니다.   (${err})`)
					})
			}
			return null;
		case "tailroom":
			if(temp = ROOM[value]){
				if(T_ROOM[value] == id){
					i = true;
					delete T_ROOM[value];
				}else T_ROOM[value] = id;
				if(DIC[id]) DIC[id].send('tail', { a: i ? "trX" : "tr", rid: temp.id, id: id, msg: { pw: temp.password, players: temp.players } });
			}
			return null;
		case "tailuser":
			if(temp = DIC[value]){
				if(T_USER[value] == id){
					i = true;
					delete T_USER[value];
				}else T_USER[value] = id;
				temp.send('test');
				if(DIC[id]) DIC[id].send('tail', { a: i ? "tuX" : "tu", rid: temp.id, id: id, msg: temp.getData() });
			}
			return null;
		case "dump":
			if(DIC[id]) DIC[id].send('yell', { value: "This feature is not supported..." });
			/*Heapdump.writeSnapshot("/home/kkutu_memdump_" + Date.now() + ".heapsnapshot", function(err){
				if(err){
					JLog.error("Error when dumping!");
					return JLog.error(err.toString());
				}
				if(DIC[id]) DIC[id].send('yell', { value: "DUMP OK" });
				JLog.success("Dumping success.");
			});*/
			return null;
	}
	return value;
}
function checkTailUser(id, place, msg){
	var temp;
	
	if(temp = T_USER[id]){
		if(!DIC[temp]){
			delete T_USER[id];
			return;
		}
		DIC[temp].send('tail', { a: "user", rid: place, id: id, msg: msg });
	}
}
function narrateFriends(id, friends, stat){
	if(!friends) return;
	var fl = Object.keys(friends);
	
	if(!fl.length) return;
	
	MainDB.users.find([ '_id', { $in: fl } ], [ 'server', /^\w+$/ ]).limit([ 'server', true ]).on(function($fon){
		var i, sf = {}, s;
		
		for(i in $fon){
			if(!sf[s = $fon[i].server]) sf[s] = [];
			sf[s].push($fon[i]._id);
		}
		if(DIC[id]) DIC[id].send('friends', { list: sf });
		
		if(sf[SID]){
			KKuTu.narrate(sf[SID], 'friend', { id: id, s: SID, stat: stat });
			delete sf[SID];
		}
		for(i in WDIC){
			WDIC[i].send('narrate-friend', { id: id, s: SID, stat: stat, list: sf });
			break;
		}
	});
}
Cluster.on('message', function(worker, msg){
	var temp;
	
	switch(msg.type){
		case "admin":
			if(DIC[msg.id] && DIC[msg.id].admin) processAdmin(msg.id, msg.value, DIC[msg.id]);
			break;
		case "tail-report":
			if(temp = T_ROOM[msg.place]){
				if(!DIC[temp]) delete T_ROOM[msg.place];
				DIC[temp].send('tail', { a: "room", rid: msg.place, id: msg.id, msg: msg.msg });
			}
			checkTailUser(msg.id, msg.place, msg.msg);
			break;
		case "okg":
			if(DIC[msg.id]) DIC[msg.id].onOKG(msg.time);
			break;
		case "kick":
			if(DIC[msg.target]) DIC[msg.target].socket.close();
			break;
		case "invite":
			if(!DIC[msg.target]){
				worker.send({ type: "invite-error", target: msg.id, code: 417 });
				break;
			}
			if(DIC[msg.target].place != 0){
				worker.send({ type: "invite-error", target: msg.id, code: 417 });
				break;
			}
			if(!GUEST_PERMISSION.invite) if(DIC[msg.target].guest){
				worker.send({ type: "invite-error", target: msg.id, code: 422 });
				break;
			}
			if(DIC[msg.target]._invited){
				worker.send({ type: "invite-error", target: msg.id, code: 419 });
				break;
			}
			DIC[msg.target]._invited = msg.place;
			DIC[msg.target].send('invited', { from: msg.place });
			break;
		case "room-new":
			if(ROOM[msg.room.id] || !DIC[msg.target]){ // 이미 그런 ID의 방이 있다... 그 방은 없던 걸로 해라.
				worker.send({ type: "room-invalid", room: msg.room });
			}else{
				ROOM[msg.room.id] = new KKuTu.Room(msg.room, msg.room.channel);
			}
			break;
		case "room-come":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].come(DIC[msg.target]);
			}else{
				JLog.warn(`Wrong room-come id=${msg.id}&target=${msg.target}`);
			}
			break;
		case "room-spectate":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].spectate(DIC[msg.target], msg.pw);
			}else{
				JLog.warn(`Wrong room-spectate id=${msg.id}&target=${msg.target}`);
			}
			break;
		case "room-go":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].go(DIC[msg.target]);
			}else{
				// 나가기 말고 연결 자체가 끊겼을 때 생기는 듯 하다.
				JLog.warn(`Wrong room-go id=${msg.id}&target=${msg.target}`);
				if(ROOM[msg.id] && ROOM[msg.id].players){
					// 이 때 수동으로 지워준다.
					var x = ROOM[msg.id].players.indexOf(msg.target);
					
					if(x != -1){
						ROOM[msg.id].players.splice(x, 1);
						JLog.warn(`^ OK`);
					}
				}
				if(msg.removed) delete ROOM[msg.id];
			}
			break;
		case "user-publish":
			if(temp = DIC[msg.data.id]){
				for(var i in msg.data){
					temp[i] = msg.data[i];
				}
			}
			break;
		case "room-publish":
			if(temp = ROOM[msg.data.room.id]){
				for(var i in msg.data.room){
					temp[i] = msg.data.room[i];
				}
				temp.password = msg.password;
			}
			KKuTu.publish('room', msg.data);
			break;
		case "room-expired":
			if(msg.create && ROOM[msg.id]){
				for(var i in ROOM[msg.id].players){
					var $c = DIC[ROOM[msg.id].players[i]];
					
					if($c) $c.send('roomStuck');
				}
				delete ROOM[msg.id];
			}
			break;
		case "room-invalid":
			delete ROOM[msg.room.id];
			break;
		default:
			JLog.warn(`Unhandled IPC message type: ${msg.type}`);
	}
});
exports.init = function(_SID, CHAN){
	SID = _SID;
	MainDB = require('../Web/db');
	MainDB.ready = function(){
		JLog.success("Master DB is ready.");
		
		MainDB.users.update([ 'server', SID ]).set([ 'server', "" ]).on();
		if(Const.IS_SECURED) {
			const options = Secure();
			HTTPS_Server = https.createServer(options)
				.listen(global.test ? (Const.TEST_PORT + 416) : process.env['KKUTU_PORT']);
			Server = new WebSocket.Server({server: HTTPS_Server});
		} else {
			Server = new WebSocket.Server({
				port: global.test ? (Const.TEST_PORT + 416) : process.env['KKUTU_PORT'],
				perMessageDeflate: false
			});
		}
		Server.on('connection', function(socket, info){
			var key = info.url.slice(1);
			var $c;
			
			socket.on('error', function(err){
				var ec = err.toString();
				if(ec!=="Error: read ECONNRESET"){ //ws의 문제에 의한 불필요한 에러 로깅을 막기 위함.
					JLog.warn("Error on #" + key + " on ws: " + ec);
				}
			});
			// 웹 서버
			if(info.headers.host.match(/^127\.0\.0\.2:/)){
				if(WDIC[key]) WDIC[key].socket.close();
				WDIC[key] = new KKuTu.WebServer(socket);
				JLog.info(`New web server #${key}`);
				WDIC[key].socket.on('close', function(){
					JLog.alert(`Exit web server #${key}`);
					WDIC[key].socket.removeAllListeners();
					delete WDIC[key];
				});
				return;
			}
			if(Object.keys(DIC).length >= Const.KKUTU_MAX){
				socket.send(`{ "type": "error", "code": "full" }`);
				return;
			}
			MainDB.session.findOne([ '_id', key ]).limit([ 'profile', true ]).on(function($body){
				$c = new KKuTu.Client(socket, $body ? $body.profile : null, key);
				$c.admin = GLOBAL.ADMIN.indexOf($c.id) != -1;
				$c.remoteAddress = info.connection.remoteAddress;
				
				if(DIC[$c.id]){
					DIC[$c.id].sendError(408);
					DIC[$c.id].socket.close();
				}
				if(DEVELOP && !Const.TESTER.includes($c.id)){
					$c.sendError(500);
					$c.socket.close();
					return;
				}
				if($c.guest){
					if(SID != "0"){
						$c.sendError(402);
						$c.socket.close();
						return;
					}
					if(KKuTu.NIGHT){
						$c.sendError(440);
						$c.socket.close();
						return;
					}
				}
				if($c.isAjae === null){
					$c.sendError(441);
					$c.socket.close();
					return;
				}
				$c.refresh().then(function(ref){
					if(ref.result == 200){
						DIC[$c.id] = $c;
						DNAME[($c.profile.title || $c.profile.name).replace(/\s/g, "")] = $c.id;
						MainDB.users.update([ '_id', $c.id ]).set([ 'server', SID ]).on();

						if (($c.guest && GLOBAL.GOOGLE_RECAPTCHA_TO_GUEST) || GLOBAL.GOOGLE_RECAPTCHA_TO_USER) {
							$c.socket.send(JSON.stringify({
								type: 'recaptcha',
								siteKey: GLOBAL.GOOGLE_RECAPTCHA_SITE_KEY
							}));
						} else {
							$c.passRecaptcha = true;

							joinNewUser($c);
						}
					} else {
						$c.send('error', {
							code: ref.result, message: ref.black
						});
						$c._error = ref.result;
						$c.socket.close();
						// JLog.info("Black user #" + $c.id);
					}
				});
			});
		});
		Server.on('error', function (err) {
			var ec = err.toString();
			if(ec!=="Error: read ECONNRESET"){ //ws의 문제에 의한 불필요한 에러 로깅을 막기 위함.
				JLog.warn("Error on ws: " + ec);
			}
		});
		KKuTu.init(MainDB, DIC, ROOM, GUEST_PERMISSION, CHAN);
	};
};

function joinNewUser($c, ip, path) {
	var thisDate = moment().format("MM월-DD일|HH시-mm분");
	var clientIp = getTempIp($c);
	var clientId = $c.id;
	
	$c.send('welcome', {
		id: $c.id,
		guest: $c.guest,
		box: $c.box,
		playTime: $c.data.playTime,
		rankPoint: $c.data.rankPoint,
		okg: $c.okgCount,
		users: KKuTu.getUserList(),
		rooms: KKuTu.getRoomList(),
		friends: $c.friends,
		admin: $c.admin,
		test: global.test,
		caj: $c._checkAjae ? true : false
	});
	narrateFriends($c.id, $c.friends, "on");
	KKuTu.publish('conn', {user: $c.getData()});
	
	logger.info(`New user #` + $c.id + ` IP: ${$c.remoteAddress}`);
	fs.appendFileSync(`../IP-Log/Join_Exit.txt`,`\n#Join:[${$c.remoteAddress}|${$c.id}]     (${thisDate})`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
	})
	JLog.info(`New user #` + $c.id + ` IP: ${$c.remoteAddress}`);
}

KKuTu.onClientMessage = function ($c, msg) {
	if (!msg) return;
	
	if ($c.passRecaptcha) {
		processClientRequest($c, msg);
	} else {
		if (msg.type === 'recaptcha') {
			Recaptcha.verifyRecaptcha(msg.token, $c.remoteAddress, function (success) {
				if (success) {
					$c.passRecaptcha = true;

					joinNewUser($c);

					processClientRequest($c, msg);
				} else {
					JLog.warn(`Recaptcha failed from IP ${$c.remoteAddress}`);

					$c.sendError(447);
					$c.socket.close();
				}
			});
		}
	}
};

function processClientRequest($c, msg) {
	var stable = true;
	var temp;
	var now = (new Date()).getTime();
	
	switch (msg.type) {
		case 'yell':
			if (!msg.value) return;
			if (!$c.admin) return;

			$c.publish('yell', {value: msg.value});
			break;
		case 'refresh':
			$c.refresh();
			break;
		case 'talk':
			if (!msg.value) return;
			if (!msg.value.substr) return;
			if (!GUEST_PERMISSION.talk) if ($c.guest) {
				$c.send('error', {code: 401});
				return;
			}
			msg.value = msg.value.substr(0, 200);
			if ($c.admin) {
				if (!processAdmin($c.id, msg.value)) break;
			}
			checkTailUser($c.id, $c.place, msg);
			if (msg.whisper) {
				msg.whisper.split(',').forEach(v => {
					if (temp = DIC[DNAME[v]]) {
						temp.send('chat', {
							from: $c.profile.title || $c.profile.name,
							profile: $c.profile,
							value: msg.value
						});
					} else {
						$c.sendError(424, v);
					}
				});
			} else {
				var mmsg = markdownEmoji(msg.value);
				$c.chat(mmsg);
			}
			break;
		case 'friendAdd':
			if (!msg.target) return;
			if ($c.guest) return;
			if ($c.id == msg.target) return;
			if (Object.keys($c.friends).length >= 100) return $c.sendError(452);
			if (temp = DIC[msg.target]) {
				if (temp.guest) return $c.sendError(453);
				if ($c._friend) return $c.sendError(454);
				$c._friend = temp.id;
				temp.send('friendAdd', {from: $c.id});
			} else {
				$c.sendError(450);
			}
			break;
		case 'friendAddRes':
			if (!(temp = DIC[msg.from])) return;
			if (temp._friend != $c.id) return;
			if (msg.res) {
				// $c와 temp가 친구가 되었다.
				$c.addFriend(temp.id);
				temp.addFriend($c.id);
			}
			temp.send('friendAddRes', {target: $c.id, res: msg.res});
			delete temp._friend;
			break;
		case 'friendEdit':
			if (!$c.friends) return;
			if (!$c.friends[msg.id]) return;
			$c.friends[msg.id] = (msg.memo || "").slice(0, 50);
			$c.flush(false, false, true);
			$c.send('friendEdit', {friends: $c.friends});
			break;
		case 'friendRemove':
			if (!$c.friends) return;
			if (!$c.friends[msg.id]) return;
			$c.removeFriend(msg.id);
			break;
		case 'enter':
		case 'setRoom':
			if (!msg.title) stable = false;
			if (!msg.limit) stable = false;
			if (!msg.round) stable = false;
			//if (!msg.wordLimit) stable = false;
			if (!msg.time) stable = false;
			if (!msg.opts) stable = false;

			msg.code = false;
			msg.limit = Number(msg.limit);
			msg.mode = Number(msg.mode);
			msg.round = Number(msg.round);
			//msg.wordLimit = Number(msg.wordLimit);
			msg.time = Number(msg.time);

			if (isNaN(msg.limit)) stable = false;
			if (isNaN(msg.mode)) stable = false;
			if (isNaN(msg.round)) stable = false;
			//if (isNaN(msg.wordLimit)) stable = false;
			if (isNaN(msg.time)) stable = false;

			if (stable) {
				if (msg.title.length > 20) stable = false;
				if (msg.password.length > 20) stable = false;
				if (msg.limit < 2 || msg.limit > 8) {
					msg.code = 432;
					stable = false;
				}
				if (msg.mode < 0 || msg.mode >= MODE_LENGTH) stable = false;
				if (msg.round < 1 || msg.round > 10) {
					msg.code = 433;
					stable = false;
				}
				if (msg.wordLimit < 2) {
					msg.code = 434;
					stable = false;
				}else if (msg.wordLimit > 9) {
					msg.code = 434;
					stable = false;
				}
				if (ENABLE_ROUND_TIME.indexOf(msg.time) == -1) stable = false;
			}
			if (msg.type == 'enter') {
				if (msg.id || stable) $c.enter(msg, msg.spectate);
				else $c.sendError(msg.code || 431);
			} else if (msg.type == 'setRoom') {
				if (stable) $c.setRoom(msg);
				else $c.sendError(msg.code || 431);
			}
			break;
		case 'inviteRes':
			if (!(temp = ROOM[msg.from])) return;
			if (!GUEST_PERMISSION.inviteRes) if ($c.guest) return;
			if ($c._invited != msg.from) return;
			if (msg.res) {
				$c.enter({id: $c._invited}, false, true);
			} else {
				if (DIC[temp.master]) DIC[temp.master].send('inviteNo', {target: $c.id});
			}
			delete $c._invited;
			break;
		/* 망할 셧다운제
		case 'caj':
			if(!$c._checkAjae) return;
			clearTimeout($c._checkAjae);
			if(msg.answer == "yes") $c.confirmAjae(msg.input);
			else if(KKuTu.NIGHT){
				$c.sendError(440);
				$c.socket.close();
			}
			break;
		*/
		case 'test':
			checkTailUser($c.id, $c.place, msg);
			break;
		default:
			break;
	}
}

function markdownEmoji(msg){
	var onMissing = function (name) {
		return name;
	};
	var markdowned = toHTML(msg);
	var emojified = emoji.emojify(markdowned, onMissing);
	return emojified;
}

KKuTu.onClientClosed = function($c, code, ip, path){
	delete DIC[$c.id];
	if($c._error != 409) MainDB.users.update([ '_id', $c.id ]).set([ 'server', "" ]).on();
	if($c.profile) delete DNAME[$c.profile.title || $c.profile.name];
	if($c.socket) $c.socket.removeAllListeners();
	if($c.friends) narrateFriends($c.id, $c.friends, "off");
	KKuTu.publish('disconn', { id: $c.id });
	
	
	var thisDate = moment().format("MM월-DD일|HH시-mm분");
	var clientIp = $c.remoteAddress;
	var clientId = $c.id;
	
	logger.info(`Exit #` + $c.id + ` IP: ${$c.remoteAddress}`);
	fs.appendFileSync(`../IP-Log/Join_Exit.txt`,`\n#Exit:[${$c.remoteAddress}|${$c.id}]     (${thisDate})`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
	})
	JLog.info(`Exit #` + $c.id + ` IP: ${$c.remoteAddress}`);
};