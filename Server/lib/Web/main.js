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

/**
 * 볕뉘 수정사항:
 * Login 을 Passport 로 수행하기 위한 수정
 */

var WS		 = require("ws");
var Express	 = require("express");
var Exession = require("express-session");
var Redission= require("connect-redis")(Exession);
var Redis	 = require("redis");
var Parser	 = require("body-parser");
var DDDoS	 = require("dddos");
var Server	 = Express();
// 해티 수정
var webServer = Express();
var vHost = require('vhost');
// 해티 수정 끝
var DB		 = require("./db");
//볕뉘 수정 구문삭제 (28)
var JLog	 = require("../sub/jjlog");
var WebInit	 = require("../sub/webinit");
var fs		 = require('fs');
var GLOBAL	 = require("../sub/global.json");
var Secure = require('../sub/secure');
//볕뉘 수정
var passport = require('passport');
//볕뉘 수정 끝
var Const	 = require("../const");
var https	 = require('https');
var Language = {
	'ko_KR': require("./lang/ko_KR.json"),
	'en_US': require("./lang/en_US.json")
};
//볕뉘 수정
var ROUTES = [
	"major", "consume", "admin", "login"
];
//볕뉘 수정 끝
var page = WebInit.page;
var IpFilters = JSON.parse(fs.readFileSync("./lib/Web/filters/User.json"));
var gameServers = [];

let moment = require('moment'); //moment.js를 사용 (DDDoS 기록)
const alert = require("alert-node"); //alert-node를 사용 (DDDoS alert)

//HPKP
const hpkp = require('hpkp');
const hpkp_DIS = 15768000;

//Referrer Policy
const referrerPolicy = require('referrer-policy');

//helmet
const helmet = require('helmet');
const csp = require('helmet-csp');
	  
const cors = require('cors');
const Router = Express.Router();

const hsc = require('http-status-codes');

var maintenance; // boolean

WebInit.MOBILE_AVAILABLE = [
	"portal", "main", "kkutu"
];

require("../sub/checkpub");
JLog.info("<< KKuTu Web >>");
fs.watchFile("./lib/Web/filters/User.json", (res) => {
	IpFilters = JSON.parse(fs.readFileSync("./lib/Web/filters/User.json"));
	JLog.info("IP-Ban Data is Auto-Updated at {lib/Web/main.js}")
})
fs.watchFile("./lib/sub/global.json", () => {
	GLOBAL	 = require("../sub/global.json");
	JLog.info("global.json is Auto-Updated at {lib/Web/main.js}");
})

function getClientIp(req, res){
	var clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (typeof clientIp == "string" && clientIp.includes(",")) clientIp = clientIp.split(",")[0]
	if (clientIp.startsWith("::ffff:")) return clientIp.substr(7);
	
	return clientIp;
}
Server.use((req, res, _next) => {
	var clientIp = getClientIp(req, res);
	
	//console.log(`Packet from ${clientIp}`);
	
	if(IpFilters.ips.indexOf(clientIp) == -1) _next();
	else res.send(`<head><title>BF끄투 - 406</title><style>body{ font-family:나눔바른고딕,맑은 고딕,돋움; }</style></head><body><center><h1>406 Not Acceptable</h1><div>서버가 요청을 거절했습니다.</div><br/>서버에서 받아들일 수 없는 요청이거나 서버에서 차단한 요청입니다.</body></center>`);
});
/*Server.use((req, res, _next) => {
	var clientIp = getClientIp(req, res);
	var clientId = null;
	var thisDate = moment().format('MM_DD_HH_mm');
	
	JLog.info(`사용자가 서버에 접속했습니다.   (IP:[${clientIp}])`);
	fs.writeFileSync(`../IP-Log/IP-Log__${thisDate}.txt`,`[${clientIp}|${clientId}]: 서버에 접속이 요청됐습니다.    (${thisDate})`, 'utf8',(err, ip, path) => { //기록하고
		if (err) return JLog.error(`IP를 기록하는 중에 문제가 발생했습니다!   (${err.toString()})`)
	})
})*/
Server.set('views', __dirname + "/views");
Server.set('view engine', "pug");
Server.use(Express.static(__dirname + "/public"));
Server.use(Parser.urlencoded({ extended: true }));
Server.use(Exession({
	store: new Redission({
		client: Redis.createClient(),
		ttl: 3600 * 12
	}),
	secret: 'kkutu',
	resave: false,
	saveUninitialized: true
}));
//볕뉘 수정
Server.use(passport.initialize());
Server.use(passport.session());
Server.use((req, res, next) => {
	if(req.session.passport) {
		delete req.session.passport;
	}
	next();
});
Server.use((req, res, next) => {
	if(Const.IS_SECURED) {
		if(req.protocol == 'http') {
			let url = 'https://'+req.get('host')+req.path;
			res.status(302).redirect(url);
		} else {
			next();
		}
	} else {
		next();
	}
});
//볕뉘 수정 끝
//디도스 감지 및 차단
/*DDDoS = new DDDoS({
	maxWeight: 30,
	checkInterval: 900,
	rules: [{
		regexp: "^/(cf|dict|gwalli|rpRanking|corona)",
		maxWeight: 999 //40
	}, {
		regexp: "^/(dddos|in_dddos.css)",
		maxWeight: 60 //40
	}, {
		regexp: ".*"
	}]
});
DDDoS.rules[0].logFunction = DDDoS.rules[1].logFunction = function(ip, path){
	var date = moment().format("MM_DD_HH_mm"); //지금 이 시간 (월 일 시 분)
	JLog.warn(`DoS from IP ${ip} on ${path}`); //패킷을 보낸놈의 아이피를 따고
	fs.writeFileSync("../DDDoS/DDDoS_"+date+".txt", ip+"  "+date, 'utf8', function(err, ip, path) { //기록하고
		JLog.warn(`Completed writing IP Address ${ip} on ../DDDoS/DDDoS_`+date+`.txt`);
	})
	//process.exit(1);
	if(!maintenance) maintenance = true;
};
Server.use(DDDoS.express());*/
//디도스 감지 및 차단

WebInit.init(Server, true);
DB.ready = function(){
	setInterval(function(){
		var q = [ 'createdAt', { $lte: Date.now() - 3600000 * 12 } ];

		DB.session.remove(q).on();
	}, 600000);
	setInterval(function(){
		gameServers.forEach(function(v){
			if(v.socket) v.socket.send(`{"type":"seek"}`);
			else v.seek = undefined;
		});
	}, 4000);
	JLog.success("DB is ready.");

	DB.kkutu_shop_desc.find().on(function($docs){
		var i, j;

		for(i in Language) flush(i);
		function flush(lang){
			var db;

			Language[lang].SHOP = db = {};
			for(j in $docs){
				db[$docs[j]._id] = [ $docs[j][`name_${lang}`], $docs[j][`desc_${lang}`] ];
			}
		}
	});
	// 해티 수정
	webServer.use(vHost('bfkkutu.kr', Server));
	webServer.use(vHost('ynn4p5h2352x7qaqc6ew.a67k7qqcd8gys8rst2mc.kro.kr', Server));
	webServer.get('*', function(req, res) {
		res.status(hsc.StatusCodes.FORBIDDEN).send(`<h1>403 Forbidden</h1>`);
	});
	if(Const.IS_SECURED || Const.WS.ENABLED) {
		const options = Secure();
		https.createServer(options, webServer).listen(443);
	}else webServer.listen(80);
	// 해티 수정 끝
};
Const.MAIN_PORTS.forEach(function(v, i){
	var KEY = process.env['WS_KEY'];
	var protocol;
	
	if(!Const.WS.ENABLED){
		if(Const.IS_SECURED) protocol = 'wss';
		else protocol = 'ws';
	}else protocol = 'ws';
	
	gameServers[i] = new GameClient(KEY, `${protocol}://${GLOBAL.GAME_SERVER_HOST}:${v}/${KEY}`);
});
function GameClient(id, url){
	var my = this;

	my.id = id;
	my.socket = new WS(url, { perMessageDeflate: false, rejectUnauthorized: false });
	
	my.send = function(type, data){
		if(!data) data = {};
		data.type = type;

		my.socket.send(JSON.stringify(data));
	};
	my.socket.on('open', function(){
		JLog.info(`Game server #${my.id} connected`);
	});
	my.socket.on('error', function(err){
		JLog.warn(`Game server #${my.id} has an error: ${err.toString()} | ${err.code}`);
	});
	my.socket.on('close', function(code){
		JLog.error(`Game server #${my.id} closed: ${code}`);
		my.socket.removeAllListeners();
		delete my.socket;
	});
	my.socket.on('message', function(data){
		var _data = data;
		var i;

		data = JSON.parse(data);

		switch(data.type){
			case "seek":
				my.seek = data.value;
				break;
			case "narrate-friend":
				for(i in data.list){
					gameServers[i].send('narrate-friend', { id: data.id, s: data.s, stat: data.stat, list: data.list[i] });
				}
				break;
			default:
		}
	});
}
ROUTES.forEach(function(v){
	require(`./routes/${v}`).run(Server, WebInit.page);
});

Server.listen(3000); //For XSS

/*Server.use(xssFilter());
Server.use(xFrameOptions());
Server.use(nosniff());*/
Server.use(helmet());
Server.use(helmet.xssFilter());

Server.use(helmet.hsts({
	maxAge: 31536000,        // Must be at least 1 year to be approved
	includeSubDomains: true, // Must be enabled to be approved
	preload: true
}));

Server.use(hpkp({
	maxAge: hpkp_DIS,
	sha256s: [''],
	
	// Set the header based on a condition.
	// This is optional.
	setIf: function (req, res) {
		return req.secure
	}
}));

Server.use(referrerPolicy({ policy: 'same-origin' }));
// Referrer-Policy: same-origin
 
Server.use(referrerPolicy({ policy: 'unsafe-url' }));
// Referrer-Policy: unsafe-url
 
Server.use(referrerPolicy());
// Referrer-Policy: no-referrer

Server.get("/", cors(), function(req, res){
	var server = req.query.server;
	let loc = Const.MAIN_PORTS[server] ? 'kkutu' : 'portal';
	
	res.get('X-Frame-Options') // === 'Deny'
	
	//볕뉘 수정 구문삭제(220~229, 240)
	DB.session.findOne([ '_id', req.session.id ]).on(function($ses){
		// var sid = (($ses || {}).profile || {}).sid || "NULL";
		if(global.isPublic){
			onFinish($ses);
			// DB.jjo_session.findOne([ '_id', sid ]).limit([ 'profile', true ]).on(onFinish);
		}else{
			if($ses) $ses.profile.sid = $ses._id;
			onFinish($ses);
		}
	});
	function onFinish($doc){
		var id = req.session.id;
		var ptc = 'ws';
		
		if(Const.IS_SECURED || Const.WS.ENABLED) ptc = 'wss';

		if($doc){
			req.session.profile = $doc.profile;
			if($doc){
				if($doc.nickname && $doc.nickname != null) req.session.profile.title = req.session.profile.name = $doc.nickname;
			};
			id = $doc.profile.sid;
		}else{
			delete req.session.profile;
		}
		if(!maintenance){
			page(req, res, loc, {
				'_page': "kkutu",
				'_id': id,
				'PORT': Const.MAIN_PORTS[server],
				'HOST': Const.WS.ENABLED ? Const.WS.URI : req.hostname,
				'ALTERNATIVE_HOST': Const.WS.ALTERNATIVE_URI,
				'PROTOCOL': ptc,
				'TEST': req.query.test,
				'MOREMI_PART': Const.MOREMI_PART,
				'AVAIL_EQUIP': Const.AVAIL_EQUIP,
				'CATEGORIES': Const.CATEGORIES,
				'GROUPS': Const.GROUPS,
				'MODE': Const.GAME_TYPE,
				'RULE': Const.RULE,
				'OPTIONS': Const.OPTIONS,
				'KO_INJEONG': Const.KO_INJEONG,
				'KO_EVENT': Const.KO_EVENT,
				'EN_INJEONG': Const.EN_INJEONG,
				'KO_THEME': Const.KO_THEME,
				'EN_THEME': Const.EN_THEME,
				'IJP_EXCEPT': Const.IJP_EXCEPT,
				'ogImage': "https://bfkkutu.kr/img/kkutu/logo.png",
				'ogURL': "https://bfkkutu.kr/",
				'ogTitle': "새로운 끄투의 시작, BF끄투!",
				'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
			});
		}else{
			page(req, res, "dddos", {
				'_page': "kkutu",
				'_id': id,
				'PORT': Const.MAIN_PORTS[server],
				'HOST': req.hostname,
				'PROTOCOL': Const.IS_SECURED ? 'wss' : 'ws',
				'TEST': req.query.test,
				'MOREMI_PART': Const.MOREMI_PART,
				'AVAIL_EQUIP': Const.AVAIL_EQUIP,
				'CATEGORIES': Const.CATEGORIES,
				'GROUPS': Const.GROUPS,
				'MODE': Const.GAME_TYPE,
				'RULE': Const.RULE,
				'OPTIONS': Const.OPTIONS,
				'ogImage': "https://bfkkutu.kr/img/kkutu/logo.png",
				'ogURL': "https://bfkkutu.kr/",
				'ogTitle': "새로운 끄투의 시작, BF끄투!",
				'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
			});
		}
	}
});

Server.get("/servers", function(req, res){
	var list = [];
	
	gameServers.forEach(function(v, i){
		list[i] = v.seek;
	});
	res.send({ list: list, max: Const.KKUTU_MAX });
});

Server.get("//servers", function(req, res){
	var list = [];

	gameServers.forEach(function(v, i){
		list[i] = v.seek;
	});
	res.send({ list: list, max: Const.KKUTU_MAX });
});

Server.get("/adminList", function(req, res){
	res.send({ admin: GLOBAL.ADMIN });
});

Server.get("/newUser", function(req, res){
	var MainDB = DB,
		id = req.query.id;
		
	if(!req.query.cp){
		MainDB.users.findOne([ '_id', id ]).on(function($u){
			if(!$u) return res.sendStatus(404);
			else {
				return res.send({ newUser: $u.newuser }); // SEND ONLY
			}
		});
	}else if(req.query.cp == `${id}cp`){
		MainDB.users.findOne([ '_id', id ]).on(function($u){
			if(!$u) return res.sendStatus(404);
			else {
				if($u.newuser) MainDB.users.update([ '_id', id ]).set([ 'newuser', false ]).on(); // UPDATE DB
				else return res.sendStatus(404);
			}
		});
	}else return res.sendStatus(404);
});

Server.get("/portal_old", function(req, res){
	var server = req.query.server;
	
	//볕뉘 수정 구문삭제(220~229, 240)
	DB.session.findOne([ '_id', req.session.id ]).on(function($ses){
		// var sid = (($ses || {}).profile || {}).sid || "NULL";
		if(global.isPublic){
			onFinish($ses);
			// DB.jjo_session.findOne([ '_id', sid ]).limit([ 'profile', true ]).on(onFinish);
		}else{
			if($ses) $ses.profile.sid = $ses._id;
			onFinish($ses);
		}
	});
	function onFinish($doc){
		var id = req.session.id;
		var ptc = 'ws';
		
		if(Const.IS_SECURED || Const.WS.ENABLED) ptc = 'wss'

		if($doc){
			req.session.profile = $doc.profile;
			id = $doc.profile.sid;
		}else{
			delete req.session.profile;
		}
		page(req, res, "portal_backup", {
			'_page': "kkutu",
			'ogImage': "https://bfkkutu.kr/img/kkutu/logo.png",
			'ogURL': "https://bfkkutu.kr/",
			'ogTitle': "새로운 끄투의 시작, BF끄투!",
			'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
		});
	}
});

Server.get("/legal/:page", function(req, res){
	page(req, res, "legal/"+req.params.page);
});

Server.get("/server_status", function(req, res){
	page(req, res, "server_status");
});

Server.get("/unsupported", function(req, res){
	page(req, res, "unsupported");
});

Server.get("*", function(req, res){
	page(req, res, "notfound");
});