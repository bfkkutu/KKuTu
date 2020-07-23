/*
	BFKKuTu Discord Bot Handler.
*/

var GLOBAL = require("../sub/global.json");
var JLog = require('../sub/jjlog');

const Discord = require('discord.js');
const Bot = new Discord.Client();

Bot.on("ready", () => {
	JLog.log(`Bot ${Bot.user.tag} is Ready.`);
});
exports.ban = function(target, reason, enddate){
	if(GLOBAL.BOT_OPTIONS.ENABLED) Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send('```제재 대상자: '+target.id+'('+target.nickname+')\n'+'제재 사유: '+reason+'\n'+'처리 결과: 계정 정지 ('+enddate+')```');
}
Bot.login(GLOBAL.BOT_OPTIONS.TOKEN);