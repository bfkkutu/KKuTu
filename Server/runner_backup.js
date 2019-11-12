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

const Spawn = require("child_process").spawn;
const Request = require('request');
const JLog = require("./lib/sub/jjlog");
const PKG = require("./package.json");
const LANG = require("../language.json");
const SETTINGS = require("../settings.json");
let ServerChecker = require("./ServerChecker.js");
let Config = require("./lib/sub/config.json");
let def_Server = false;
const SCRIPTS = {
	'server-on':()=> {
		startServer(def_Server)
		def_Server = true;
	},
	'server-off':()=> {
		stopServer()
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
	'program-blog': () => exports.send('external', "http://blog.jjo.kr/"),
	'program-repo': () => exports.send('external', "https://github.com/JJoriping/KKuTu"),
	'exit': () => process.exit(0)
};
exports.MAIN_MENU = [
	{
		label: LANG['menu-server'],
		submenu: [
			{
				label: LANG['menu-server-on'],
				accelerator: "CmdOrCtrl+O",
				click: () => exports.run("server-on")
			},
			{
				label: LANG['menu-server-off'],
				accelerator: "CmdOrCtrl+P",
				click: () => exports.run("server-off")
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
				label: LANG['menu-program-blog'],
				click: () => exports.run("program-blog")
			},
			{
				label: LANG['menu-program-repo'],
				click: () => exports.run("program-repo")
			},
			{
				label: LANG['menu-program-dev'],
				role: "toggledevtools"
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
		label: "서버상태 봇",
		submenu: [
			{
				label: "재부팅",
				click: ServerChecker.reboot
			},
			{
				label: "재로드",
				click:()=> ServerChecker = require("./ServerChecker.js")
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
		});
		this.process.stderr.on('data', msg => {
			console.error(`${id}: ${msg}`);
			exports.send('log', 'e', msg);
		});
		this.process.on('close', code => {
			let msg;

			this.process.removeAllListeners();
			JLog.error(msg = `${id}: CLOSED WITH CODE ${code}`);
			this.process = null;

			exports.send('log', 'e', msg);
			exports.send('server-status', getServerStatus());
		});
	}
	kill(sig){
		if(this.process) this.process.kill(sig || 'SIGINT');
	}
}
let webServer, gameServers;

function startServer(){
	stopServer(false);
	if(SETTINGS['server-name']) process.env['KKT_SV_NAME'] = SETTINGS['server-name'];
	
	webServer = new ChildProcess('W', "node", `${__dirname}/lib/Web/cluster.js`, SETTINGS['web-num-cpu']);
	gameServers = [];
	
	for(let i=0; i<SETTINGS['game-num-inst']; i++){
		gameServers.push(new ChildProcess('G', "node", `${__dirname}/lib/Game/cluster.js`, i, SETTINGS['game-num-cpu']));
	}
	exports.send('server-status', getServerStatus());
	ServerChecker.sendNotice(":white_check_mark: 열림", 3066993)
}
function stopServer(notice){
	if(webServer) webServer.kill();
	if(gameServers) gameServers.forEach(v => v.kill());
	if(notice) ServerChecker.sendNotice(":negative_squared_cross_mark: 닫힘*(수동)*", 10038562)
}
function getServerStatus(){
	if(!webServer || !gameServers) return 0;
	if(webServer.process && gameServers.every(v => v.process)) return 2;
	return 1;
}
ServerChecker.ready(function(){
	/*let userCount = ServerChecker.getUsers();
	ServerChecker.setGame()
	setInterval(ServerChecker.setGame, 7000)
	setInterval(()=> {
		userCount = ServerChecker.getUsers();
	}, 5000)*/
	setInterval(()=> {
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
})