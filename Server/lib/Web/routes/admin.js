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
var File	 = require("fs");
var fs		 = require("fs");
var MainDB	 = require("../db");
var GLOBAL	 = require("../../sub/global.json");
var JLog	 = require("../../sub/jjlog");
var Lizard	 = require("../../sub/lizard.js");
//var Bander	 = require("./../filters/User.json");

File.watchFile("./lib/sub/global.json", () => {
	GLOBAL = require("../../sub/global.json");
	JLog.info("global.json is Auto-Updated at {lib/Web/routes/admin.js}");
})
File.watchFile("./lib/Web/db", () => {
	MainDB = require("../db");
	JLog.info("db.js is Auto-Updated at {lib/Web/routes/admin.js}");
})
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
	
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.findOne) res.sendStatus(400);
	TABLE.findOne([ '_id', req.params.word ]).on(function($doc){
		res.send($doc);
	});
});
Server.get("/gwalli/kkututheme", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.find) res.sendStatus(400);
	TABLE.find([ 'theme', new RegExp(req.query.theme) ]).limit([ '_id', true ]).on(function($docs){
		res.send({ list: $docs.map(v => v._id) });
	});
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
				res.send("OK")
			})
		}
	});
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
	var TABLE = MainDB.kkutu[req.body.lang];
	
	if(list) list = list.split(/[,\r\n]+/);
	else return res.sendStatus(400);
	if(!TABLE) res.sendStatus(400);
	if(!TABLE.insert) res.sendStatus(400);
	
	noticeAdmin(req, theme, list.length);
	list.forEach(function(item){
		if(!item) return;
		item = item.trim();
		if(!item.length) return;
		TABLE.findOne([ '_id', item ]).on(function($doc){
			if(!$doc) return TABLE.insert([ '_id', item ], [ 'type', "INJEONG" ], [ 'theme', theme ], [ 'mean', "＂1＂" ], [ 'flag', 2 ]).on();
			var means = $doc.mean.split(/＂[0-9]+＂/g).slice(1);
			var len = means.length;
			
			if($doc.theme.indexOf(theme) == -1){
				$doc.type += ",INJEONG";
				$doc.theme += "," + theme;
				$doc.mean += `＂${len+1}＂`;
				TABLE.update([ '_id', item ]).set([ 'type', $doc.type ], [ 'theme', $doc.theme ], [ 'mean', $doc.mean ]).on();
			}else{
				JLog.warn(`Word '${item}' already has the theme '${theme}'!`);
			}
		});
		itemLog(item, req, theme, list.length);
	});
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
Server.post("/gwalli/users", function(req, res){
	if(!checkAdmin(req, res, 'USERS')) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(function(item){
		MainDB.users.upsert([ '_id', item._id ]).set(item).on();
	});
	res.sendStatus(200);
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

};
function noticeAdmin(req, ...args){
	logger.info(`[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`);
	fs.appendFileSync(`../IP-Log/WordInit.txt`,`\n[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
	})
	JLog.info(`[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`);
}
function itemLog(item, req, ...args){
	logger.info(`[ADMIN]: ${req.originalUrl} ${item} ${req.ip} | ${args.join(' | ')}`);
	fs.appendFileSync(`../IP-Log/WordInit.txt`,`\n[ADMIN]: ${req.originalUrl} ${item} ${req.ip} | ${args.join(' | ')}`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return logger.error(`IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`)
	})
	JLog.info(`[ADMIN]: ${req.originalUrl} ${item} ${req.ip} | ${args.join(' | ')}`);
}
function checkAdmin(req, res, type){
	if(global.isPublic){
		if(req.session.profile){
			if(GLOBAL.ADMINS['MANAGER'].indexOf(req.session.profile.id) != -1) return true;
			
			if(GLOBAL.ADMINS[type].indexOf(req.session.profile.id) == -1){
				req.session.admin = false;
				JLog.warn(`권한이 없는 회원이 관리자 페이지에 접근을 시도했습니다.　\n시용자(ID | IP): [${req.session.profile.id}] | [${req.connection.remoteAddress}]`);
				return res.send(`<title>BF끄투 - 404</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>404 not found</h2><div>당신은 관리자가 아닙니다.</div><br/><ul> <li>해당 페이지에 접근할 권한이 없을 수 있습니다.</li><li>접속한 페이지가 자신의 부서와 맞는지 확인해 보세요.</li><li>정상적인 방법으로 접근한 것인지 확인해 보세요.</li><li>이제 막 권한이 변경됐을 수 있으니, <a target='_blank' href='https://bfk.playts.net/'>다시 시도해 보세요.</a></li></ul>`), false;
			}
		}else{
			req.session.admin = false;
			JLog.warn(`권한이 없는 비회원이 관리자 페이지에 접근을 시도했습니다.　\n사용자(IP): [${req.connection.remoteAddress}]`);
			return res.send(`<title>BF끄투 - 404</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>404 not found</h2><div>당신은 관리자가 아닙니다.</div><br/><ul> <li>해당 페이지에 접근할 권한이 없을 수 있습니다.</li><li>정상적인 방법으로 접근한 것인지 확인해 보세요.</li><li>관리자 계정으로 로그인 후에 다시 시도해 보세요.</li></ul>`), false;
		}
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