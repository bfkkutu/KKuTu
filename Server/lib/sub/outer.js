/*
	outer.js
*/
const Const = require("../const")

exports.randomInt = function(i){
	if(typeof i != "number") return 0;
	else return Math.floor(Math.random() * i) + 1;
};
exports.random = function(n1, n2) {
	if(typeof n1 != "number" || typeof n2 != "number") return 0;
	else return parseInt(Math.random() * (n2 -n1 +1)) + n1;
};
exports.getPreScore = function(text, chain, tr){
	return 2 * (Math.pow(5 + 7 * (text || "").length, 0.74) + 0.88 * (chain || []).length) * ( 0.5 + 0.5 * tr );
};
exports.getPenalty = function(chain, score){
	return -1 * Math.round(Math.min(10 + (chain || []).length * 2.1 + score * 0.15, score));
};
exports.getRule = function(mode){
	return Const.RULE[Const.GAME_TYPE[mode]];
};