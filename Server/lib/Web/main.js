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

//XSS Filter
const xssFilter = require('x-xss-protection');
const xFrameOptions = require('x-frame-options');
const nosniff = require('dont-sniff-mimetype');

//HSTS
const hsts = require('hsts');

//HPKP
const hpkp = require('hpkp');
const hpkp_DIS = 7776000;

//Referrer Policy
const referrerPolicy = require('referrer-policy');

//CSP
const csp = require('helmet-csp');

// CORONA MAP
const request = require('request'),
	cheerio = require('cheerio');
	
var maintenance; // boolean

/*const ssri = require('ssri')
const sri = require('sri');
 
const integrity = sri.getSRIString('./lib/Web/public/js/in_portal.min.js'); // sha384-J5Dqvq3...

// Parsing and serializing
const parsed = ssri.parse(integrity)
ssri.stringify(parsed) // === integrity (works on non-Integrity objects)
parsed.toString() // === integrity
 
// Async stream functions
ssri.checkStream(fs.createReadStream('./lib/Web/public/js/in_portal.min.js'), integrity)
ssri.fromStream(fs.createReadStream('./lib/Web/public/js/in_portal.min.js')).then(sri => {
	sri.toString() === integrity
})
//fs.createReadStream('./lib/Web/public/js/in_portal.min.js').pipe(ssri.createCheckerStream(sri))

// Sync data functions
ssri.fromData(fs.readFileSync('./lib/Web/public/js/in_portal.min.js')) // === parsed
ssri.checkData(fs.readFileSync('./lib/Web/public/js/in_portal.min.js'), integrity) // => 'sha512'
*/
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
fs.watchFile("./lib/Web/lang/ko_KR.json", () => {
	Language = {
		'ko_KR': require("./lang/ko_KR.json"),
		'en_US': require("./lang/en_US.json")
	};
	JLog.info("ko_KR.json is Auto-Updated at {lib/Web/main.js}");
})
fs.watchFile("./lib/Web/lang/en_US.json", () => {
	Language = {
		'ko_KR': require("./lang/ko_KR.json"),
		'en_US': require("./lang/en_US.json")
	};
	JLog.info("en_US.json is Auto-Updated at {lib/Web/main.js}");
})
fs.watchFile("./lib/const.js", () => {
	GLOBAL	 = require("../const");
	JLog.info("const.js is Auto-Updated at {lib/Web/main.js}");
})
function getClientIp(req, res){
	var clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (clientIp.startsWith("::ffff:")) return clientIp.substr(7);
	
	return clientIp;
}
Server.use((req, res, _next) => {
	var clientIp = getClientIp(req, res);
	
	//console.log(`Packet from ${clientIp}`);
	
	if(IpFilters.ips.indexOf(clientIp) == -1) _next();
	else res.send(`<head><title>BF끄투 - 이용정지<style>body{ font-family:나눔바른고딕,맑은 고딕,돋움; }</style></head><body><script>alert("회원님의 아이피는 영구적으로 이용이 제한되었습니다.")</script><center><h2>회원님의 아이피는 영구적으로 이용이 제한되었습니다.</h2></body></center>`);
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
DDDoS = new DDDoS({
	maxWeight: 40,
	checkInterval: 750,
	rules: [{
		regexp: "^/(cf|dict|gwalli)",
		maxWeight: 40
	}, {
		regexp: ".*"
	}]
});
DDDoS.rules[0].logFunction = DDDoS.rules[1].logFunction = function(ip, path){
	var data = ip; //아이피를 data에 기록
	var date = moment().format("MM_DD_HH_mm"); //지금 이 시간 (월 일 시 분)
	JLog.warn(`DoS from IP ${ip} on ${path}`); //패킷을 보낸놈의 아이피를 따고
	fs.writeFileSync("../DDDoS/DDDoS_"+date+".txt", data+"  "+date, 'utf8', function(err, ip, path) { //기록하고
		JLog.warn(`Completed writing IP Address ${ip} on ../DDDoS/DDDoS_`+date+`.txt`);
	})
	//process.exit(1); //웹 서버를 조진다
	if(!maintenance) maintenance = true; // 첫번째 작동
	else process.exit(1); // 두번째 작동
};
Server.use(DDDoS.express());
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
	Server.listen(80);
	//Server.listen(443);
	if(Const.IS_SECURED) {
		const options = Secure();
		https.createServer(options, Server).listen(443);
	}
};
Const.MAIN_PORTS.forEach(function(v, i){
	var KEY = process.env['WS_KEY'];
	var protocol;
	if(Const.IS_SECURED) {
		protocol = 'wss';
	} else {
		protocol = 'ws';
	}
	gameServers[i] = new GameClient(KEY, `${protocol}://127.0.0.2:${v}/${KEY}`);
});
function GameClient(id, url){
	var my = this;

	my.id = id;
	my.socket = new WS(url, { perMessageDeflate: false, rejectUnauthorized: false});
	
	my.send = function(type, data){
		if(!data) data = {};
		data.type = type;

		my.socket.send(JSON.stringify(data));
	};
	my.socket.on('open', function(){
		JLog.info(`Game server #${my.id} connected`);
	});
	my.socket.on('error', function(err){
		JLog.warn(`Game server #${my.id} has an error: ${err.toString()}`);
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

Server.use(xssFilter());
Server.use(xFrameOptions());
Server.use(nosniff());

Server.use(hsts({
  maxAge: 31536000,        // Must be at least 1 year to be approved
  includeSubDomains: true, // Must be enabled to be approved
  preload: true
}));

Server.use(hpkp({
	maxAge: hpkp_DIS,
	sha256s: ['AbCdEf123=', 'ZyXwVu456='],
	
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

/*Server.use(csp({
	// Specify directives as normal.
	directives: {
		defaultSrc: ["'self'", 'https://bfk.playts.net/'],
		scriptSrc: ["'self'", 'https://bfk.playts.net/js/', "'unsafe-inline'"],
		styleSrc: ["'self'", 'https://bfk.playts.net/css/'],
		fontSrc: ['https://bfk.playts.net/media/'],
		mediaSrc: ['https://bfk.playts.net/media/'],
		imgSrc: ["'self'", 'https://bfk.playts.net/img/', 'data:'],
		sandbox: ['allow-forms', 'allow-scripts'],
		objectSrc: ["'none'"],
		upgradeInsecureRequests: true,
		workerSrc: false  // This is not set.
	},
	
	// This module will detect common mistakes in your directives and throw errors
	// if it finds any. To disable this, enable "loose mode".
	loose: false,
	
	// Set to true if you only want browsers to report errors, not block them.
	// You may also set this to a function(req, res) in order to decide dynamically
	// whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
	reportOnly: false,
	
	// Set to true if you want to blindly set all headers: Content-Security-Policy,
	// X-WebKit-CSP, and X-Content-Security-Policy.
	setAllHeaders: false,
	
	// Set to true if you want to disable CSP on Android where it can be buggy.
	disableAndroid: false,
	
	// Set to false if you want to completely disable any user-agent sniffing.
	// This may make the headers less compatible but it will be much faster.
	// This defaults to `true`.
	browserSniff: true
}));*/

Server.get("/", function(req, res){
	var server = req.query.server;
	
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

		if($doc){
			req.session.profile = $doc.profile;
			id = $doc.profile.sid;
		}else{
			delete req.session.profile;
		}
		if(!maintenance){
			page(req, res, Const.MAIN_PORTS[server] ? "kkutu" : "portal", {
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
				'KO_INJEONG': Const.KO_INJEONG,
				'EN_INJEONG': Const.EN_INJEONG,
				'KO_THEME': Const.KO_THEME,
				'EN_THEME': Const.EN_THEME,
				'IJP_EXCEPT': Const.IJP_EXCEPT,
				'ogImage': "https://bfk.opg.kr/img/kkutu/logo.png",
				'ogURL': "https://bfk.opg.kr/",
				'ogTitle': "새로운 끄투의 시작, BF끄투!",
				'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
			});
		}else{
			page(req, res, Const.MAIN_PORTS[server] ? "dddos" : "dddos", {
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
				'KO_INJEONG': Const.KO_INJEONG,
				'EN_INJEONG': Const.EN_INJEONG,
				'KO_THEME': Const.KO_THEME,
				'EN_THEME': Const.EN_THEME,
				'IJP_EXCEPT': Const.IJP_EXCEPT,
				'ogImage': "https://bfk.opg.kr/img/kkutu/logo.png",
				'ogURL': "https://bfk.opg.kr/",
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

Server.get("/corona", function(req, res){
	
	var url = "https://coronamap.site/";
	var post;
 

	request(url, (error, response, body) => {
		//if (error) throw error;

		let $ = cheerio.load(body);

		try {
			let cf = '', dd = '', cd = '';
			//  확진       사망      완치
			$('div.wa').find('div.content').each(function (index, elem) {
				cf = $(this).find('div').text().trim();
			});
			dd = $("div.wa").children("div.content1").children("div").text();
			cd = dd.split("사망");
			cd = cd[0].split("완치");
			cd = cd[1].trim();
			dd = dd.split("완치");
			dd = dd[1].split("사망");
			dd = dd[1].trim();
			res.send({ cf: cf, dd: dd, cd: cd });
		} catch (error) {
			console.error(error);
		}
	});
});

//볕뉘 수정 구문 삭제(274~353)

Server.get("/legal/:page", function(req, res){
	page(req, res, "legal/"+req.params.page);
});

/*Server.get("/gwallilogin", function(req, res){
	page(req, res, "join");
});*/

Server.get("/donate", function(req, res){
	page(req, res, "donate");
});

Server.get("/server_status", function(req, res){
	page(req, res, "server_status");
});

Server.get("/beta/portal", function(req, res){
	page(req, res, "beta_portal");
});

Server.get("/beta/kkutu", function(req, res){
	page(req, res, "beta_kkutu");
});
Server.get("/bfsoft", function(req, res){
	page(req, res, "bfsoft");
});
