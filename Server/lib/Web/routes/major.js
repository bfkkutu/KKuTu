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

var Web		 = require("request");
var MainDB	 = require("../db");
var JLog	 = require("../../sub/jjlog");
var Const	 = require("../../const");
var File	 = require("fs");
var Outer    = require("../../sub/outer");

let moment = require('moment'); //moment.js

const sha256 = require('sha256');

function obtain($user, key, value, term, addValue){
	var now = (new Date()).getTime();
	
	if(term){
		if($user.box[key]){
			if(addValue) $user.box[key].value += value;
			else $user.box[key].expire += term;
		}else $user.box[key] = { value: value, expire: Math.round(now * 0.001 + term) }
	}else{
		$user.box[key] = ($user.box[key] || 0) + value;
	}
}
function consume($user, key, value, force){
	var bd = $user.box[key];
	
	if(bd.value){
		// 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
		if((bd.value -= value) <= 0){
			if(force || !bd.expire) delete $user.box[key];
		}
	}else{
		if(($user.box[key] -= value) <= 0) delete $user.box[key];
	}
}
function translateToPromise(query) { 
	return new Promise((res, rej) => {
		query.on((doc) => { res(doc); }, null, (err) => { rej(err); });
	});
}
function getDirectories(path, callback) {
	/*File.readdir(path, function (err, content) {
		if (err) return callback(err)
		callback(false, content)
	});*/
	var files = null;
	try{
		files = File.readdirSync(path);
	}catch(e){
		return callback(e)
	}
	return callback(false, files)
}

exports.run = function(Server, page){

Server.get("/box", function(req, res){
	if(req.session.profile){
		/*if(Const.ADMIN.indexOf(req.session.profile.id) == -1){
			return res.send({ error: 555 });
		}*/
	}else{
		return res.send({ error: 400 });
	}
	MainDB.users.findOne([ '_id', req.session.profile.id ]).limit([ 'box', true ]).on(function($body){
		if(!$body){
			res.send({ error: 400 });
		}else{
			res.send($body.box);
		}
	});
});
Server.get("/help", function(req, res){
	page(req, res, "help", {
		'KO_INJEONG': Const.KO_INJEONG
	});
});
Server.get("/ranking", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.redis.getSurround(id, 15).then(function($body){
			res.send($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.redis.getPage(pg, 15).then(function($body){
			res.send($body);
		});
	}
});
Server.get("/rpRanking", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.rRedis.getSurround(id, 15).then(function($body){
			res.send($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.rRedis.getPage(pg, 15).then(function($body){
			res.send($body);
		});
	}
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
Server.post("/clan/create", function(req, res){
	function generateClanID(){
		var id = "";
		for(var i=0; i<9; i++) id += Outer.random(0,9);
		return id;
	}
	
	var newClanID = generateClanID();
	
	MainDB.clans.findOne([ '_id', newClanID ]).on(function($ec){
		if($ec){
			newClanID = generateClanID();
			return;
		}
	});
	
	MainDB.users.findOne([ '_id', req.body.me ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			var postM = $user.money - 5000;
			
			if(postM < 0) return res.send({ message: "MONEYFAIL" });
			else {
				MainDB.users.update([ '_id', req.body.me ]).set(
					[ 'money', postM ]
				).on(function($fin){
					JLog.log(`[CLAN PURCHASED] ${req.body.name} by ${req.body.me}`);
					MainDB.users.update([ '_id', req.body.me ]).set([ 'clan', newClanID ]).on();
					MainDB.clans.insert([ '_id', newClanID ], [ 'users', JSON.parse(`{"${req.body.me}":2}`) ], [ 'name', req.body.name ], [ 'blacklist', JSON.parse(`{"${req.body.me}":false}`) ], [ 'password', sha256.x2(req.body.password) ], [ 'uname', JSON.parse(`{"${req.body.me}":"${$user.nickname}"}`) ]).on();
					return res.send({ message: "OK" });
				});
			}
		}
	});
});
Server.post("/clan/remove", function(req, res){
	MainDB.clans.findOne([ '_id', req.body.id ]).on(function($ec){
		if(!$ec) return res.send({ message: "FAIL" });
		else if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
		else{
			if($ec.users[req.body.me] == 2){
				MainDB.users.find([ 'clan', req.body.id ]).on(function($res){
					var i;
					for(i in $res) MainDB.users.update([ '_id', $res[i]._id ]).set([ 'clan', null ]).on();
					MainDB.clans.remove([ '_id', req.body.id ]).on();
				});
				return res.send({ message: "OK" });
			}else return res.sendStatus(403);
		}
	});
});
Server.post("/clan/extend", function(req, res){
	MainDB.clans.findOne([ '_id', req.body.id ]).on(function($ec){
		if(!$ec) return res.send({ message: "FAIL" });
		if($ec.max >= 50) return res.send({ message: "MAX" });
		if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
		if($ec.users[req.body.me] == 0) return res.send({ message: "PERMISSIONFAIL" });
		MainDB.users.findOne([ '_id', req.body.me ]).on(function($user){
			if(!$user) return res.send({ message: "FAIL" });
			else {
				var postM = $user.money - 5000;
			
				if(postM < 0) return res.send({ message: "MONEYFAIL" });
				else {
					MainDB.users.update([ '_id', req.body.me ]).set(
						[ 'money', postM ]
					).on(function($fin){
						JLog.log(`[CLAN EXTEND PURCHASED] New Max ${Number($ec.max)+10} for ${$ec.clanname}`);
						MainDB.clans.update([ '_id', req.body.id ]).set([ 'max', Number($ec.max) + 10 ]).on();
						return res.send({ message: "OK" });
					});
				}
			}
		});
	});
});
Server.post("/clan/user/add", function(req, res){
	MainDB.clans.findOne([ '_id', req.body.id ]).on(function($ec){
		if(!$ec) return res.send({ message: "FAIL" });
		else{
			if(Object.keys($ec.users).length == $ec.max) return res.send({ message: "USERLIMITFAIL" });
			else if($ec.blacklist[req.body.me]) return res.send({ message: "BANNED" });
			else{
				$ec.users[`${req.body.me}`] = 0;
				MainDB.users.update([ '_id', req.body.me ]).set([ 'clan', $ec._id ]).on();
				MainDB.users.findOne().on(function($user){
					$ec.uname[req.body.me] = $user.nickname;
					MainDB.clans.update([ '_id', req.body.id ]).set([ 'users', $ec.users ], [ 'uname', $ec.uname ]).on();
				});
				return res.send({ message: "OK" });
			}
		}
	});
});
Server.post("/clan/user/remove", function(req, res){
	MainDB.users.findOne([ '_id', req.body.me ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			MainDB.clans.findOne([ '_id', req.body.id ]).on(function($ec){
				if(!$ec) return res.send({ message: "FAIL" });
				else if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
				else{
					delete $ec.users[`${req.body.me}`];
					delete $ec.uname[`${req.body.me}`];
					MainDB.users.update([ '_id', req.body.me ]).set([ 'clan', null ]).on();
					MainDB.clans.update([ '_id', req.body.id ]).set([ 'users', $ec.users ]).on();
				}
			});
			return res.send({ message: "OK" });
		}
	});
});
Server.post("/clan/user/leave", function(req, res){
	MainDB.users.findOne([ '_id', req.body.me ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			MainDB.clans.findOne([ '_id', $user.clan ]).on(function($ec){
				delete $ec.users[`${req.body.me}`];
				delete $ec.uname[`${req.body.me}`];
				MainDB.users.update([ '_id', req.body.me ]).set([ 'clan', null ]).on();
				MainDB.clans.update([ '_id', req.body.id ]).set([ 'users', $ec.users ]).on();
			});
			return res.send({ message: "OK" });
		}
	});
});
Server.post("/clan/user/ban", function(req, res){
	MainDB.users.findOne([ '_id', req.body.me ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			MainDB.clans.findOne([ '_id', $user.clan ]).on(function($ec){
				if(!$ec) return res.send({ message: "FAIL" });
				else if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
				else if($ec.users[req.body.me] == 0) return res.send({ message: "PERMISSIONFAIL" });
				else{
					$ec.blacklist[req.body.id] = true;
					MainDB.clans.update([ '_id', $user.clan ]).set([ 'blacklist', $ec.blacklist ]).on();
				}
			});
			return res.send({ message: "OK" });
		}
	});
});
Server.post("/clan/user/unban", function(req, res){
	MainDB.users.findOne([ '_id', req.body.me ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			MainDB.clans.findOne([ '_id', $user.clan ]).on(function($ec){
				if(!$ec) return res.send({ message: "FAIL" });
				else if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
				else if($ec.users[req.body.me] == 0) return res.send({ message: "PERMISSIONFAIL" });
				else{
					$ec.blacklist[req.body.id] = false;
					MainDB.clans.update([ '_id', $user.clan ]).set([ 'blacklist', $ec.blacklist ]).on();
				}
			});
			return res.send({ message: "OK" });
		}
	});
});
Server.post("/clan/user/promote", function(req, res){
	MainDB.users.findOne([ '_id', req.body.id ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			MainDB.clans.findOne([ '_id', $user.clan ]).on(function($ec){
				if(!$ec) return res.send({ message: "FAIL" });
				else if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
				else if($ec.users[req.body.id] != 0) return res.send({ message: "PERMISSIONFAIL" });
				else{
					$ec.users[`${req.body.id}`] = 1;
					MainDB.clans.update([ '_id', $ec._id ]).set([ 'users', $ec.users ]).on();
				}
			});
			return res.send({ message: "OK" });
		}
	});
});
Server.post("/clan/user/demote", function(req, res){
	MainDB.users.findOne([ '_id', req.body.id ]).on(function($user){
		if(!$user) return res.send({ message: "FAIL" });
		else{
			MainDB.clans.findOne([ '_id', $user.clan ]).on(function($ec){
				if(!$ec) return res.send({ message: "FAIL" });
				else if($ec.password != sha256.x2(req.body.password)) return res.send({ message: "PASSWORDFAIL" });
				else if($ec.users[req.body.id] != 1) return res.send({ message: "PERMISSIONFAIL" });
				else{
					$ec.users[`${req.body.id}`] = 0;
					MainDB.clans.update([ '_id', $ec._id ]).set([ 'users', $ec.users ]).on();
				}
			});
			return res.send({ message: "OK" });
		}
	});
});
Server.get("/clan/user", function(req, res){ // 유저의 클랜 정보 알아내기
	MainDB.users.findOne([ '_id', req.query.id ]).on(function($user){
		if($user.clan == undefined || $user.clan == null) return res.send({ _id: undefined, name: undefined });
		else{
			MainDB.clans.findOne([ '_id', $user.clan ]).on(function($ec){
				if(!$ec) return res.send({ _id: undefined, name: undefined });
				return res.send($ec);
			});
		}
	});
});
Server.get("/clan/list", function(req, res){
	MainDB.clans.find().on(function($ec){
		if(!$ec) return res.send({ message: "FAIL" });
		else{
			return res.send({ list: $ec });
		}
	});
});
/*Server.post("/clan", function(req, res){
	var query = req.body;
	
	if(query.type == "create"){
		var getClanID = {};
		getClanID.random = function(n1, n2) {
			return parseInt(Math.random() * (n2 -n1 +1)) + n1;
		};
		getClanID.authNo= function(n) {
			var value = "";
			for(var i=0; i<n; i++){
				value += getClanID.random(0,9);
			}
			return value;
		};
		var newClanID = getClanID.authNo(9);
		MainDB.users.findOne([ '_id', query.id ]).on(function($ec){
			if(!$ec) return res.send({ message: "FAIL" });
			else{
				var postM = $ec.money - 5000;
				
				if(postM < 0) return res.send({ message: "MONEYFAIL" });
				else {
					MainDB.users.update([ '_id', query.id ]).set(
						[ 'money', postM ]
					).on(function($fin){
						JLog.log(`[CLAN PURCHASED] ${query.clanname} by ${query.id}`);
						MainDB.users.update([ '_id', query.id ]).set([ 'clan', newClanID ]).on();
						MainDB.clans.insert([ 'clanid', newClanID ], [ 'users', JSON.parse(`{"${query.id}":0}`) ], [ 'clanname', query.clanname ]).on();
						return res.send({ message: "OK" });
					});
				}
			}
		});
	}else if(query.type == "delete"){
		MainDB.clans.findOne([ 'clanid', query.id ]).on(function($ec){
			if(!$ec) return res.send({ message: "FAIL" });
			if(!$ec.clanid) return res.send({ message: "FAIL" });
			else{
				MainDB.users.find([ 'clan', query.id ]).on(function($res){
					var i;
					for(i in $res){
						MainDB.users.update([ '_id', $res[i]._id ]).set([ 'clan', null ]).on();
					}
					MainDB.clans.remove([ 'clanid', query.id ]).on();
				});
				return res.send({ message: "OK" });
			}
		});
	}else if(query.type == "adduser"){
		MainDB.clans.findOne([ 'clanid', query.clanid ]).on(function($ec){
			if(!$ec) return res.send({ message: "FAIL" });
			if(!$ec.clanid) return res.send({ message: "FAIL" });
			else{
				if(Object.keys($ec.users).length >= 10) return res.send({ message: "USERLIMITFAIL" });
				else{
					$ec.users[`${query.userid}`] = parseInt(query.userp); // userp: user permission
					MainDB.users.update([ '_id', query.userid ]).set([ 'clan', query.clanid ]).on();
					MainDB.clans.update([ 'clanid', query.clanid ]).set([ 'users', $ec.users ]).on();
					return res.send({ message: "OK" });
				}
			}
		});
	}else if(query.type == "removeuser"){
		MainDB.users.findOne([ '_id', query.userid ]).on(function($ec){
			if(!$ec) return res.send({ message: "FAIL" });
			if($ec.clan !== query.clanid) return res.send({ message: "FAIL" });
			else{
				MainDB.clans.findOne([ 'clanid', query.clanid ]).on(function($data){
					delete $data.users[`${query.userid}`]
					MainDB.users.update([ '_id', query.userid ]).set([ 'clan', null ]).on();
					MainDB.clans.update([ 'clanid', query.clanid ]).set([ 'users', $data.users ]).on();
				});
				return res.send({ message: "OK" });
			}
		});
	}else if(query.type == "getclan"){
		MainDB.users.findOne([ '_id', query.id ]).on(function($ec){
			if($ec.clan == undefined || $ec.clan == null) return res.send({ name: undefined });
			else{
				MainDB.clans.findOne([ 'clanid', $ec.clan ]).on(function($des){
					if(!$des) return res.send({ name: undefined });
					return res.send({ name: $des.clanname, id: $des.clanid, users: $des.users, score: $des.clanscore });
				});
			}
		});
	}else if(query.type == "promote"){
		MainDB.users.findOne([ '_id', query.id ]).on(function($ec){
			if(!$ec) return res.send({ message: "FAIL" });
			else if(Number(query.perm) > 2) return res.send({ message: "FAIL" });
			else if(typeof Number(query.perm) !== "number") return res.send({ message: "FAIL" });
			else{
				MainDB.clans.findOne([ 'clanid', $ec.clan ]).on(function($data){
					$data.users[`${query.id}`] = Number(query.perm);
					MainDB.clans.update([ 'clanid', $ec.clan ]).set([ 'users', $data.users ]).on();
				});
				return res.send({ message: "OK" });
			}
		});
	}
});*/
Server.post("/report", function(req, res){
	if(!req.body.target) return res.send({ error: 404 });
	else if(!req.body.submitter) return res.send({ error: 404 });
	else if(!req.body.reason) return res.send({ error: 404 });
	var target = req.body.target;
	var submitter = req.body.submitter;
	var reason = req.body.reason;
	var date = moment().format('YYYY_MM_DD_HH_mm');
	File.writeFileSync(`./lib/Web/report/${target}_${date}.json`,`{"target":"${target}","submitter":"${submitter}","date":"${date}","reason":"${reason}","compt":false}`, 'utf8',(err) => {
		if (err) return res.send({ error: 404 });
	});
});
Server.post("/inquire", function(req, res){
	if(!req.body.inquirer) return res.send({ error: 404 });
	
	var date = moment().format('YYYY_MM_DD_HH_mm');
	var data = {
		inquiry: {
			"submitter": (req.body.inquirer || req.body.sender),
			"nickname": req.body.nickname,
			"date": date,
			"title": req.body.title,
			"body": req.body.data
		},
		answer: {
			"answered": false,
			"submitter": "",
			"nickname": "",
			"date": "",
			"body": ""
		}
	};
	
	File.writeFileSync(`./lib/Web/inquire/${req.body.inquirer}_${date}.json`,JSON.stringify(data), 'utf8',(err) => {
		if (err) return res.send({ error: 404 });
	});
	return res.send({ result: 200 });
});
Server.get("/inquire", async function(req, res){
	var mine = [];
	var inquiries = [];
	async function* asyncGenerator(num) {
		let i = 0;
		while (i < num) {
			yield i++;
		}
	}
	await getDirectories('./lib/Web/inquire', async function (err, files) {
		for await(let i of asyncGenerator(files.length)){
			if(files[i].includes(req.query.id)){
				mine.push(files[i]);
			}else continue;
		}
	});
	for await(let i of asyncGenerator(mine.length)){
		var inquiry = File.readFileSync(`./lib/Web/inquire/${mine[i]}`, 'utf8');
		inquiries.push(inquiry);
	}
	return res.send(inquiries);
});
Server.post("/warn", function(req, res){
	if(!req.body.target) return res.send({ error: 404 });
	else if(!req.body.warn) return res.send({ error: 404 });
	var target = req.body.target;
	var warn = Number(req.body.warn);
	var date = moment().format("YYYYMMDDHHmmss");
	MainDB.users.findOne([ '_id', target ]).on(function($user){
		if(!$user) return res.send({ error: 404 });
		else if(!$user.bandate) return res.send({ error: 404 });
		else if(!$user.warn) return res.send({ error: 404 });
		else if($user.warn + warn >= 4){
			MainDB.users.update([ '_id', target ]).set([ 'warn', 0 ]).on();
			MainDB.users.update([ '_id', target ]).set([ 'black', "경고 누적" ]).on();
			MainDB.users.update([ '_id', target ]).set([ 'bandate', 99999999999999 ]).on();
		}else{
			MainDB.users.update([ '_id', target ]).set([ 'warn', Number($user.warn) + warn ]).on();
		}
	});
});
Server.get("/getwarn", function(req, res){
	if(!req.query.target) return res.send({ error: 404 });
	var target = req.query.target;
	MainDB.users.findOne([ '_id', target ]).on(function($user){
		if(!$user) return res.send({ error: 404 });
		else if(!$user.warn) return res.send({ error: 404 });
		else return res.send({ message: $user.warn });
	});
});
Server.get("/getid", function(req, res){
	if(!req.query.target) return res.send({ error: 404 });
	var target = req.query.target;
	MainDB.users.findOne([ 'nickname', target ]).on(function($user){
		if(!$user) return res.send({ error: 404 });
		else if(!$user._id) return res.send({ error: 404 });
		else return res.send({ id: $user._id });
	});
});
Server.get("/injeong/:word", function(req, res){
	if(!req.session.profile) return res.send({ error: 402 });
	var word = req.params.word;
	var theme = req.query.theme;
	var now = Date.now();
	
	if(now - req.session.injBefore < 2000) return res.send({ error: 429 });
	req.session.injBefore = now;
	
	MainDB.kkutu['ko'].findOne([ '_id', word.replace(/[^가-힣0-9]/g, "") ]).on(function($word){
		if($word) return res.send({ error: 409 });
		MainDB.kkutu_injeong.findOne([ '_id', word ]).on(function($ij){
			if($ij){
				if($ij.theme == '~') return res.send({ error: 406 });
				else return res.send({ error: 403 });
			}
			Web.get("https://namu.moe/w/" + encodeURI(word), function(err, _res){
				if(err) return res.send({ error: 400 });
				else if(_res.statusCode != 200) return res.send({ error: 405 });
				MainDB.kkutu_injeong.insert([ '_id', word ], [ 'theme', theme ], [ 'createdAt', now ], [ 'writer', req.session.profile.id ]).on(function($res){
					res.send({ message: "OK" });
				});
			});
		});
	});
});
Server.get("/cf/:word", function(req, res){
	var ev = req.query.e;
	res.send(getCFRewards(req.params.word, Number(req.query.l || 0), req.query.b == "1", ev));
});
Server.get("/shop", function(req, res){
	MainDB.kkutu_shop.find().limit([ 'cost', true ], [ 'term', true ], [ 'group', true ], [ 'options', true ], [ 'updatedAt', true ]).on(function($goods){
		res.json({ goods: $goods });
	});
	// res.json({ error: 555 });
});

// POST
Server.post("/updateme", async function (req, res) {
	var nickname = req.body.nickname ? req.body.nickname : false;
	var exordial = req.body.exordial ? req.body.exordial : false;
	var verified;
	
	if (req.session.profile) {
		if(exordial) MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'exordial', exordial.slice(0, 100) ]).on();
		else if(req.body.exordial == "") MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'exordial', '' ]).on();
		
		if(nickname != ""){
			verified = await translateToPromise(MainDB.users.findOne([ 'nickname', nickname.slice(0, 14) ]));
			if(verified) return res.send({ error: 600 });
			else MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'nickname', nickname.slice(0, 14) ]).on();
		}
		return res.send({ result: 200 });
    } else return res.send({ error: 400 });
});
/*Server.post("/exordial", function(req, res){
var text = req.body.data || "";

if(req.session.profile){
				text = text.slice(0, 100);
MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'exordial', text ]).on(function($res){
res.send({ text: text });
				});
		}else res.send({ error: 400 });
});
Server.post("/nickname", function (req, res) {
	var text = req.body.data || "";

	if (req.session.profile) {
		text = text.slice(0, 10);
		MainDB.users.findOne([ 'nickname', text ]).on(function($user){
			if($user) return res.send({ error: 600 });
			else{ 
				MainDB.users.update(['_id', req.session.profile.id]).set(['nickname', text]).on(function ($res) {
					return res.send({ text: text });
				});
			}
		});
    } else return res.send({ error: 400 });
});*/
Server.post("/buy/:id", function(req, res){
	if(req.session.profile){
		var uid = req.session.profile.id;
		var gid = req.params.id;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).on(function($item){
			if(!$item) return res.json({ error: 400 });
			if($item.cost < 0) return res.json({ error: 400 });
			MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
				if(!$user) return res.json({ error: 400 });
				if(!$user.box) $user.box = {};
				var postM = $user.money - $item.cost;
				
				if(postM < 0) return res.send({ result: 400 });
				
				obtain($user, gid, 1, $item.term);
				MainDB.users.update([ '_id', uid ]).set(
					[ 'money', postM ],
					[ 'box', $user.box ]
				).on(function($fin){
					res.send({ result: 200, money: postM, box: $user.box });
					JLog.log("[PURCHASED] " + gid + " by " + uid);
				});
				// HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
				MainDB.kkutu_shop.update([ '_id', gid ]).set([ 'hit', $item.hit + 1 ]).on();
			});
		});
	}else res.json({ error: 423 });
});
Server.post("/equip/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isLeft = req.body.isLeft == "true";
	var now = Date.now() * 0.001;
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'box', true ], [ 'equip', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		if(!$user.equip) $user.equip = {};
		var q = $user.box[gid], r;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).limit([ 'group', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			if(!Const.AVAIL_EQUIP.includes($item.group)) return res.json({ error: 400 });
			
			var part = $item.group;
			if(part.substr(0, 3) == "BDG") part = "BDG";
			if(part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
			var qid = $user.equip[part];
			
			if(qid){
				r = $user.box[qid];
				if(r && r.expire){
					obtain($user, qid, 1, r.expire, true);
				}else{
					obtain($user, qid, 1, now + $item.term, true);
				}
			}
			if(qid == $item._id){
				delete $user.equip[part];
			}else{
				if(!q) return res.json({ error: 430 });
				consume($user, gid, 1);
				$user.equip[part] = $item._id;
			}
			MainDB.users.update([ '_id', uid ]).set([ 'box', $user.box ], [ 'equip', $user.equip ]).on(function($res){
				res.send({ result: 200, box: $user.box, equip: $user.equip });
			});
		});
	});
});
Server.post("/payback/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var q = $user.box[gid];
		
		if(!q) return res.json({ error: 430 });
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			
			consume($user, gid, 1, true);
			$user.money = Number($user.money) + Math.round(0.2 * Number($item.cost));
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money });
			});
		});
	});
});
function blendWord(word){
	var lang = parseLanguage(word);
	var i, kl = [];
	var kr = [];
	
	if(lang == "en") return String.fromCharCode(97 + Math.floor(Math.random() * 26));
	if(lang == "ko"){
		for(i=word.length-1; i>=0; i--){
			var k = word.charCodeAt(i) - 0xAC00;
			
			kl.push([ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ]);
		}
		[0,1,2].sort((a, b) => (Math.random() < 0.5)).forEach((v, i) => {
			kr.push(kl[v][i]);
		});
		return String.fromCharCode(((kr[0] * 21) + kr[1]) * 28 + kr[2] + 0xAC00);
	}
}
function parseLanguage(word){
	return word.match(/[a-zA-Z]/) ? "en" : "ko";
}
Server.post("/cf", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var tray = (req.body.tray || "").split('|');
	var i, o;
	
	if(tray.length < 1 || tray.length > 6) return res.json({ error: 400 });
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var req = {}, word = "", level = 0;
		var cfr, gain = [];
		var blend, event;
		
		for(i in tray){
			if(tray[i].includes("$WPE")) event = true;
			else if(event) return res.json({ error: 461 });
			word += tray[i].slice(4);
			level += 68 - tray[i].charCodeAt(3);
			req[tray[i]] = (req[tray[i]] || 0) + 1;
			if(($user.box[tray[i]] || 0) < req[tray[i]]) return res.json({ error: 434 });
		}
		MainDB.kkutu[parseLanguage(word)].findOne([ '_id', word ]).on(function($dic){
			if(!$dic && !event){
				if(word.length == 3){
					blend = true;
				}else return res.json({ error: 404 });
			}
			//if(!blend && event && !$dic.theme.includes("NLD")) return res.json({ error: 462 });
			cfr = getCFRewards(word, level, blend, event);
			if($user.money < cfr.cost) return res.json({ error: 407 });
			for(i in req) consume($user, i, req[i]);
			for(i in cfr.data){
				o = cfr.data[i];
				
				if(Math.random() >= o.rate) continue;
				if(o.key.charAt(4) == "?"){
					o.key = o.key.slice(0, 4) + (blend ? blendWord(word) : word.charAt(Math.floor(Math.random() * word.length)));
				}
				obtain($user, o.key, o.value, o.term);
				gain.push(o);
			}
			$user.money -= cfr.cost;
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money, gain: gain });
			});
		});
	});
	// res.send(getCFRewards(req.params.word, Number(req.query.l || 0)));
});
Server.get("/dict/:word", function(req, res){
    var word = req.params.word;
    var lang = req.query.lang;
    var DB = MainDB.kkutu[lang];
    
    if(!DB) return res.send({ error: 400 });
    if(!DB.findOne) return res.send({ error: 400 });
    DB.findOne([ '_id', word ]).on(function($word){
        if(!$word) return res.send({ error: 404 });
        res.send({
            word: $word._id,
            mean: $word.mean,
            theme: $word.theme,
            type: $word.type
        });
    });
});

};
function getCFRewards(word, level, blend, event){
	var R = [];
	var f = {
		len: word.length, // 최대 6
		lev: level // 최대 18
	};
	var cost = 20 * f.lev;
	var wur = f.len / 36; // 최대 2.867
	
	if(blend){
		if(wur >= 0.5){
			R.push({ key: "$WPA?", value: 1, rate: 1 });
		}else if(wur >= 0.35){
			R.push({ key: "$WPB?", value: 1, rate: 1 });
		}else if(wur >= 0.05){
			R.push({ key: "$WPC?", value: 1, rate: 1 });
		}
		cost = Math.round(cost * 0.2);
	}/*else if(event){
		R.push({ key: "dictPage", value: Math.round(f.len * 0.6), rate: 1 });
		R.push({ key: "korea_flag", value: 1, rate: 0.07 });
		R.push({ key: "clock_minju", value: 1, rate: 0.07 });
		R.push({ key: "minju", value: 1, rate: 0.07 });
		R.push({ key: "pants_korea", value: 1, rate: 0.07 });
		R.push({ key: "korea", value: 1, rate: 0.07 });
		R.push({ key: "mustache", value: 1, rate: 0.07 });
		R.push({ key: "brave_eyes", value: 1, rate: 0.07 });
		cost = 0;
	}*/else{
		R.push({ key: "dictPage", value: Math.round(f.len * 0.6), rate: 1 });
		R.push({ key: "boxB4", value: 1, rate: Math.min(1, f.lev / 7) });
		if(f.lev >= 5){
			R.push({ key: "boxB3", value: 1, rate: Math.min(1, f.lev / 15) });
			cost += 10 * f.lev;
			wur += f.lev / 20;
		}
		if(f.lev >= 10){
			R.push({ key: "boxB2", value: 1, rate: Math.min(1, f.lev / 30) });
			cost += 20 * f.lev;
			wur += f.lev / 10;
		}
		if(wur >= 0.05){
			if(wur > 1) R.push({ key: "$WPC?", value: Math.floor(wur), rate: 1 });
			R.push({ key: "$WPC?", value: 1, rate: wur % 1 });
		}
		if(wur >= 0.35){
			if(wur > 2) R.push({ key: "$WPB?", value: Math.floor(wur / 2), rate: 1 });
			R.push({ key: "$WPB?", value: 1, rate: (wur / 2) % 1 });
		}
		if(wur >= 0.5){
			R.push({ key: "$WPA?", value: 1, rate: wur / 3 });
		}
	}
	return { data: R, cost: cost };
}