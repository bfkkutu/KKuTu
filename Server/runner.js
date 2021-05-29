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

const fs = require('fs');
const Spawn = require("child_process").spawn;
const Request = require('request');
const JLog = require("./lib/sub/jjlog");
const PKG = require("./package.json");
const LANG = require("../language.json");
const SETTINGS = require("../settings.json");
//let ServerChecker = require("./ServerChecker.js");
let Config = require("./lib/sub/config.json");
let def_Server = false;
const SCRIPTS = {
	'server-on-all':()=> {
		startServer()
	},
	'server-off-all':()=> {
		stopServer()
	},
	'webServer-on':()=> {
		startWeb()
	},
	'webServer-off':()=> {
		stopWeb()
	},
	'gameServer-on':()=> {
		startGame()
	},
	'gameServer-off':()=> {
		stopGame()
	},
	'webSocket-on':()=> {
		startWebSocket()
	},
	'webSocket-off':()=> {
		stopWebSocket()
	},
	'sorrydlBot-on':()=> {
		startSorrydlBot()
	},
	'sorrydlBot-off':()=> {
		stopSorrydlBot()
	},
	'private-on':()=> {
		startPrivate()
	},
	'private-off':()=> {
		stopPrivate()
	},
	'program-info': () => {
		exports.send('alert', [
			`=== ${PKG.name} ===`,
			`${PKG.description}`, "",
			`Version: ${PKG.version}`,
			`Author: ${PKG.author}`,
			`License: ${PKG.license}`,
			`Repository: ${PKG.repository}`
		].join('\n'));
	},
	'program-repo': () => exports.send('external', "https://github.com/lshqqytiger/KKuTu"),
	'sv-conn': () => exports.send('external', "https://bfkkutu.kr"),
	'exit': () => process.exit(0),
	'sendcommand': () => sendcommand()
};
// 해티 수정 (42~97)
if (SETTINGS.log.enabled) {
	const winston = require('winston');
	const winstonDaily = require('winston-daily-rotate-file');
	const moment = require('moment');
	
	function timeStampFormat() {
		return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
	};
	
	var logger = winston.createLogger({
		format: winston.format.simple(),
		transports: [
			new (winstonDaily)({
				name: 'info-file',
				filename: SETTINGS.log.infopath,
				datePattern: SETTINGS.log.datepattern,
				colorize: false,
				maxsize: SETTINGS.log.maxsize,
				maxFiles: SETTINGS.log.maxfile,
				level: 'info',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			}),
			new (winston.transports.Console)({
				name: 'debug-console',
				colorize: true,
				level: 'debug',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			})
		],
		exceptionHandlers: [
			new (winstonDaily)({
				name: 'exception-file',
				filename: SETTINGS.log.exceptionpath,
				datePattern: SETTINGS.log.datepattern,
				colorize: false,
				maxsize: SETTINGS.log.maxsize,
				maxFiles: SETTINGS.log.maxfile,
				level: 'error',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			}),
			new (winston.transports.Console)({
				name: 'exception-console',
				colorize: true,
				level: 'debug',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			})
		]
	})
};
// 해티 수정 끝
exports.MAIN_MENU = [
	{
		label: LANG['menu-server'],
		submenu: [
			{
				label: LANG['menu-server-on-all'],
				accelerator: "CmdOrCtrl+O",
				click: () => exports.run("server-on-all")
			},
			{
				label: LANG['menu-server-off-all'],
				accelerator: "CmdOrCtrl+P",
				click: () => exports.run("server-off-all")
			},
			{
				label: LANG['menu-webServer-on'],
				click: () => exports.run("webServer-on")
			},
			{
				label: LANG['menu-webServer-off'],
				click: () => exports.run("webServer-off")
			},
			{
				label: LANG['menu-gameServer-on'],
				click: () => exports.run("gameServer-on")
			},
			{
				label: LANG['menu-gameServer-off'],
				click: () => exports.run("gameServer-off")
			},
			{
				label: LANG['menu-webSocket-on'],
				click: () => exports.run("webSocket-on")
			},
			{
				label: LANG['menu-webSocket-off'],
				click: () => exports.run("webSocket-off")
			},
			{
				label: LANG['menu-sorrydlBot-on'],
				click: () => exports.run("sorrydlBot-on")
			},
			{
				label: LANG['menu-sorrydlBot-off'],
				click: () => exports.run("sorrydlBot-off")
			},
			{
				label: LANG['menu-private-on'],
				click: () => exports.run("private-on")
			},
			{
				label: LANG['menu-private-off'],
				click: () => exports.run("private-off")
			}
		]
	},
	{
		label: LANG['menu-program'],
		submenu: [
			{
				label: LANG['menu-program-info'],
				click: () => exports.run("program-info")
			},
			{
				label: LANG['menu-program-repo'],
				click: () => exports.run("program-repo")
			},
			{ type: "separator" },
			{
				label: LANG['menu-program-exit'],
				accelerator: "Alt+F4",
				click: () => exports.run("exit")
			}
		]
	},
	{
		label: "SVMGR",
		submenu: [
			{
				label: "CONN",
				click: () => exports.run("sv-conn")
			}
		]
	}
];
exports.run = (cmd) => {
	SCRIPTS[cmd]();
};
exports.send = (...argv) => {
	// override this
};

class ChildProcess{
	constructor(id, cmd, ...argv){
		this.process = Spawn(cmd, argv);
		this.process.stdout.on('data', msg => {
			exports.send('log', 'n', msg);
			// 해티 수정
			if (SETTINGS.log.enabled) logger.info(msg);
		});
		this.process.stderr.on('data', msg => {
			console.error(`${id}: ${msg}`);
			exports.send('log', 'e', msg);
			// 해티 수정
			if (SETTINGS.log.enabled) logger.error("[ERROR]"+msg);
		});
		this.process.on('close', code => {
			let msg;

			this.process.removeAllListeners();
			JLog.error(msg = `${id}: CLOSED WITH CODE ${code}`);
			this.process = null;

			exports.send('log', 'e', msg);
			exports.send('server-status', getServerStatus());
			// 해티 수정
			if (SETTINGS.log.enabled) logger.error("[ERROR]"+msg);
		});
	}
	kill(sig){
		if(this.process) this.process.kill(sig || 'SIGINT');
	}
}
let webServer, gameServers, webSocket, sorrydlBot, privateServer;

function startServer(){
	stopServer();
	if(SETTINGS['server-name']) process.env['KKT_SV_NAME'] = SETTINGS['server-name'];
	if(SETTINGS.web.enabled) webServer = new ChildProcess('W', "node", `${__dirname}/lib/Web/cluster.js`, SETTINGS.web.cpu);
	if(SETTINGS.game.enabled) {
		gameServers = [];	
		for(let i=0; i<SETTINGS.game.inst; i++){
			gameServers.push(new ChildProcess('G', "node", `${__dirname}/lib/Game/cluster.js`, i, SETTINGS.game.cpu));
		}
	}
	if(SETTINGS.ws.enabled) webSocket = new ChildProcess('H', "node", `${__dirname}/lib/Handler/cluster.js`, SETTINGS.ws.cpu);
	if(SETTINGS.sdb.enabled) sorrydlBot = new ChildProcess('S', "node", `${__dirname}/lib/Sorrydl/cluster.js`, SETTINGS.sdb.cpu);
	if(SETTINGS.pvt.enabled) privateServer = new ChildProcess('P', "node", `${__dirname}/lib/Private/cluster.js`, SETTINGS.pvt.cpu);
	exports.send('server-status', getServerStatus());
	//ServerChecker.sendNotice(":white_check_mark: 열림", 3066993)
}
function stopServer(){
	if(webServer) webServer.kill();
	if(gameServers) gameServers.forEach(v => v.kill());
	if(webSocket) webSocket.kill();
	if(sorrydlBot) sorrydlBot.kill();
	if(privateServer) privateServer.kill();
	//if(notice) ServerChecker.sendNotice(":negative_squared_cross_mark: 닫힘*(수동)*", 10038562)
}

function startWeb(){
	stopWeb();
	if(SETTINGS.web.enabled) webServer = new ChildProcess('W', "node", `${__dirname}/lib/Web/cluster.js`, SETTINGS.web.cpu);
	exports.send('server-status', getServerStatus());
}
function stopWeb(){
	if(webServer) webServer.kill();
}

function startGame(){
	stopGame();
	if(SETTINGS.game.enabled) {
		gameServers = [];	
		for(let i=0; i<SETTINGS.game.inst; i++){
			gameServers.push(new ChildProcess('G', "node", `${__dirname}/lib/Game/cluster.js`, i, SETTINGS.game.cpu));
		}
	}
	exports.send('server-status', getServerStatus());
}
function stopGame(){
	if(gameServers) gameServers.forEach(v => v.kill());
}

function startWebSocket(){
	stopWebSocket();
	if(SETTINGS.ws.enabled) webSocket = new ChildProcess('H', "node", `${__dirname}/lib/Handler/cluster.js`, SETTINGS.ws.cpu);
	exports.send('server-status', getServerStatus());
}
function stopWebSocket(){
	if(webSocket) webSocket.kill();
}

function startSorrydlBot(){
	stopSorrydlBot();
	if(SETTINGS.sdb.enabled) sorrydlBot = new ChildProcess('S', "node", `${__dirname}/lib/Sorrydl/cluster.js`, SETTINGS.sdb.cpu);
	exports.send('server-status', getServerStatus());
}
function stopSorrydlBot(){
	if(sorrydlBot) sorrydlBot.kill();
}

function startPrivate(){
	stopPrivate();
	if(SETTINGS.pvt.enabled) privateServer = new ChildProcess('P', "node", `${__dirname}/lib/Private/cluster.js`, SETTINGS.pvt.cpu);
	exports.send('server-status', getServerStatus());
}
function stopPrivate(){
	if(privateServer) privateServer.kill();
}

function getServerStatus(){
	// 해티 수정 (203~209)
	if(SETTINGS.web.enabled && SETTINGS.game.enabled) {
		if(!webServer || !gameServers) return 0;
		if(webServer.process && gameServers.every(v => v.process)) return 2;
	} else if(SETTINGS.web.enabled || SETTINGS.game.enabled) {
		if(!webServer && !gameServers) return 0;
		if(webServer.process || gameServers.every(v => v.process)) return 2;
	}
	return 1;
}
//ServerChecker.ready(function(){
	/*let userCount = ServerChecker.getUsers();
	ServerChecker.setGame()
	setInterval(ServerChecker.setGame, 7000)
	setInterval(()=> {
		userCount = ServerChecker.getUsers();
	}, 5000)*/
	/*setInterval(()=> {
		Request(Config.serverUrl+"servers", (err, res, html)=> {
			if(err != null) return console.error(err)
			if(!html) return ServerChecker.Bot.user.setActivity(`현재 ${Config.serverName}는 닫혀 있습니다.`);
			
			var userCount = JSON.parse(html).list[0];
			
			if(userCount == null || userCount == 0) return ServerChecker.Bot.user.setActivity(`현재 ${Config.serverName}에 접속되어 있는 유저가 없습니다.`);
			else ServerChecker.Bot.user.setActivity(`현재 ${Config.serverName}에 ${JSON.parse(html).list[0]}명이 접속되어 있습니다.`);
		})
	}, 2100);
	
	
	ServerChecker.on('message', (message)=> {
		var cmsg = message.content;
		
		if(cmsg.startsWith(Config.prefix+"서버상태") || cmsg.startsWith(Config.prefix+"서버확인") || cmsg.startsWith(Config.prefix+"서버")) {
			var statusCode = getServerStatus();
			
			function sendStatus(value, color){
				message.channel.send("", {
					embed: {
						title:"서버 상태",
						description:value,
						color:color
					}
				})
			}
			switch(statusCode){
				case 0:
					sendStatus(":negative_squared_cross_mark: 닫힘*(수동)*", 10038562);
					break;
				case 1:
					sendStatus(":negative_squared_cross_mark: 닫힘*(오류)*", 15158332);
					break;
				case 2:
					sendStatus(":white_check_mark: 열림", 3066993);
					break;
			}
		}
		if(cmsg.startsWith(Config.prefix+"접속자") || cmsg.startsWith(Config.prefix+"접속유저") || cmsg.startsWith(Config.prefix+"접속수")){
			Request(Config.serverUrl+"servers", (err, res, html)=> {
				if(err != null) return console.error(err)
				if(!html) return "접속자를 계산할 수 없습니다 (서버 닫힘)";
				
				message.channel.send("", {
					embed: {
						title:"접속자 카운트",
						description:JSON.parse(html).list[0],
						color:3066993
					}
				})
			})
		}
	});
})*/