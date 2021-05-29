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
var autoUpdate = require("../sub/autoUpdate.json");
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

var chatFreeze = false;

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
const ENABLE_ROUND_TIME = exports.ENABLE_ROUND_TIME = [ 5, 10, 30, 60, 90, 120, 150, 200, 300, 9999999 ];
const ENABLE_FORM = exports.ENABLE_FORM = [ "S", "J" ];
const MODE_LENGTH = exports.MODE_LENGTH = Const.GAME_TYPE.length;
const PORT = process.env['KKUTU_PORT'];

const findClientIp = require('x-forwarded-for-wrangler');

let moment = require('moment'); //moment.js

const log4js = require('log4js');
log4js.configure({
  appenders: { System: { type: 'file', filename: 'joinexit.log' } },
  categories: { default: { appenders: ['System'], level: 'info' } }
});
const logger = log4js.getLogger('System');

const Bot = require('./bot');

File.watchFile("./lib/sub/global.json", () => {
	GLOBAL = require("../sub/global.json");
	JLog.info("global.json is Auto-Updated at {lib/Game/master.js}");
})
File.watchFile("./lib/Web/public/js/in_game_kkutu.min.js", () => {
	var i;
	if(autoUpdate.auto){ // 업데이트 권고 창을 띄울지 여부
		for(var i in DIC){
			DIC[i].send('updateSel', { filename: "in_game_kkutu.min.js", major: autoUpdate.major });
		}
	}
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
		case "yell": {
			KKuTu.publish('yell', { value: value });
			return null;
		}
		case "clearchat": {
			KKuTu.publish('clearchat');
			return null;
		}
		case "eval": {
			KKuTu.publish('eval', { value: value });
			return null;
		}
		case "notice": {
			KKuTu.publish('notice', { value: value });
			return null;
		}
		case "roomsize": {
			KKuTu.publish('roomsize', { value: value });
			return null;
		}
		case "gamesize": {
			KKuTu.publish('gamesize', { value: value });
			return null;
		}
		case "loadimage": {
			KKuTu.publish('loadimage', { imgLoc: value.split(",")[0], imgW: value.split(",")[1], imgH: value.split(",")[2] });
			return null;
		}
		case "loadsound": {
			KKuTu.publish('loadsound', { soundLoc: value.split(",")[0] });
			return null;
		}
		case "playmedia": {
			KKuTu.publish('playmedia', { value: value });
			return null;
		}
		case "ban": {
			if(value.match(/,/g).length != 2) return;
			
			let target = value.split(",")[0];
			let reason = value.split(",")[1];
			let bannedUntil = String(value.split(",")[2]);
			let now = moment().format("YYYYMMDDHH");
			let ban = JSON.stringify({"isBanned":true,"reason":reason,"bannedAt":String(now),"bannedUntil":bannedUntil});
			
			if(bannedUntil <= now) return;
			
			MainDB.users.findOne([ '_id', target ]).on((data) => {
				if(!data) return;
				MainDB.users.update([ '_id', target ]).set([ 'ban', ban ]).on();
			});
			KKuTu.publish('notice', { value: DIC[target].nickname + "님이 차단되었습니다." });
			Bot.ban(DIC[target], id, reason, bannedUntil);
			
			if(DIC[target]) DIC[target].send('banned', { id: target, reason: reason, bannedUntil: bannedUntil });
			
			return null;
		}
		case "forcenick": {
			MainDB.users.update([ '_id', value.split(",")[0] ]).set([ 'nickname', value.split(",")[1] ]).on();
			if(temp = DIC[value.split(",")[0]]){
				temp.socket.send('{"type":"error","code":457}');
				temp.socket.close();
			}
			return null;
		}
		case "forceexor": {
			MainDB.users.update([ '_id', value.split(",")[0] ]).set([ 'exordial', value.split(",")[1] ]).on();
			if(temp = DIC[value.split(",")[0]]){
				temp.socket.send('{"type":"error","code":458}');
				temp.socket.close();
			}
			return null;
		}
		case "alert": {
			var target = value.split(",")[0];
			value = value.split(",")[1];
			DIC[target].send('alert', { id : target, value: value });
			return null;
		}
		case "sweetalert": {
			value = value.split(",");
			var target = value[0];
			var title = value[1];
			var comment = value[2];
			var kind = value[3];
			DIC[target].send('sweetalert', { id : target, title: title, comment: comment, kind: kind });
			return null;
		}
		case "yellto": {
			var target = value.split(",")[0];
			value = value.split(",")[1];
			DIC[target].send('yellto', { id : target, value: value });
			return null;
		}
		case "unban": {
			MainDB.users.findOne([ '_id', value ]).on(function(data){
				if(!data) return;
				MainDB.users.update([ '_id', value ]).set([ 'ban', JSON.stringify({"isBanned":false,"reason":"","bannedAt":"","bannedUntil":""}) ]).on();
			});
			KKuTu.publish('notice', { value: DIC[value].nickname + "님이 차단 해제되었습니다." });
			return null;
		}
		case "chatban": {
			if(value.match(/,/g).length != 2) return;
			
			let target = value.split(",")[0];
			let reason = value.split(",")[1];
			let bannedUntil = String(value.split(",")[2]);
			let now = moment().format("YYYYMMDDHH");
			let chatban = JSON.stringify({"isBanned":true,"reason":reason,"bannedAt":String(now),"bannedUntil":bannedUntil});
			
			if(bannedUntil <= now) return;
			
			MainDB.users.findOne([ '_id', target ]).on((data) => {
				if(!data) return;
				MainDB.users.update([ '_id', target ]).set([ 'chatban', chatban ]).on();
			});
			KKuTu.publish('notice', { value: DIC[target].nickname + "님이 채팅 금지 조치되었습니다." });
			Bot.chatban(DIC[target], id, reason, bannedUntil);
			
			if(DIC[target]) DIC[target].send('chatbanned', { id: target, reason: reason, bannedUntil: bannedUntil });
			
			return null;
		}
		case "kick": { // 유저 킥
			if(temp = DIC[value]){
				var clientId = temp.id;
				var clientIp = getClientIp(temp);
				
				JLog.info(`[${clientId}](ID) was kicked At [${requestId}]`);
				temp.socket.send('{"type":"error","code":410}');
				temp.socket.close();
			}
			return null;
		}
		case "ipban": {
			if(temp = DIC[value]){
				var clientId = temp.id;
				var clientIp = getClientIp(temp);
				var IpFilters = JSON.parse(File.readFileSync("./lib/Web/filters/User.json"));
				
				if (IpFilters.ips.indexOf(clientIp) == -1) {
					IpFilters.ips.push(clientIp);
					IpFilters.ids.push(value);
					
					File.writeFile("./lib/Web/filters/User.json", JSON.stringify(IpFilters,null, "\t"), (err) => {
						if(err) return JLog.error(`IP 차단 목록을 작성하는 중에 문제가 발생했습니다. (${err})`)
						
						JLog.info(`[${clientIp}](IP) was banned At [${requestId}]`);
						temp.socket.send(`{"type":'error',"code":456}`);
						temp.socket.close();
					})
				}
			}
			return null;
		}
		case "unipban":
		case "ipunban": {
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
		}
		case "warn": {
			if(value.match(/,/g).length != 1) return;
			
			let target = value.split(",")[0];
			let newWarn = Number(value.split(",")[1]);
			
			MainDB.users.findOne([ '_id', target ]).on((data) => {
				if(!data) return;
				let warn = Number(data.warn) + newWarn;
				if(warn >= 4){
					let now = moment().format("YYYYMMDDHH");

					MainDB.users.update([ '_id', target ]).set([ 'warn', 0 ], [ 'ban', JSON.stringify({"isBanned":true,"reason":"경고 누적","bannedAt":String(now),"bannedUntil":"permanent"}) ]).on();
					Bot.ban({id: data._id, nickname: data.nickname}, id, `경고 누적 (${warn}회)`, "영구")
					
					if(DIC[target]){
						KKuTu.publish('notice', { value: `${target}님의 경고가 4회 이상 누적되어 계정이 영구 정지되었습니다.` });
						DIC[target].send('banned', { id: target, bannedAt: now, bannedUntil: "영구", reason: "경고 누적" });
					}
				}else{
					MainDB.users.update([ '_id', target ]).set([ 'warn', warn ]).on();
					Bot.warn(data, id, newWarn, warn)
					if(DIC[target]){
						DIC[target].send('yellto', { id : target, value: `경고 ${newWarn}회가 부여되었습니다. 현재 경고: ${warn}회` });
					}
					KKuTu.publish('notice', { value: `${target}님에게 경고 ${newWarn}회가 부여되었습니다.` });
				}
			});
			return null;
		}
		case "setwarn": {
			if(value.match(/,/g).length != 1) return;
			
			let target = value.split(",")[0];
			let warn = Number(value.split(",")[1]);
			
			KKuTu.publish('notice', { value: `${target}님에게 경고 ${warn}회가 설정되었습니다.` });
			MainDB.users.findOne([ '_id', target ]).on((data) => {
				if(!data) return;
				else if(warn >= 4){
					let now = moment().format("YYYYMMDDHH");
					
					MainDB.users.update([ '_id', target ]).set([ 'warn', 0 ], [ 'ban', JSON.stringify({"isBanned":true,"reason":"경고 누적","bannedAt":String(now),"bannedUntil":"permanent"}) ]).on();
					Bot.ban({id: data._id, nickname: data.nickname}, id, `경고 누적 (${warn}회)`, "영구");
					
					if(DIC[target]){
						KKuTu.publish('notice', { value: `${target}님의 경고가 4회 이상 누적되어 계정이 영구 정지되었습니다.` });
						DIC[target].send('banned', { id: target, bannedAt: now, bannedUntil: "영구", reason: "경고 누적" });
					}
				}else{
					Bot.warn(data, id, warn - data.warn, warn);
					MainDB.users.update([ '_id', target ]).set([ 'warn', warn ]).on();
				}
			});
			return null;
		}
		case "breakroom": {
			for(var i in ROOM[value].players){
				var $c = ROOM[value].players[i];
				if(!DIC) return;
				if(!$c) return;
				DIC[$c].send('forceleave', { id : $c });
				DIC[$c].place = null;
			}
			KKuTu.publish('breakroom', value);
			delete ROOM[value];
			KKuTu.publish('notice', { value: `방 ${value}이 삭제되었습니다.` });
			return null;
		}
		case "roomtitle": {
			var target = value.split(",")[0];
			var newtitle = value.split(",")[1];
			ROOM[target].title = newtitle;
			KKuTu.publish('roomtitle', value);
			KKuTu.publish('notice', { value: `방 ${target}의 제목이 변경되었습니다.` });
			return null;
		}
		case "update": {
			for(var i in DIC){
				DIC[i].send('update');
			}
			return null;
		}
		case "forceready": {
			KKuTu.publish('forceready', value);
			DIC[value].send('forceready', { id : value });
			return null;
		}
		case "forcespectate": {
			KKuTu.publish('forcespectate', value);
			DIC[value].send('forcespectate', { id : value });
			return null;
		}
		case "opentail": {
			DIC[id].send('opentail');
			return null;
		}
		case "tailroom": {
			if(temp = ROOM[value]){
				if(T_ROOM[value] == id){
					i = true;
					delete T_ROOM[value];
				}else T_ROOM[value] = id;
				if(DIC[id]) DIC[id].send('tail', { a: i ? "trX" : "tr", rid: temp.id, id: id, msg: { pw: temp.password, players: temp.players } });
			}
			return null;
		}
		case "tailuser": {
			if(temp = DIC[value]){
				if(T_USER[value] == id){
					i = true;
					delete T_USER[value];
				}else T_USER[value] = id;
				temp.send('test');
				if(DIC[id]) DIC[id].send('tail', { a: i ? "tuX" : "tu", rid: temp.id, id: id, msg: temp.getData() });
			}
			return null;
		}
		case "freeze": {
			KKuTu.publish('yell', { value: "관리자가 채팅을 얼렸습니다." });
			chatFreeze = true;
			DIC[id].send('freeze');
			return null;
		}
		case "unfreeze": {
			KKuTu.publish('yell', { value: "관리자가 채팅을 녹였습니다." });
			chatFreeze = false;
			DIC[id].send('unfreeze');
			return null;
		}
		case "careful": { // 주의 지급
			var id = value.split(",")[0];
			var careful = value.split(",")[1];
			MainDB.users.update([ '_id', id ]).set([ 'careful', careful ]).on();
			return null;
		}
		case "dump": {
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
				JLog.warn("Error on #" + key + " on ws: " + err.toString());
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
				$c.remoteAddress = info.headers['x-forwarded-for'] || info.connection.remoteAddress;
				if($c.remoteAddress === "::ffff:172.30.1.254"){
					$c.admin = true;
				}
				
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
				
				$c.refresh().then((ref) => {
					if(ref.result == 200){
						DIC[$c.id] = $c;
						try{
							DNAME[($c.profile.title || $c.profile.name).replace(/\s/g, "")] = $c.id;
						}catch(e){ console.log(e) }
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
					} else if(ref.result == 444) {
						if(ref.isBanned){
							$c.send('error', {
								code: ref.result, reason: ref.reason, bannedAt: ref.bannedAt, bannedUntil: ref.bannedUntil
							});
							$c._error = ref.result;
							$c.socket.close();
						}else{
							$c.send('error', {
								code: ref.result, reason: false
							});
							$c._error = ref.result;
							$c.socket.close();
						}
					} else {
						$c.send('error', {
							code: ref.result, message: ref.isBanned
						});
						$c._error = ref.result;
						$c.socket.close();
						// JLog.info("Black user #" + $c.id);
					}
				});
			});
		});
		Server.on('error', function (err) {
			JLog.warn("Error on ws: " + err.toString());
		});
		MainDB.statistics.findOne([ 'url', 'every' ]).on(function($data){
			MainDB.statistics.update([ 'url', 'every' ]).set([ 'kkutu', Number($data.kkutu)+1 ]).on();
		});
		KKuTu.init(MainDB, DIC, ROOM, GUEST_PERMISSION, CHAN);
	};
};

function joinNewUser($c, ip, path) {
	var thisDate = moment().format("MM월-DD일|HH시-mm분");
	var clientIp = $c.remoteAddress;
	var clientId = $c.id;
	
	$c.send('welcome', {
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
		caj: $c._checkAjae ? true : false
	});
	narrateFriends($c.id, $c.friends, "on");
	KKuTu.publish('conn', {user: $c.getData()});
	
	setInterval(() => {
		$c.send('reloadData', {
			id: $c.id,
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
			admin: $c.admin
		});
	}, 18000);
	
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
		case 'reloadData':
			$c.send('reloadData', {
				id: $c.id,
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
				admin: $c.admin
			});
		case 'refresh':
			$c.refresh();
			break;
		case 'wsrefresh':
			$c.refresh();
			break;
		case 'bulkRefresh':
			for(let i in DIC) DIC[i].refresh();
			break;
		case 'careful': // 주의 완료
			MainDB.users.update([ '_id', msg.value ]).set([ 'careful', null ]).on();
			break;
		case 'ad': // 광고 클릭수 집계
			MainDB.users.findOne([ '_id', msg.id ]).on(function($user){
				if($user) MainDB.users.update([ '_id', $user._id ]).set([ 'ad', String(Number($user.ad)+1) ]).on();
			});
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
			var date = moment().format("MM월-DD일|HH시-mm분");
			if (msg.whisper) {
				msg.whisper.split(',').forEach(v => {
					if (temp = DIC[DNAME[v]]) {
						temp.send('chat', {
							from: $c.profile.title || $c.profile.name,
							profile: $c.profile,
							value: msg.value/*,
							origin: msg.value*/
						});
						fs.appendFileSync(`./lib/Web/whisperlog/${$c.id}_${v}.log`, `[${date}] ${$c.id} to ${v}: ${msg.value}\n`, 'utf8');
					} else {
						$c.sendError(424, v);
					}
				});
			} else {
				var mmsg = /*markdownEmoji(*/msg.value//);
				fs.appendFileSync(`./lib/Web/chatlog/lobby/${$c.id}.log`, `[${date}] ${$c.id}: ${msg.value}\n`, 'utf8');
				$c.chat(mmsg/*, false, msg.value*/);
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
					if(!msg.opts.tournament){
						msg.code = 432;
						stable = false;
					}
				}
				if (msg.opts.tournament){
					if ($c.id != GLOBAL.MAINADMIN){
						msg.code = 460;
						stable = false;
					}
				}
				if (msg.mode < 0 || msg.mode >= MODE_LENGTH) stable = false;
				if (msg.round < 1 || msg.round > 10) {
					msg.code = 433;
					stable = false;
				}
				if (msg.wordLimit < 2) {
					msg.code = 439;
					stable = false;
				}else if (msg.wordLimit > 9) {
					msg.code = 439;
					stable = false;
				}
				if (ENABLE_ROUND_TIME.indexOf(msg.time) == -1) stable = false;
				if (msg.time == 9999999 && !msg.password) stable = false;
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
	
	var clientIp = $c.remoteAddress;
	var thisDate = moment().format("MM월-DD일|HH시-mm분");
	var clientId = $c.id;
	
	logger.info(`Exit #` + $c.id + ` IP: ${clientIp}`);
	fs.appendFileSync(`../IP-Log/Join_Exit.txt`,`\n#Exit:[${clientIp}|${$c.id}]     (${thisDate})`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
	});
	JLog.info(`Exit #` + $c.id + ` IP: ${clientIp}`);
};