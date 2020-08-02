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
exports.ban = function(target, judge, reason, enddate){
	if(GLOBAL.BOT_OPTIONS.ENABLED) Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send('```제재 대상자: '+target.id+' ('+target.nickname+')\n'+'제재 사유: '+reason+'\n'+'처리자: '+(judge ? judge : "알 수 없음" )+'\n'+'처리 결과: 계정 정지 ('+enddate+')```');
}
exports.warn = function(target, judge, warn, nowwarn){
	if(GLOBAL.BOT_OPTIONS.ENABLED) Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send('```제재 대상자: '+target._id+' ('+target.nickname+')\n'+'처리 결과: 경고 '+warn+'회 (현재 누적 '+nowwarn+'회)'+'\n'+'처리자: '+(judge ? judge : "알 수 없음" )+'```경고 사유는 처리자께서 따로 적어주시기 바랍니다.');
}
exports.word = function(type, theme, list){
	if(GLOBAL.BOT_OPTIONS.ENABLED){
		if(list == "") Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.WORD).send(`단어 ${type} 요청이 들어왔으나,\n요청된 단어들이 이미 ${type == "추가" ? "존재" : "부재"}합니다.`);
		else Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.WORD).send(`단어 ${type}/주제: ${theme}\n\n${list}`);
	}
}
Bot.login(GLOBAL.BOT_OPTIONS.TOKEN);