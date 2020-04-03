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

var Const = require('../../const');
var Lizard = require('../../sub/lizard');
var DB;
var DIC;
/* 봇 정보 */
const ROBOT_START_DELAY = [ 1200, 800, 400, 200, 0 ];
const ROBOT_TYPE_COEF = [ 1250, 750, 500, 250, 0 ];
const ROBOT_THINK_COEF = [ 4, 2, 1, 0, 0 ]; /* 생각하는 시간 */
const ROBOT_HIT_LIMIT = [ 1000 ]; /* 횟수 제한 */
const ROBOT_LENGTH_LIMIT = [ 3, 4, 9, 99, 99 ]; /* 길이 제한 */
/* 두음 법칙 */
const RIEUL_TO_NIEUN = [4449, 4450, 4457, 4460, 4462, 4467]; /* ㄹ - ㄴ */
const RIEUL_TO_IEUNG = [4451, 4455, 4456, 4461, 4466, 4469]; /* ㄹ - ㅇ */
const NIEUN_TO_IEUNG = [4455, 4461, 4466, 4469]; /* ㄴ - ㅇ */

exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	var l = my.rule;
	var EXAMPLE;
	var eng, ja;
	var gamemode = Const.GAME_TYPE[my.mode]

	if(!l){
		R.go("undefinedd");
		return R;
	}
	if(!l.lang){
		R.go("undefinedd");
		return R;
	}
	EXAMPLE = Const.EXAMPLE_TITLE[l.lang];
	my.game.dic = {};
	
	switch(gamemode){
		case 'EKT':
		case 'ESH':
			eng = "^" + String.fromCharCode(97 + Math.floor(Math.random() * 26));
			break;
		case 'EAP':
			eng = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + "$";
			break;
		case 'KLH':
			my.game.wordLength = my.wordLimit;
			ja = 44032 + 588 * Math.floor(Math.random() * 18);
			eng = "^[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
			break;
		case 'KKT':
			my.game.wordLength = 3;
		case 'KUT':
		case 'KSH':
			ja = 44032 + 588 * Math.floor(Math.random() * 18);
			eng = "^[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
			break;
		case 'KAP':
			ja = 44032 + 588 * Math.floor(Math.random() * 18);
			eng = "[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]$";
			break;
	}
	function tryTitle(h){
		if(h > 50){
			R.go(EXAMPLE);
			return;
		}
		DB.kkutu[l.lang].find(
			[ '_id', new RegExp(eng + ".{" + Math.max(1, my.round - 1) + "}$") ],
			// [ 'hit', { '$lte': h } ],
			(l.lang == "ko") ? [ 'type', Const.KOR_GROUP ] : [ '_id', Const.ENG_ID ]
			// '$where', eng+"this._id.length == " + Math.max(2, my.round) + " && this.hit <= " + h
		).limit(20).on(function($md){
			var list;
			
			if($md.length){
				list = shuffle($md);
				checkTitle(list.shift()._id).then(onChecked);
			
				function onChecked(v){
					if(v) R.go(v);
					else if(list.length) checkTitle(list.shift()._id).then(onChecked);
					else R.go(EXAMPLE);
				}
			}else{
				tryTitle(h + 10);
			}
		});
	}
	function checkTitle(title){
		var R = new Lizard.Tail();
		var i, list = [];
		var len;
		
		/* 부하가 너무 걸린다면 주석을 풀자.
		R.go(true);
		return R;
		*/
		if(title == null){
			R.go(EXAMPLE);
		}else{
			len = title.length;
			if(!my.opts.ignoreinitial){
				for(i=0; i<len; i++) list.push(getAuto.call(my, my.game.theme, title[i], getSubChar.call(my, title[i]), 1));
			}else if(my.opts.ignoreinitial){
				for(i=0; i<len; i++) list.push(getAuto.call(my, my.game.theme, title[i], 1));
			}
			Lizard.all(list).then(function(res){
				for(i in res) if(!res[i]) return R.go(EXAMPLE);
				
				return R.go(title);
			});
		}
		return R;
	}
	tryTitle(10);
	
	return R;
};
exports.roundReady = function(){
	var my = this;
	if(!my.game.title) return;
	
	clearTimeout(my.game.turnTimer);
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	my.opts.randomMission = my.opts.abcmission;
	if(my.game.round <= my.round){
		if(my.opts.injpick.length > 0){ // injpick은 무조건 존재하므로 존재 여부 말고 길이로 유효성을 판단함
			var ijl = my.opts.injpick.length;
			my.game.theme = my.opts.injpick[Math.floor(Math.random() * ijl)];
		}else my.game.theme = false;
		my.game.char = my.game.title[my.game.round - 1];
	if(!my.opts.ignoreinitial){
		my.game.subChar = getSubChar.call(my, my.game.char);
	}else if(my.opts.ignoreinitial){
			my.game.subChar = null;
		}
		
		if(my.game.round === 1) my.game.chain = []; // First Round
		
		if(my.opts.ogow){
			my.game.chain = my.game.chain;
		} else {
			my.game.chain = []; // RESET
		}
		
		if(my.opts.mission) {
			if (my.opts.moremission) { // 더 많은 미션이 있으면
				my.game.mission = getMission(my.rule.lang, 'more');
			} else if (!my.opts.moremission && my.opts.randomMission) { // 랜덤미션이 있으면
				my.game.mission = getMission(my.rule.lang, 'random');
			} else {
				my.game.mission = getMission(my.rule.lang, 'normal');
			}
			//if(my.opts.randomMission) my.game.mission = getMission(my.rule.lang);
		}
		
		if(my.opts.blockWord){
			my.game.blockWord = getBlockWord(my.rule.lang);
		}
			
		if(my.opts.sami) my.game.wordLength = 2;
		
		my.byMaster('roundReady', {
			round: my.game.round,
			wordLimit: my.game.wordLimit,
			char: my.game.char,
			subChar: my.game.subChar,
			theme: my.game.theme,
			mission: my.game.mission,
			blockWord: my.game.blockWord
		}, true);
		my.game.turnTimer = setTimeout(my.turnStart, 2400);
	}else{
		my.roundEnd();
	}
};
exports.turnStart = function(force){
	var my = this;
	var speed;
	var si;
	
	if(!my.game.chain) return;
	my.opts.randomMission = my.opts.abcmission;
	my.game.roundTime = Math.min(my.game.roundTime, Math.max(10000, 600000 - my.game.chain.length * 1500));
	speed = my.getTurnSpeed(my.game.roundTime);
	clearTimeout(my.game.turnTimer);
	clearTimeout(my.game.robotTimer);
	my.game.late = false;
	my.game.turnTime = 15000 - 1400 * speed;
	my.game.turnAt = (new Date()).getTime();
	if(my.opts.sami) my.game.wordLength = (my.game.wordLength == 3) ? 2 : 3;
	
	if(my.opts.mission) {
		/*if(!my.opts.abcmission){
			my.game.mission = getMission(my.rule.lang); //가나다 미션이 없으면
		} else if(my.opts.abcmission){
			my.game.mission = getMission_abc(); //있으면
		}*/
		
		// my.game.mission = getMission(my.rule.lang, my.opts);
		if (!my.opts.moremission && my.opts.randomMission) { // 랜덤미션이 있으면
			my.game.mission = getMission(my.rule.lang, 'random');
		}
		if (my.opts.moremission && my.opts.randomMission) {
			my.game.mission = getMission(my.rule.lang, 'more');
		}
	}
	
	if(my.opts.blockWord){
		my.game.blockWord = getBlockWord(my.rule.lang);
	}
	my.byMaster('turnStart', {
		turn: my.game.turn,
		char: my.game.char,
		subChar: my.game.subChar,
		speed: speed,
		roundTime: my.game.roundTime,
		turnTime: my.game.turnTime,
		mission: my.game.mission,
		blockWord: my.game.blockWord,
		wordLength: my.game.wordLength,
		wordLimit: my.game.wordLimit,
		seq: force ? my.game.seq : undefined
	}, true);
	my.game.turnTimer = setTimeout(my.turnEnd, Math.min(my.game.roundTime, my.game.turnTime + 100));
	if(si = my.game.seq[my.game.turn]) if(si.robot){
		si._done = [];
		my.readyRobot(si);
	}
};
exports.turnEnd = function(){
	var my = this;
	var target;
	var score;
	
	if(!my.game.seq) return;
	target = DIC[my.game.seq[my.game.turn]] || my.game.seq[my.game.turn];
	
	if(my.game.loading){
		my.game.turnTimer = setTimeout(my.turnEnd, 100);
		return;
	}
	my.game.late = true;
	if(target) if(target.game){
		score = Const.getPenalty(my.game.chain, target.game.score);
		target.game.score += score;
	}
	getAuto.call(my, my.game.theme, my.game.char, my.game.subChar, 0).then(function(w){
		my.byMaster('turnEnd', {
			ok: false,
			target: target ? target.id : null,
			score: score,
			hint: w
		}, true);
		my.game._rrt = setTimeout(my.roundReady, 3000);
	});
	clearTimeout(my.game.robotTimer);
};
exports.submit = function(client, text){
	var score, l, t;
	var my = this;
	var tv = (new Date()).getTime();
	var mgt = my.game.seq[my.game.turn];
	
	if(!mgt) return;
	if(!mgt.robot) if(mgt != client.id) return;
	if(!my.game.char) return;
	
	if(!isChainable(text, my.mode, my.game.char, my.game.subChar)) return client.chat(text);
	if(my.game.chain.indexOf(text) != -1 && !my.opts.returns) return client.publish('turnError', { code: 409, value: text }, true);
	
	l = my.rule.lang;
	my.game.loading = true;
	my.opts.randomMission = my.opts.abcmission;
	function onDB($doc){
		if(!my.game.chain) return;
		var preChar = getChar.call(my, text, my.game.round);
		if(!my.opts.ignoreinitial){
			var preSubChar = getSubChar.call(my, preChar);
		}else if(my.opts.ignoreinitial){
			var preSubChar;
		}
		var firstMove = my.game.chain.length < 1;
		
		function preApproved(){
			function approved(){
				if(my.game.late) return;
				if(!my.game.chain) return;
				if(!my.game.dic) return;
				
				my.opts.randomMission = my.opts.abcmission;
				my.game.loading = false;
				my.game.late = true;
				clearTimeout(my.game.turnTimer);
				t = tv - my.game.turnAt;
				score = my.getScore(text, t);
				my.game.dic[text] = (my.game.dic[text] || 0) + 1;
				my.game.chain.push(text);
				my.game.roundTime -= t;
				my.game.char = preChar;
				my.game.subChar = preSubChar;
				client.game.score += score;
				client.publish('turnEnd', {
					ok: true,
					value: text,
					mean: $doc ? $doc.mean : null,
					theme: $doc ? $doc.theme : null,
					wc: $doc ? $doc.type : null,
					score: score,
					bonus: (my.game.mission === true) ? score - my.getScore(text, t, true) : 0,
					baby: $doc ? $doc.baby : null
				}, true);
				if(my.game.mission === true){
					/*if(my.opts.abcmission){
						my.game.mission = getMission_abc();
					} else if (!my.opts.abcmission){
						my.game.mission = getMission(my.rule.lang);
					}*/
					if (my.opts.moremission) { // 더 많은 미션이 있으면
						my.game.mission = getMission(my.rule.lang, 'more');
					} else if (!my.opts.moremission && my.opts.randomMission) { // 랜덤미션이 있으면
						my.game.mission = getMission(my.rule.lang, 'random');
					} else {
						my.game.mission = getMission(my.rule.lang, 'normal');
					}
				}
				if(my.game.blockWord === true){
					my.game.blockWord = getBlockWord(my.rule.lang);
				}
				setTimeout(my.turnNext, my.game.turnTime / 6);
				if(!client.robot){
					client.invokeWordPiece(text, 1);
					try{DB.kkutu[l].update([ '_id', text ]).set([ 'hit', $doc.hit + 1 ]).on()}
					catch(a){}
				}
			}
			if(!my.opts.unknownword && (firstMove || my.opts.manner)) getAuto.call(my, my.game.theme, preChar, preSubChar, 1).then(function(w){
				if(w) approved();
				else {
					my.game.loading = false;
					client.publish('turnError', { code: firstMove ? 402 : 403, value: text }, true);
					if(client.robot){
						my.readyRobot(client);
					}
				}
			});
			else approved();
		}
		function denied(code){
			my.game.loading = false;
			client.publish('turnError', { code: code || 404, value: text }, true);
		}
		function check_word(word){
			return word.match(/^[ \-\_0-9A-Za-zぁ-ヾㄱ-ㅣ가-힣]*$/)
		}
		/*function replaceWord(word) {
			if (word.match(/^[ \-\_0-9A-Za-zぁ-ヾㄱ-ㅣ가-힣]*$/)) return word.replace(/^[ \-\_0-9A-Za-zぁ-ヾㄱ-ㅣ가-힣]*$/gi, "");
			return word;
		}*/
		if($doc){
			var gamemode = Const.GAME_TYPE[my.mode]
			if(my.opts.blockWord && my.opts.mission) denied();
			if(my.opts.blockWord){
				if(text.match(blockWord)){
					denied(415);
				}
			}
			if(my.game.theme){
				if($doc.theme.match(toRegex(my.game.theme)) == null) denied(407);
				else preApproved();
			}else if(!my.opts.injeong && ($doc.flag & Const.KOR_FLAG.INJEONG)) denied();
			else if(my.opts.strict && (!$doc.type.match(Const.KOR_STRICT) || $doc.flag >= 4)) denied(406);
			else if(my.opts.loanword && ($doc.flag & Const.KOR_FLAG.LOANWORD)) denied(405);
			else if(my.opts.leng && (text.length > my.leng.max)) denied(410);
			else if(my.opts.leng && (text.length < my.leng.min)) denied(411);
			else if(my.opts.noreturn && (((gamemode == 'EKT') && ((text.substr(0,2) == text.substr((text.length-2),2))) || (text.substr(0,3) == text.substr((text.length-3),3))) || ((gamemode != 'EKT') && (text.substr(0,1) == text.substr((text.length-1),1))))) denied(412);
			else if(my.opts.noreturn && (((gamemode == 'KUT') && ((text.substr(0,2) == text.substr((text.length-2),2))) || (text.substr(0,3) == text.substr((text.length-3),3))) || ((gamemode != 'KUT') && (text.substr(0,1) == text.substr((text.length-1),1))))) denied(412);
			else {
				if(my.opts.unknownword) denied(414);
				else if (!check_word(text)) denied(413);
				else preApproved();
			}
		} else {
			if(my.opts.unknownword){
				if (check_word(text)) preApproved();
				else denied(413);
			}
			else denied();
		}
	}
	function isChainable(){
		var type = Const.GAME_TYPE[my.mode];
		var char = my.game.char, subChar = my.game.subChar;
		var l = char.length;
		
		if(!text) return false;
		if(text.length <= l) return false;
		if(my.game.wordLength && text.length != my.game.wordLength) return false;
		if(type == "KAP" || type == "EAP" || type == "JAP" ) return (text.slice(-1) == char) || (text.slice(-1) == subChar);
		switch(l){
			case 1: return (text[0] == char) || (text[0] == subChar);
			case 2: return (text.substr(0, 2) == char);
			case 3: return (text.substr(0, 3) == char) || (text.substr(0, 2) == char.slice(1));
			default: return false;
		}
	}
	DB.kkutu[l].findOne([ '_id', text ],
		(l == "ko") ? [ 'type', Const.KOR_GROUP ] : (l == "en") ? [ '_id', Const.ENG_ID ] : [ '_id', Const.ENG_ID ] // 임시
	).on(onDB);
};
exports.getScore = function(text, delay, ignoreMission){
	var my = this;
	var tr = 1 - delay / my.game.turnTime;
	var score, arr;
	
	if(!text || !my.game.chain || !my.game.dic) return 0;
	score = Const.getPreScore(text, my.game.chain, tr);
	my.opts.randomMission = my.opts.abcmission;
	
	if(my.game.dic[text]) score *= 15 / (my.game.dic[text] + 15);
	if(!ignoreMission) if(arr = text.match(new RegExp(my.game.mission, "g"))){
		score += score * 0.5 * arr.length;
		if (my.opts.blockWord) my.game.blockWord = getBlockWord(my.rule.lang);
		if (my.opts.moremission)
			my.game.mission = getMission(my.rule.lang, 'more');
		
		else if (!my.opts.moremission && my.opts.randomMission)
			my.game.mission = getMission(my.rule.lang, 'random');
		
		else
			my.game.mission = getMission(my.rule.lang, 'normal');
	}
	return Math.round(score);
};
exports.readyRobot = function(robot){
	var my = this;
	var level = robot.level;
	var delay = ROBOT_START_DELAY[level];
	var ended = {};
	var w, text, i;
	var lmax;
	var isRev = (Const.GAME_TYPE[my.mode] == "KAP" || Const.GAME_TYPE[my.mode] == "EAP" || Const.GAME_TYPE[my.mode] == "JAP");
	
	getAuto.call(my, my.game.theme, my.game.char, my.game.subChar, 2).then(function(list){
		if(list.length){
			list.sort(function(a, b){ return b.hit - a.hit; });
			if(ROBOT_HIT_LIMIT[level] > list[0].hit) denied();
			else{
				if(level >= 3 && !robot._done.length){
					if(Math.random() < 0.5) list.sort(function(a, b){ return b._id.length - a._id.length; });
					if(list[0]._id.length < 8 && my.game.turnTime >= 2300){
						for(i in list){
							w = list[i]._id.charAt(isRev ? 0 : (list[i]._id.length - 1));
							if(!ended.hasOwnProperty(w)) ended[w] = [];
							ended[w].push(list[i]);
						}
						getWishList(Object.keys(ended)).then(function(key){
							var v = ended[key];
							
							if(!v) denied();
							else pickList(v, my.game.theme);
						});
					}else{
						pickList(list, my.game.theme);
					}
				}else pickList(list, my.game.theme);
			}
		}else denied();
	});
	function denied(){
		if (Math.floor(Math.random()*25) != 0){
			text = isRev ? `T.T ...${my.game.char}` : `${my.game.char}... T.T`;
		} else {
			text = isRev ? `TωT ...${my.game.char}` : `${my.game.char}... TωT`;
		}
		after();
	}
	function pickList(list, theme){
		if(list) do{
			if(!(w = list.shift())) break;
		}while(w._id.length > ROBOT_LENGTH_LIMIT[level] || robot._done.includes(w._id));
		if(w){
			text = w._id;
			delay += 500 * ROBOT_THINK_COEF[level] * Math.random() / Math.log(1.1 + w.hit);
			after();
		}else denied();
	}
	function after(){
		delay += text.length * ROBOT_TYPE_COEF[level];
		robot._done.push(text);
		setTimeout(my.turnRobot, delay, robot, text);
	}
	function getWishList(list){
		var R = new Lizard.Tail();
		var wz = [];
		var res;
		
		for(i in list) wz.push(getWish(list[i]));
		Lizard.all(wz).then(function($res){
			if(!my.game.chain) return;
			$res.sort(function(a, b){ return a.length - b.length; });
			
			if(my.opts.manner || !my.game.chain.length){
				while(res = $res.shift()) if(res.length) break;
			}else res = $res.shift();
			R.go(res ? res.char : null);
		});
		return R;
	}
	function getWish(char){
		var R = new Lizard.Tail();
		
		DB.kkutu[my.rule.lang].find([ '_id', new RegExp(isRev ? `.${char}$` : `^${char}.`) ]).limit(10).on(function($res){
			R.go({ char: char, length: $res.length });
		});
		return R;
	}
};
/*function getMission(l, r){
	var my = this;
	var arr = (l == "ko") ? Const.MISSION_ko : (l == "en") ? Const.MISSION_en : Const.MISSION_ja;

	if(!arr) return "-";
	return arr[Math.floor(Math.random() * arr.length)];
};
function getMission_abc(l){
	var my = this;
	var arr = Const.MISSION_ko_abc;
	
	if(!arr) return "-";
	return arr[Math.floor(Math.random() * arr.length)];
};*/
function toRegex(theme){
	return new RegExp(`(^|,)${theme}($|,)`);
}
function getMission(l, mode) {
	var my = this;
	if (l == 'ko') {
		var nrm = Const.MISSION_ko; //일반 미션
		var more = Const.MISSION_ko_more; //더 많은 미션
	}
	if (l == 'en') {
		var nrm = Const.MISSION_en; //일반 미션
		var more = Const.MISSION_en;
	}
	
	if (!mode || (mode == 'normal'||mode == 'random')) {
		if(!nrm) return "-";
		return nrm[Math.floor(Math.random() * nrm.length)];
	}
	if (mode == 'more') {
		if(!more) return "-";
		return more[Math.floor(Math.random() * more.length)];
	}
	/*if ((mode.mission||mode.randomMission) || (mode.mission&&mode.randomMission)) {
		if(!nrm) return "-";
		return nrm[Math.floor(Math.random() * nrm.length)];
	}
	if (mode.randomMission) {
		if(!nrm) return "-";
		return nrm[Math.floor(Math.random() * nrm.length)];
	}
	if (mode.moremission) {
		if(!more) return "-";
		return more[Math.floor(Math.random() * more.length)];
	}*/
}
function getBlockWord(l){
	var my = this;
	var arr = Const.MISSION_ko;
	
	if(!arr) return "-";
	return arr[Math.floor(Math.random() * arr.length)];
};
function getAuto(theme, char, subc, type){
	/* type
		0 무작위 단어 하나
		1 존재 여부
		2 단어 목록
	*/
	var my = this;
	var R = new Lizard.Tail();
	var gameType = Const.GAME_TYPE[my.mode];
	var adv, adc;
	var key = gameType + "_" + keyByOptions(my.opts);
	var MAN = DB.kkutu_manner[my.rule.lang];
	var bool = type == 1;
	
	adc = char + (subc ? ("|"+subc) : "");
	switch(gameType){
		case 'KUT':
		case 'EKT':
			adv = `^(${adc})..`;
			break;
		case 'KSH':
			adv = `^(${adc}).`;
			break;
		case 'KLH':
			adv = `^(${adc}).{${my.game.wordLength-1}}$`;
			break;
		case 'ESH':
			adv = `^(${adc})...`;
			break;
		case 'KKT':
			adv = `^(${adc}).{${my.game.wordLength-1}}$`;
			break;
		case 'KAP':
			adv = `.(${adc})$`;
			break;
		case 'EAP':
			adv = `...(${adc})$`;
			break;
	}
	if(!char){
		console.log(`Undefined char detected! key=${key} type=${type} adc=${adc}`);
	}
	MAN.findOne([ '_id', char || "★" ]).on(function($mn){
		if($mn && bool){
			if($mn[key] === null) produce();
			else R.go($mn[key]);
		}else{
			produce();
		}
	});
	function produce(){
		var aqs = [[ '_id', new RegExp(adv) ]];
		var aft;
		var lst;
		
		if(!my.opts.injeong) aqs.push([ 'flag', { '$nand': Const.KOR_FLAG.INJEONG } ]);
		if(my.rule.lang == "ko"){
			if(my.opts.loanword) aqs.push([ 'flag', { '$nand': Const.KOR_FLAG.LOANWORD } ]);
			if(my.opts.strict) aqs.push([ 'type', Const.KOR_STRICT ], [ 'flag', { $lte: 3 } ]);
			else aqs.push([ 'type', Const.KOR_GROUP ]);
		}else if(my.rule.lang == "en"){
			aqs.push([ '_id', Const.ENG_ID ]);
		}else{
			aqs.push([ '_id', Const.ENG_ID ]); // 임시
		}
		switch(type){
			case 0:
			default:
				aft = function($md){
					R.go($md[Math.floor(Math.random() * $md.length)]);
				};
				break;
			case 1:
				aft = function($md){
					R.go($md.length ? true : false);
				};
				break;
			case 2:
				aft = function($md){
					R.go($md);
				};
				break;
		}
		DB.kkutu[my.rule.lang].find.apply(this, aqs).limit(bool ? 1 : 123).on(function($md){
			if(!my.opts.unknownword){
				forManner($md);
			}
			if(my.game.chain) aft($md.filter(function(item){ return !my.game.chain.includes(item); }));
			else aft($md);
		});
		function forManner(list){
			lst = list;
			MAN.upsert([ '_id', char ]).set([ key, lst.length ? true : false ]).on(null, null, onFail);
		}
		function onFail(){
			MAN.createColumn(key, "boolean").on(function(){
				forManner(lst);
			});
		}
	}
	return R;
}
function keyByOptions(opts){
	var arr = [];
	
	if(opts.injeong) arr.push('X');
	if(opts.loanword) arr.push('L');
	if(opts.strict) arr.push('S');
	return arr.join('');
}
function shuffle(arr){
	var i, r = [];
	
	for(i in arr) r.push(arr[i]);
	r.sort(function(a, b){ return Math.random() - 0.5; });
	
	return r;
}
function getChar(text, lim){
	var my = this;
	
	switch(Const.GAME_TYPE[my.mode]){
		case 'EKT': return text.slice(text.length - 3);
		case 'KUT': return text.slice(text.length - 2);
		case 'ESH':
		case 'KLH':
		case 'KKT':
		case 'KSH': return text.slice(-1);
		case 'EAP':
		case 'JAP':
		case 'KAP': return text.charAt(0);
	}
};
function getSubChar(char){
	var my = this;
	var r;
	var c = char.charCodeAt();
	var k;
	var ca, cb, cc;
	
	switch(Const.GAME_TYPE[my.mode]){
		case "EKT": case "KUT":
			if(char.length > 2) r = char.slice(1);
			break;
		case "KKT": case "KSH": case "KAP": case "KLH":
			k = c - 0xAC00;
			if(k < 0 || k > 11171) break;
			ca = [ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ];
			cb = [ ca[0] + 0x1100, ca[1] + 0x1161, ca[2] + 0x11A7 ];
			cc = false;
			if(cb[0] == 4357){ // ㄹ에서 ㄴ, ㅇ
				cc = true;
				if(RIEUL_TO_NIEUN.includes(cb[1])) cb[0] = 4354;
				else if(RIEUL_TO_IEUNG.includes(cb[1])) cb[0] = 4363;
				else cc = false;
			}else if(cb[0] == 4354){ // ㄴ에서 ㅇ
				if(NIEUN_TO_IEUNG.indexOf(cb[1]) != -1){
					cb[0] = 4363;
					cc = true;
				}
			}
			if(cc){
				cb[0] -= 0x1100; cb[1] -= 0x1161; cb[2] -= 0x11A7;
				r = String.fromCharCode(((cb[0] * 21) + cb[1]) * 28 + cb[2] + 0xAC00);
			}
			break;
		case "ESH": case "EAP": default:
			break;
	}
	return r;
}