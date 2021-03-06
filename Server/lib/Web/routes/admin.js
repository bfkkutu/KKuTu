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

const log4js = require('log4js');
log4js.configure({
  appenders: { System: { type: 'file', filename: 'WordInit.log' } },
  categories: { default: { appenders: ['System'], level: 'info' } }
});
const logger = log4js.getLogger('System');
const Bot    = require("../../Game/bot");
var File	 = require("fs");
var fs		 = require("fs");
var MainDB	 = require("../db");
var GLOBAL	 = require("../../sub/global.json");
var JLog	 = require("../../sub/jjlog");
var Lizard	 = require("../../sub/lizard.js");
//var Bander	 = require("./../filters/User.json");

var Express	 = require("express");
var multer = require('multer'); // multer 모듈 사용 (파일 업로드)
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'lib/Web/public/uploaded') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
	}
})
var upload = multer({ storage: storage })

File.watchFile("./lib/sub/global.json", () => {
	GLOBAL = require("../../sub/global.json");
	JLog.info("global.json is Auto-Updated at {lib/Web/routes/admin.js}");
})

function translateToPromise(query) { 
	return new Promise((res, rej) => {
		query.on((doc) => { res(doc); }, null, (err) => { rej(err); });
	});
}
function validate(list, item){
	if(typeof list == "object") list = list.filter(x => x != item)
	else list = (list == item ? "" : list)
	return list
}

exports.run = function(Server, page){

/*Server.get("/gwalli", function(req, res) {
	if(!checkAdmin(req, res)) return;
	
	req.session.admin = true;
	page(req, res, "gwalli");
});*/
Server.get("/admin/developer", function(req, res) {
	if(!checkAdmin(req, res, 'DEVELOPER')) return;
	
	req.session.admin = true;
	page(req, res, "admin_developer");
});
Server.get("/admin/words", function(req, res) {
	if(!checkAdmin(req, res, 'WORDS')) return;
	
	req.session.admin = true;
	page(req, res, "admin_words");
});
Server.get("/admin/users", function(req, res) {
	if(!checkAdmin(req, res, 'USERS')) return;
	
	req.session.admin = true;
	page(req, res, "admin_users");
});
/*Server.get("/admin/manager", function(req, res) {
	if(!checkAdmin(req, res, 'MANAGER')) return;
	
	req.session.admin = true;
	page(req, res, "admin_manager");
});*/
Server.get("/admin/designer", function(req, res) {
	if(!checkAdmin(req, res, 'DESIGNER')) return;
	
	req.session.admin = true;
	page(req, res, "admin_designer");
});
Server.get('/admin/upload', function(req, res){
	if(!checkAdmin(req, res, 'DESIGNER')) return;
	
	req.session.admin = true;
	res.render('upload');
});
Server.post('/admin/upload', upload.single('userfile'), function(req, res){
	res.send('Uploaded! : '+req.file); // object를 리턴함
	console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
});
Server.use('/admin/uploaded', Express.static('uploads'));

Server.get("/gwalli/injeong", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	
	MainDB.kkutu_injeong.find([ 'theme', { $not: "~" } ]).limit(100).on(function($list){
		res.send({ list: $list });
	});
});
Server.get("/gwalli/gamsi", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	
	MainDB.users.findOne([ '_id', req.query.id ]).limit([ 'server', true ]).on(function($u){
		if(!$u) return res.sendStatus(404);
		var data = { _id: $u._id, server: $u.server };
		
		MainDB.session.findOne([ 'profile.id', $u._id ]).limit([ 'profile', true ]).on(function($s){
			if($s) data.title = $s.profile.title || $s.profile.name;
			res.send(data);
		});
	});
});
Server.get("/gwalli/users", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	
	if(req.query.name){
		MainDB.session.find([ 'profile.title', req.query.name ]).on(function($u){
			if($u) return onSession($u);
			MainDB.session.find([ 'profile.name', req.query.name ]).on(function($u){
				if($u) return onSession($u);
				res.sendStatus(404);
			});
		});
	}else{
		MainDB.users.findOne([ '_id', req.query.id ]).on(function($u){
			if($u) return res.send({ list: [ $u ] });
			res.sendStatus(404);
		});
	}
	function onSession(list){
		var board = {};
		
		Lizard.all(list.map(function(v){
			if(board[v.profile.id]) return null;
			else{
				board[v.profile.id] = true;
				return getProfile(v.profile.id);
			}
		})).then(function(data){
			res.send({ list: data });
		});
	}
	function getProfile(id){
		var R = new Lizard.Tail();
		
		if(id) MainDB.users.findOne([ '_id', id ]).on(function($u){
			R.go($u);
		}); else R.go(null);
		return R;
	}
});
Server.post("/gwalli/ip_log", function(req, res) {
	if(!checkAdmin(req, res, 'USERS')) return;
	
	res.send(File.readFileSync("./../IP-Log/Join_Exit.txt",'utf8'));
});
Server.post("/gwalli/kkutu_log", function(req, res) {
	if(!checkAdmin(req, res, 'DEVELOPER')) return;
	
	res.send("Sorry, This feature is not supported(Undeveloped).");
	/*fs.readFileSync("./../kkutu_log.txt",'utf8', function(error, response) {
		if(!error) return res.sendStatus(400);
		
		res.send(response);
	})*/
});
Server.post("/gwalli/kkutu_error", function(req, res) {
	if(!checkAdmin(req, res, 'DEVELOPER')) return;
	
	res.send("Sorry, This feature is not supported(Undeveloped).");
	/*fs.readFileSync("./../kkutu_error.txt",'utf8', function(error, response) {
		if(!error) return res.sendStatus(400);
		
		res.send(response);
	})*/
});
Server.get("/gwalli/kkutudb/:word", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	//Bot.word("수정", theme, req.params.word)
	
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.findOne) return res.sendStatus(400);
	TABLE.findOne([ '_id', req.params.word ]).on(function($doc){
		res.send($doc);
	});
});
Server.get("/gwalli/kkututheme", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.find) return res.sendStatus(400);
	TABLE.find([ 'theme', new RegExp(req.query.theme) ]).limit([ '_id', true ]).on(function($docs){
		res.send({ list: $docs.map(v => v._id) });
	});
});
Server.get("/gwalli/findword", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	var word = new RegExp(req.query.word);
	
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.find) res.sendStatus(400);
	if(!type) res.sendStatus(400);
	
	if(type == "start"){ // 가~ 가%
		TABLE.findSE([ '_id', word ]).limit([ 'theme', true ]).on(function($docs){
			res.send({ list: $docs.map(v => v._id) });
		});
	}else if(type == "end"){ // ~가 %가
		TABLE.findSE([ '_id', word ]).limit([ 'theme', true ]).on(function($docs){
			res.send({ list: $docs.map(v => v._id) });
		});
	}
});
/*Server.get("/gwalli/kkutuhot", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	File.readFile(GLOBAL.KKUTUHOT_PATH, function(err, file){
		var data = JSON.parse(file.toString());
		
0		parseKKuTuHot().then(function($kh){
			res.send({ prev: data, data: $kh });
		});
	});
});*/
Server.post("/gwalli/users/ipban", function(req, res) {
	if(!checkAdmin(req, res, 'USERS')) return;
	
	var IpFilters = JSON.parse(File.readFileSync("./lib/Web/filters/User.json"));
	req.params.list.forEach((ip, index) => {
		if (IpFilters.ips.indexOf(ip) == -1) IpFilters.ips.push(ip);
		
		if (req.params.list.length == index) {
			File.writeFile("./lib/Web/filters/User.json", JSON.stringify(IpFilters,null, "\t"), () => {
				if (!err) return res.sendStatus(400);
				
				JLog.info(`[${clientIp}](IP) was banned At [${requestId}]`);
				res.send("SUCCESS")
			})
		}
	});
});
Server.get("/gwalli/reports", function(req, res) {
	if(!checkAdmin(req, res, 'USERS')) return;
	var data = {};
	
	function readFiles(dirname, onFileContent, onError) {
		File.readdir(dirname, function(err, filenames) {
			if (err) {
				onError(err);
				return;
			}
			filenames.forEach(function(filename) {
				File.readFile(dirname + filename, 'utf-8', function(err, content) {
					if (err) {
						onError(err);
						return;
					}
					onFileContent(filename, content);
				});
			});
		});
	}
	readFiles('./lib/Web/report/', function(filename, content) {
		data[filename] = content;
	}, function(err) {
		return res.send({ error: err });
	});
	setTimeout(function(){
		return res.send({ list: data })
	}, 1000);
});
Server.get("/gwalli/compt", function(req, res) {
	if(!checkAdmin(req, res, 'USERS')) return;
	if(req.query.pw != GLOBAL.PASS) return res.sendStatus(400);
	if(!req.query.file) return;
	
	var data = File.readFileSync(`./lib/Web/report/${req.query.file}.json`, "utf8", function(err) {
		return res.send({ error: 404 })
	});
	data = JSON.parse(data)
	
	setTimeout(function(){
		if(!data.compt){
			File.writeFileSync(`./lib/Web/report/${req.query.file}.json`, `{"target":"${data.target}","submitter":"${data.submitter}","date":"${data.date}","reason":"${data.reason}","compt":true}`, 'utf8',(err) => {
				if (err) return res.send({ error: 404 });
			});
		}else return res.send({ error: 404 })
		return res.send({ result: "SUCCESS" })
	}, 100);
});
Server.get("/gwalli/chatlog", function(req, res) {
	if(!checkAdmin(req, res, 'USERS')) return;
	
	var data = File.readFileSync(`./lib/Web/chatlog/all/${req.query.id}.log`, "utf8", function(err) {
		return res.send({ error: 404 })
	});
	
	setTimeout(function(){
		return res.send({ data: data })
	}, 100);
});
Server.post("/gwalli/editor/getfile", function(req, res){
	if(!checkAdmin(req, res, 'DEVELOPER')) return;
	
	File.readFile(req.params.path, 'utf8',function(err, data) {
		if (!err) return res.sendStatus(400);
		res.send(data)
	});
});
Server.post("/gwalli/editor/setfile", function(req, res){
	if(!checkAdmin(req, res, 'DEVELOPER')) return;
	
	File.writeFile(req.params.path,req.params.value, 'utf8',function(err, data) {
		if (!err) return res.sendStatus(400);
		res.send(File.readFileSync("./../../../"+req.params.path))
	});
});
Server.get("/gwalli/shop/:key", function(req, res){
	if(!checkAdmin(req, res, 'DESIGNER')) return;
	
	var q = (req.params.key == "~ALL") ? undefined : [ '_id', req.params.key ];
	
	MainDB.kkutu_shop.find(q).on(function($docs){
		MainDB.kkutu_shop_desc.find(q).on(function($desc){
			res.send({ goods: $docs, desc: $desc });
		});
	});
});
Server.post("/gwalli/injeong", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	var themes;
	
	list.forEach(function(v){
		if(v.ok){
			req.body.nof = true;
			req.body.lang = "ko";
			v.theme.split(',').forEach(function(w, i){
				setTimeout(function(lid, x){
					req.body.list = lid;
					req.body.theme = x;
					onKKuTuDB(req, res);
				}, i * 1000, v._id.replace(/[^가-힣0-9]/g, ""), w);
			});
		}else{
			MainDB.kkutu_injeong.update([ '_id', v._origin ]).set([ 'theme', "~" ]).on();
		}
		// MainDB.kkutu_injeong.remove([ '_id', v._origin ]).on();
	});
	res.sendStatus(200);
});
Server.post("/gwalli/kkutudb", onKKuTuDB);
function onKKuTuDB(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var theme = req.body.theme;
	var list = req.body.list;
	var validatedList = req.body.list.split("\n");
	var TABLE = MainDB.kkutu[req.body.lang];
	
	if(list) list = list.split(/[,\r\n]+/);
	else return res.sendStatus(400);
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.insert) res.sendStatus(400);
	
	(async () => {
		await Promise.all(list.map(async item => {
			if(!item) return;
			item = item.trim();
			if(!item.length) return;
			var $doc = await translateToPromise(TABLE.findOne([ '_id', item ]));
			if(!$doc) return await translateToPromise(TABLE.insert([ '_id', item ], [ 'type', "INJEONG" ], [ 'theme', theme ], [ 'mean', "＂1＂" ], [ 'flag', 2 ]));
			var means = $doc.mean.split(/＂[0-9]+＂/g).slice(1);
			var len = means.length;
			
			if($doc.theme.indexOf(theme) == -1){
				$doc.type += ",INJEONG";
				$doc.theme += "," + theme;
				$doc.mean += `＂${len+1}＂`;
				await translateToPromise(TABLE.update([ '_id', item ]).set([ 'type', $doc.type ], [ 'theme', $doc.theme ], [ 'mean', $doc.mean ]));
			}else{
				JLog.warn(`Word '${item}' already has the theme '${theme}'!`);
				validatedList = validate(validatedList, item);
			}
			itemLog(item, req, theme, list.length);
		}));
		Bot.word("추가", theme, validatedList.join("\n"));
	})();
	if(!req.body.nof) res.sendStatus(200);
}
Server.post("/gwalli/kkutudb/:word", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	var TABLE = MainDB.kkutu[req.body.lang];
	var data = JSON.parse(req.body.data);
	
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.upsert) res.sendStatus(400);
	
	noticeAdmin(req, data._id);
	if(data.mean == ""){
		TABLE.remove([ '_id', data._id ]).on(function($res){
			res.send($res.toString());
		});
	}else{
		TABLE.upsert([ '_id', data._id ]).set([ 'flag', data.flag ], [ 'type', data.type ], [ 'theme', data.theme ], [ 'mean', data.mean ]).on(function($res){
			res.send($res.toString());
		});
	}
});
Server.post("/gwalli/kkutuDdb", onKKuTuDDB);
function onKKuTuDDB(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var theme = req.body.theme;
	var list = req.body.list;
	var TABLE = MainDB.kkutu[req.body.lang];
	
	Bot.word("삭제", theme, list);
	
	if(list) list = list.split(/[,\r\n]+/);
	else return res.sendStatus(400);
	if(!TABLE) res.sendStatus(400);
	
	list.forEach(function(item){
		if(!item) return;
		item = item.trim();
		if(!item.length) return;
		TABLE.findOne([ '_id', item ]).on(function($doc){
			if(!$doc){
				JLog.warn(`Word '${item}' already hasn't the theme '${theme}'!`)
				return;
			}
			var themes = $doc.theme.split(",")
			
			if(themes.length == 0) TABLE.remove([ '_id', item ]).on();
			if(themes.indexOf(theme) == -1){ // 존재하지 않으면
				JLog.warn(`Word '${item}' already hasn't the theme '${theme}'!`);
			}else{ // 존재하면
				if(themes.length == 1) TABLE.remove([ '_id', item ]).on();
				else{
					var i, n, ii, fmean = ""
					var types = $doc.type.split(",")
					var means = $doc.mean.split("＂")
					var produced = `{`
					for(n in means){
						if(n != 0){
							produced += ((n/2).toString().includes(".") ? `"${means[Number(n)]}":` : ` "${means[Number(n)]}",`)
						}else continue;
					}
					means = produced.slice(0,-1)
					means += `}`
					means = JSON.parse(means)
					for(i in themes){
						if(themes[i] == theme){
							var thidx = themes.indexOf(theme)
							var tyidx = types.indexOf(types[i])
							themes.splice(thidx, 1)
							types.splice(tyidx, 1)
							delete means[i]
							for(ii in JSON.stringify(means).split(",")){
								fmean += JSON.stringify(means).replace(/[\{\}\[\]]/gi,"").split(",")[ii].replace('"',"＂").replace('"',"＂").replace(':',"").replace('"',"").replace('"',"")
							}
							TABLE.update([ '_id', item ]).set([ 'theme', themes.toString() ]).on();
							TABLE.update([ '_id', item ]).set([ 'type', types.toString() ]).on();
							//TABLE.update([ '_id', item ]).set([ 'flag', Number($doc.flag)-1 ]).on();
							TABLE.update([ '_id', item ]).set([ 'mean', fmean ]).on();
							break;
						} else continue;
					}
					itemLog(item, req, theme, list.length);
				}
			}
		});
	});
	if(!req.body.nof) res.sendStatus(200);
}
Server.post("/gwalli/kkutuDdb/:word", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	var TABLE = MainDB.kkutu[req.body.lang];
	var data = JSON.parse(req.body.data);
	
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.upsert) res.sendStatus(400);
	
	noticeAdmin(req, data._id);
	TABLE.remove([ '_id', data._id ]).on(function($res){
		res.send($res.toString());
	});
});
/*Server.post("/gwalli/kkutuhot", function(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	noticeAdmin(req);
	parseKKuTuHot().then(function($kh){
		var i, j, obj = {};
		
		for(i in $kh){
			for(j in $kh[i]){
				obj[$kh[i][j]._id] = $kh[i][j].hit;
			}
		}
		File.writeFile(GLOBAL.KKUTUHOT_PATH, JSON.stringify(obj), function(err){
			res.send(err);
		});
	});
});*/
Server.get("/gwalli/hitword", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.findOne) return res.sendStatus(400);
	
	TABLE.findOne([ '_id', req.query.word ]).on(function($doc){
		if(!$doc) return res.sendStatus(400)
		else if(!$doc.hit) return res.sendStatus(400)
		else return res.send({ result: $doc.hit })
	})
});
Server.get("/gwalli/manner", function(req, res){
	if(!checkAdmin(req, res, 'WORDS')) return;
	var MANNER = MainDB.kkutu_manner[req.query.lang];
	
	if(!MANNER) return res.sendStatus(400);
	if(!MANNER.findOne) return res.sendStatus(400);
	
	MANNER.findOne([ '_id', req.query.letter ]).on(function($doc){
		if(!$doc) return res.send({ result: 404 })
		else{
			MANNER.remove([ '_id', req.query.letter ]).on();
			return res.send({ result: 1 });
		}
	})
});
Server.post("/gwalli/users", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(function(item){
		MainDB.users.upsert([ '_id', item._id ]).set(item).on();
	});
	res.sendStatus(200);
});
Server.post("/gwalli/monthly", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var i;
	var list = req.body.list;
	var ping = req.body.ping;
	
	for(i in list){
		MainDB.users.findOne([ '_id', list[i] ]).on(function($doc){
			if(!$doc) return res.sendStatus(400);
			
			MainDB.users.upsert([ '_id', list[i] ]).set([ 'money', Number($doc.money)+Number(ping) ]).on();
			return res.send({ result: "SUCCESS" })
		});
	}
});
Server.post("/gwalli/warn", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	
	if(!req.body.id) return res.send({ error: 404 });
	if(!req.body.warn) return res.send({ error: 404 });
	
	var id = req.body.id;
	var warn = Number(req.body.warn);
	
	MainDB.users.findOne([ '_id', id ]).on(function($user){
		if(!$user) return res.send({ error: 404 });
		
		if(warn >= 4){
			MainDB.users.update([ '_id', id ]).set([ 'warn', 0 ], [ 'black', "경고 누적" ], [ 'bandate', 99999999999999 ]).on();
			Bot.ban($user, "관리자 페이지", `경고 누적 (${warn}회)`, "영구")
			return res.send({ result: "SUCCESS" })
		}else{
			MainDB.users.update([ '_id', id ]).set([ 'warn', warn ]).on();
			Bot.warn($user, "관리자 페이지", warn-Number($user.warn), warn)
			return res.send({ result: "SUCCESS" })
		}
	});
});
Server.get("/gwalli/getWarn", function(req, res){
	if(!req.query.id) return res.send({ error: 404 });
	var id = req.query.id;
	MainDB.users.findOne([ '_id', id ]).on(function($user){
		if(!$user) return res.send({ error: 404 });
		else if(!$user.warn) return res.send({ error: 404 });
		else return res.send({ result: $user.warn });
	});
});
Server.get("/gwalli/resetRP", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	if(req.query.pw != GLOBAL.MPASS) return res.send({ error: 500 });
	
	MainDB.users.find().on(function($list){
		if(!$list) return res.sendStatus(400);
		
		var rewardTarget = {
			bronze: [],
			silver: [],
			gold: [],
			platinum: [],
			diamond: [],
			master: []
		}
		
		for(var i in $list){
			if($list[i].kkutu["rankPoint"] >= 50 && $list[i].kkutu["rankPoint"] < 1000){
				rewardTarget.bronze.push($list[i]._id);
			} else if($list[i].kkutu["rankPoint"] >= 1000 && $list[i].kkutu["rankPoint"] < 2000){
				rewardTarget.silver.push($list[i]._id);
			} else if($list[i].kkutu["rankPoint"] >= 2000 && $list[i].kkutu["rankPoint"] < 3000){
				rewardTarget.gold.push($list[i]._id);
			} else if($list[i].kkutu["rankPoint"] >= 3000 && $list[i].kkutu["rankPoint"] < 4000){
				rewardTarget.platinum.push($list[i]._id);
			} else if($list[i].kkutu["rankPoint"] >= 4000 && $list[i].kkutu["rankPoint"] < 5000){
				rewardTarget.diamond.push($list[i]._id);
			} else if($list[i].kkutu["rankPoint"] >= 5000) rewardTarget.master.push($list[i]._id);
		}
		for(var n in $list){
			$list[n].kkutu["rankPoint"] = 0;
			MainDB.users.update([ '_id', $list[n]._id ]).set([ 'kkutu', $list[n].kkutu ]).on();
		}
		File.writeFileSync(`./lib/Web/logs.log`, `${JSON.stringify(rewardTarget)}`, 'utf8',(err) => {
			if (err) return res.send({ result: 404 });
		});
	});
	return res.send({ result: "SUCCESS" });
});
Server.post("/gwalli/shop", function(req, res){
	if(!checkAdmin(req, res, 'DESIGNER')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(function(item){
		item.core.options = JSON.parse(item.core.options);
		MainDB.kkutu_shop.upsert([ '_id', item._id ]).set(item.core).on();
		MainDB.kkutu_shop_desc.upsert([ '_id', item._id ]).set(item.text).on();
	});
	res.sendStatus(200);
});
Server.post("/gwalli/shopditem", onDShop);
function onDShop(req, res){
	if(!checkAdmin(req, res, 'DESIGNER')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	var resItem;
	
	list.forEach(function(item){
		resItem = item;
		MainDB.kkutu_shop.remove([ '_id', item._id ]).on();
		MainDB.kkutu_shop_desc.remove([ '_id', item._id ]).on();
	});
	noticeAdmin(req, resItem._id);
	res.send({ _id: resItem._id });
}

Server.post("/gwalli/shopGIIL", function(req, res){ // shop give item id list
	if(!checkAdmin(req, res, 'DESIGNER')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = req.body.list;
	var item = req.body.item;
	var TABLE = MainDB.users;
	var parsedBox;
	
	if(list) list = list.split(/[,\r\n]+/);
	else return res.sendStatus(400);
	if(!TABLE) res.sendStatus(400);
	
	list.forEach(function(l){
		if(!l) return;
		l = l.trim();
		if(!l.length) return;
		TABLE.findOne([ '_id', l ]).on(function($u){
			if(!$u) return res.send({ result: "fail" });
			else{
				$u.box[item] = 1;
				TABLE.update([ '_id', l ]).set([ 'box', $u.box ]).on();
			}
		})
	});
	noticeAdmin(req, item);
	res.send({ result: "success" });
});

};

function noticeAdmin(req, ...args){
	req.ip = req.headers['x-forwarded-for'] || "";
	if(typeof req.ip == "string" && req.ip.includes(",")) req.ip = req.ip.split(",")[0]

	if(req.originalUrl == "/gwalli/shopditem"){
		logger.info(`[ADMIN]: ${req.originalUrl} Removed item ${args} ${req.ip}`);
		fs.appendFileSync(`../IP-Log/ItemLog.txt`,`\n[ADMIN]: ${req.originalUrl} Removed item ${args} ${req.ip}`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
		})
		JLog.info(`[ADMIN]: ${req.originalUrl} Removed item ${args} ${req.ip}`);
	} else {
		logger.info(`[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`);
		fs.appendFileSync(`../IP-Log/WordInit.txt`,`\n[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`, 'utf8',(err, ip, path) => { //기록하고
			if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
		})
		JLog.info(`[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`);
	}
}
function itemLog(item, req, ...args){
	req.ip = req.headers['x-forwarded-for'] || "";
	if(typeof req.ip == "string" && req.ip.includes(",")) req.ip = req.ip.split(",")[0]
	
	if(req.originalUrl == "/gwalli/kkutuDdb") logger.info(`[ADMIN]: ${req.originalUrl} Removed Word ${item} ${req.ip} | ${args.join(' | ')}`);
	else logger.info(`[ADMIN]: ${req.originalUrl} Added Word ${item} ${req.ip} | ${args.join(' | ')}`);
	fs.appendFileSync(`../IP-Log/WordInit.txt`,`\n[ADMIN]: ${req.originalUrl} ${item} ${req.ip} | ${args.join(' | ')}`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
	})
	if(req.originalUrl == "/gwalli/kkutuDdb") JLog.info(`[ADMIN]: ${req.originalUrl} Removed Word ${item} ${req.ip} | ${args.join(' | ')}`);
	else JLog.info(`[ADMIN]: ${req.originalUrl} Added Word ${item} ${req.ip} | ${args.join(' | ')}`);
}
function checkAdmin(req, res, type){
	if(global.isPublic){
		if(req.session.profile){
			if(GLOBAL.ADMINS['MANAGER'].indexOf(req.session.profile.id) != -1) return true;
			if(req.connection.remoteAddress === "::ffff:172.30.1.254") return true;
			
			if(GLOBAL.ADMINS[type].indexOf(req.session.profile.id) == -1){
				req.session.admin = false;
				JLog.warn(`권한이 없는 회원이 관리자 페이지에 접근을 시도했습니다.　\n시용자(ID | IP): [${req.session.profile.id}] | [${req.connection.remoteAddress}]`);
				return res.send(`<title>BF끄투 - 500</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>500 Access Denied</h2><div>이 곳에 접근할 권한이 없습니다.</div><br/><ul> <li>해당 페이지에 접근할 권한이 없습니다.</li><li>접속한 페이지가 자신의 부서와 맞는지 확인해 보세요.</li><li>정상적인 방법으로 접근한 것인지 확인해 보세요.</li><li>권한 부여가 아직 되지 않았을 수 있습니다. 총관리자에게 식별 번호를 알려주세요.</li></ul>`), false;
			}
		}else{
			req.session.admin = false;
			JLog.warn(`권한이 없는 비회원이 관리자 페이지에 접근을 시도했습니다.　\n사용자(IP): [${req.connection.remoteAddress}]`);
			return res.send(`<title>BF끄투 - 500</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>500 Access Denied</h2><div>이 곳에 접근할 권한이 없습니다.</div><br/><ul> <li>해당 페이지에 접근할 권한이 없습니다.</li><li>정상적인 방법으로 접근한 것인지 확인해 보세요.</li><li>관리자 계정으로 로그인 후에 다시 시도해 보세요.</li></ul>`), false;
		}
	}else{
		req.session.admin = false;
			JLog.warn(`잘못된 요청입니다.　\n사용자(IP): [${req.connection.remoteAddress}]`);
			return res.send(`<title>BF끄투 - 400</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>400 Bad Request</h2><div>잘못된 요청입니다.</div><br/><ul> <li>서버에 문제가 발생했을 수 있습니다.</li></ul>`), false;
	}
	return true;
}
/*function parseKKuTuHot(){
	var R = new Lizard.Tail();
		
	Lizard.all([
		query(`SELECT * FROM kkutu_ko WHERE hit > 0 ORDER BY hit DESC LIMIT 50`),
		query(`SELECT * FROM kkutu_ko WHERE _id ~ '^...$' AND hit > 0 ORDER BY hit DESC LIMIT 50`),
		query(`SELECT * FROM kkutu_ko WHERE type = 'INJEONG' AND hit > 0 ORDER BY hit DESC LIMIT 50`),
		query(`SELECT * FROM kkutu_en WHERE hit > 0 ORDER BY hit DESC LIMIT 50`)
	]).then(function($docs){
		R.go($docs);
	});
	function query(q){
		var R = new Lizard.Tail();
		
		MainDB.kkutu['ko'].direct(q, function(err, $docs){
			if(err) return JLog.error(err.toString());
			R.go($docs.rows);
		});
		return R;
	}
	return R;
}*/