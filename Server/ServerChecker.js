/*const Discord = require('discord.js');
const Bot = new Discord.Client();
let Config = require("./lib/sub/config.json");

Bot.on('ready', ()=> {
	console.log("Server-Checker Bot is Ready.")
	Bot.user.setActivity(`서버 접속자를 계산하고 있습니다...`);
})
Bot.login(Config.$token)

module.exports = {
	"Bot": Bot,
	"login":()=> Bot.login(Config.$token),
	"ready":(callback)=> Bot.on('ready', callback),
	"on":(type, callback)=> Bot.on(type, callback),
	"reboot":()=> {
		Config = require("./lib/sub/config.json");
		Bot.login(Config.$token)
	},
	"sendNotice":(value, color)=> {
		Bot.channels.get(Config.cid).send("", {
			embed: {
				title:"서버 상태",
				description:value,
				color:color
			}
		})
	}
};*/