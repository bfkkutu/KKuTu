/*
	BFKKuTu Discord Bot 4.9.6
*/

var GLOBAL = require("../sub/global.json");
var JLog = require('../sub/jjlog');

const Discord = require('discord.js');
const Bot = new Discord.Client();

Bot.on("ready", () => {
	JLog.log(`Bot ${Bot.user.tag} is Ready.`);
});
String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}
exports.ban = function(target, reason, enddate){
	if(GLOBAL.BOT_OPTIONS.ENABLED) Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send('```제재 대상자: '+target.id+'('+target.nickname+')\n'+'제재 사유: '+reason+'\n'+'처리 결과: 계정 정지 ('+enddate+')```');
}
exports.word = function(type, theme, list){
	list = JSON.stringify(list).replace("[", "").replace("]", "").replaceAll('"', "")
	if(list.includes(",")) list = list.replaceAll(",", "\n")
	if(GLOBAL.BOT_OPTIONS.ENABLED) Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.WORD).send(`단어 ${type}/주제: ${theme}\n\n${list}`);
}
Bot.login(GLOBAL.BOT_OPTIONS.TOKEN);