/*
	BFKKuTu Discord Bot 4.9.6
*/

let GLOBAL = require("../sub/global.json");

const JLog = require("../sub/jjlog");
const Outer = require("../sub/outer");

const Discord = require("discord.js");
const Bot = new Discord.Client();
let guild;

Bot.on("ready", () => {
    JLog.log(`Bot ${Bot.user.tag} is Ready.`);
	guild = Bot.guilds.cache.get("454921284028071946");
});
String.prototype.replaceAll = function (org, dest) {
    return this.split(org).join(dest);
};
String.prototype.discordify = function () {
	if(!guild.members.cache.has(this.substring(8))) return this;
	return this.includes("discord-") ? `<@${this.substring(8)}>` : this;
};
exports.ban = (target, judge, reason, bannedUntil) => {
    let message = new Discord.MessageEmbed()
        .setTitle("차단 | BFKKuTu")
        .setColor("FF0000")
        .addFields(
            { name: "제재 대상자", value: `${target.id.discordify()} (${target.nickname})` },
            { name: "제재 사유", value: reason },
            { name: "처리자", value: typeof judge === "string" ? judge.discordify() : "알 수 없음" },
            {
                name: "처리 결과",
                value: `계정 정지 (${
                    bannedUntil == "permanent"
                        ? "영구"
                        : Outer.parseDate(bannedUntil)
                })`,
            }
        );
    if (GLOBAL.BOT_OPTIONS.ENABLED)
        Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send(message);
};
exports.chatban = (target, judge, reason, bannedUntil) => {
    let message = new Discord.MessageEmbed(typeof judge === "string" ? judge.discordify() : "알 수 없음")
        .setTitle("채팅 금지 | BFKKuTu")
        .setColor("FFFF00")
        .addFields(
            { name: "제재 대상자", value: `${target.id.discordify()} (${target.nickname})` },
            { name: "제재 사유", value: reason },
            { name: "처리자", value: typeof judge === "string" ? judge.discordify() : "알 수 없음" },
            {
                name: "처리 결과",
                value: `채팅 금지 (${
                    bannedUntil == "permanent"
                        ? "영구"
                        : Outer.parseDate(bannedUntil)
                })`,
            }
        );
    if (GLOBAL.BOT_OPTIONS.ENABLED)
        Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send(message);
};
exports.warn = (target, judge, warn, newWarn, reason) => {
    if (warn == 0) return;
    let kind = warn > 0 ? "제재" : "차감";
    let message = new Discord.MessageEmbed()
        .setTitle(`경고 ${warn > 0 ? "" : "차감"} | BFKKuTu`)
        .setColor(warn > 0 ? "FFFF00" : "00FF00")
        .addFields(
            {
                name: `${kind} 대상자`,
                value: `${target._id.discordify()} (${target.nickname})`,
            },
            {
                name: `${kind} 사유`,
                value: reason || "(처리자 별도 기재 바람)",
            },
            { name: "처리자", value: typeof judge === "string" ? judge.discordify() : "알 수 없음" },
            {
                name: "처리 결과",
                value: `경고 ${Math.abs(warn)}회 ${
                    warn > 0 ? "" : "차감 "
                }(누적 ${newWarn}회)`,
            }
        );
    if (GLOBAL.BOT_OPTIONS.ENABLED)
        Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.BAN).send(message);
};
exports.word = (type, theme, list) => {
    let message;
    if (GLOBAL.BOT_OPTIONS.ENABLED) {
        if (list == "")
            message = new Discord.MessageEmbed()
                .setTitle("BF끄투 단어")
                .setDescription(
                    `단어 ${type} 요청이 들어왔으나,\n요청된 단어들이 이미 ${
                        type == "추가" ? "존재" : "부재"
                    }합니다.`
                );
        else
            message = new Discord.MessageEmbed()
                .setTitle("BF끄투 단어")
                .setDescription(`단어 ${type}/주제: ${theme}\n\n${list}`);
        Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.WORD).send(message);
    }
};
exports.wordReq = (submitter, theme, list) => {
    let message;
    if (GLOBAL.BOT_OPTIONS.ENABLED) {
		message = new Discord.MessageEmbed()
			.setTitle("BF끄투 단어 추가 요청")
			.setDescription(`주제: ${theme}\n\n${list}`);
        Bot.channels.cache.get(GLOBAL.BOT_OPTIONS.CHANNELS.WORDREQ).send(message);
    }
};
Bot.login(GLOBAL.BOT_OPTIONS.TOKEN);
