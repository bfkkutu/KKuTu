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

var GLOBAL = require("./sub/global.json");

exports.KKUTU_MAX = 100;
exports.MAIN_PORTS = GLOBAL.MAIN_PORTS;
exports.TEST_PORT = 4040;
exports.SPAM_CLEAR_DELAY = 1600;
exports.SPAM_ADD_DELAY = 750;
exports.SPAM_LIMIT = 7;
exports.BLOCKED_LENGTH = 10000;
exports.KICK_BY_SPAM = 9;
exports.MAX_OBSERVER = 16; //관전자수
exports.TESTER = GLOBAL.ADMIN.concat([
	"Input tester id here"
]);
exports.IS_SECURED = GLOBAL.IS_SECURED;
exports.SSL_OPTIONS = GLOBAL.SSL_OPTIONS;
exports.WS = GLOBAL.WS;
exports.OPTIONS = {
	'man': { name: "Manner" },
	'ext': { name: "Injeong" },
	'mis': { name: "Mission" },
	//'loa': { name: "Loanword" },
	'prv': { name: "Proverb" },
	//'str': { name: "Strict" },
	'k32': { name: "Sami" },
	'no2': { name: "No2" },
	'ulm': { name: "Unlimited" },
	'sht': { name: "Short" },
	//'rms': { name: "RandomMission" },
	//'nrt': { name: "NoReturn" },
	'rtu': { name: "RandomTurn" },
	'uwd': { name: "UnknownWord" },
	'rtn': { name: "Returns" },
	'rms': { name: "AbcMission" },
	'igin': { name: "IgnoreInitial" },
	'blw': { name: "BlockWord" },
	'eve': { name: "EventMode" },
	'mms': { name: "MoreMission" },
	'rank': { name: "RankGame" },
	'ogow': { name: "Ogow" },
	'selth': { name: "SelectTheme" },
	'btm': { name: "BanTheme" },
	'mdt': { name: "MiddleToss" },
	'tmnt': { name: "Tournament" },
	'twt': { name: "Twenty" },
	'bdb': { name: "BanDouble" },
	'mman': { name: "MidManner" },
	'item': { name: "Item" }
};
exports.MOREMI_PART = [ 'back', 'eye', 'mouth', 'shoes', 'clothes', 'head', 'lhand', 'rhand', 'front' ];
exports.CATEGORIES = [ "all", "spec", "skin", "badge", "head", "eye", "mouth", "clothes", "hs", "back", "MSKIN" ];
exports.AVAIL_EQUIP = [
	"NIK", "BDG1", "BDG2", "BDG3", "BDG4",
	"Mhead", "Mheco", "Meye", "Mmouth", "Mhand", "Mclothes", "Mshoes", "Mback", "MSKIN", "NTG"
];
exports.GROUPS = {
	'spec': [ "PIX", "PIY", "PIZ", "CNS" ],
	'skin': [ "NIK" ],
	'badge': [ "BDG1", "BDG2", "BDG3", "BDG4" ],
	'head': [ "Mhead", "Mheco" ],
	'eye': [ "Meye" ],
	'mouth': [ "Mmouth" ],
	'clothes': [ "Mclothes" ],
	'hs': [ "Mhand", "Mshoes" ],
	'back': [ "Mback", "Mfront" ],
	'MSKIN': [ "MSKIN" ],
	'nametag': [ "NTG" ]
};
exports.RULE = {
/*
	유형: { lang: 언어,
		rule: 이름,
		opts: [ 추가 규칙 ],
		time: 시간 상수,
		ai: AI 가능?,
		big: 큰 화면?,
		ewq: 현재 턴 나가면 라운드 종료?,
		ijr: 인정픽 필수?
	}
*/
	'EKT': { lang: "en", // 영어 끄투
		rule: "Classic",
		opts: [ "ext", "mis", "rms", "rtu",
		/*"nrt", */"upl", "rtn" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'ESH': { lang: "en", // 영어 끝말잇기
		rule: "Classic",
		opts: [ "ext", "mis", "rms"/*, "nrt"*/, "rtu",
		"upl", "rank", "ogow", "twt" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	/*'ETS': { lang: "en", // 영어 주제 끝말잇기
		rule: "Themeword",
		opts: [ "ext", "ijp" ],
		time: 1,
		ai: false,
		big: false,
		ewq: true
	},*/
	'KKT': { lang: "ko", // 쿵쿵따
		rule: "Classic",
		opts: [ /*"ijp",*/ "man", "ext", "mis", "mdt", "rms"/*, "loa", "str"*/,
		/*"nrt", */"rtu", "upl", "rank", "ogow", "mman", "item"/*, "selth", "btm"*/ ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KSH': { lang: "ko", // 한국어 끝말잇기
		rule: "Classic",
		opts: [ /*"ijp", */"man", "ext", "mis", "rms"/*, "loa", "str"*/,
		/*"nrt", */"leg", "rtu", "upl", "rtn", "igin", "mms", "rank", "ogow", "twt", "item", "tmnt"/*, "selth", "btm"*/ ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'CSQ': { lang: "ko", // 한국어 자음퀴즈
		rule: "Jaqwi",
		opts: [ "ijp", "rank" ],
		time: 1,
		ai: true,
		big: false,
		ewq: false,
		ijr: true // 인정픽 필수 여부
	},
	'KCW': { lang: "ko", // 한국어 십자말풀이
		rule: "Crossword",
		opts: [],
		time: 2,
		ai: false,
		big: true,
		ewq: false
	},
	'KTY': { lang: "ko", // 한국어 타자대결
		rule: "Typing",
		opts: [ "ijp", "prv", "selth" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false,
		ijr: false // 인정픽 필수 여부
	},
	'ETY': { lang: "en", // 영어 타자대결
		rule: "Typing",
		opts: [ "ijp", "prv", "selth" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false,
		ijr: false // 인정픽 필수 여부
	},
	'KAP': { lang: "ko", // 한국어 앞말잇기
		rule: "Classic",
		opts: [ "man", "ext", "mis", "rms"/*, "loa", "str"*/,
		/*"nrt", */"leg", "rtu", "upl", "rtn", "ogow" ],
		time: 1,
		ai: true,
		big: false,
		_back: true,
		ewq: true
	},
	'HUN': { lang: "ko", // 훈민정음
		rule: "Hunmin",
		opts: [ "ext", "mis"/*, "loa", "str"*/,
		"rtu", "upl" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KDA': { lang: "ko", // 한국어 단어 대결
		rule: "Daneo",
		opts: [ "ijp", "mis", "mms", "rms", "rtu", "upl", "rank" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true,
		ijr: true // 인정픽 필수 여부
	},
	'EDA': { lang: "en", // 영어 단어 대결
		rule: "Daneo",
		opts: [ "ijp", "mis", "mms", "rms", "rtu", "upl", "rank" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true,
		ijr: true // 인정픽 필수 여부
	},
	'KSS': { lang: "ko", // 한국어 솎솎
		rule: "Sock",
		opts: [ "no2" ],
		time: 1,
		ai: false,
		big: true,
		ewq: false
	},
	'ESS': { lang: "en", // 영어 솎솎
		rule: "Sock",
		opts: [ "no2" ],
		time: 1,
		ai: false,
		big: true,
		ewq: false
	},
	'KDG': { lang: "ko", // 한국어 그림퀴즈
		rule: "Drawing",
		opts: [ "ijp", "sht", "ulm", "new" ],
		time: 1,
		ai: false,
		big: true,
		ewq: true,
		ijr: true // 인정픽 필수 여부
	},
	'EDG': { lang: "en", // 영어 그림퀴즈
		rule: "Drawing",
		opts: [ "ijp", "sht", "ulm", "new" ],
		time: 1,
		ai: false,
		big: true,
		ewq: true,
		ijr: true // 인정픽 필수 여부
	},
	/*'EAP': { lang: "en", // 영어 앞말잇기 임시 비활성화
		rule: "Classic",
		opts: [ "ext", "mis", "rms", "nrt", "rtu",
		"upl" ],
		time: 1,
		ai: true,
		big: false,
		_back: true,
		ewq: true
	}*/
	/*'KTS': { lang: "ko", // 한국어 주제 끝말잇기
		rule: "DaneoClassic",
		opts: [ "man", "ext", "ijp", "rank" ],
		time: 1,
		ai: false,
		big: false,
		ewq: true
	},*/
	'KUT': { lang: "ko", // 한국어 끄투
		rule: "Classic",
		opts: [ "man", "ext" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},/*,
	'KLH': { lang: "ko", // 한국어 길이 제한 끝말잇기
		rule: "Classic",
		opts: [ "man", "ext" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},*/
	'KRH': { lang: "ko", // 한국어 랜덤잇기
		rule: "Classic",
		opts: [ "man", "ext", "mis", "bdb", "rank", "twt" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'ERH': { lang: "en", // 영어 랜덤잇기
		rule: "Classic",
		opts: [ "mis", "ext", "rank", "twt" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KMH': { lang: "ko", // 한국어 가운데잇기
		rule: "Classic",
		opts: [ "mis", "ext", "man", "rank", "twt" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'RVS': { lang: "ko", // 한국어 거꾸로
		rule: "Reverse",
		opts: [  ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	}
};
exports.GAME_TYPE = Object.keys(exports.RULE);
exports.EXAMPLE_TITLE = {
	'ko': "가나다라마바사아자차",
	'en': "abcdefghij"
};
exports.INIT_SOUNDS = [ "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ", "○" ];
exports.MISSION_ko = [ "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하" ];
exports.MISSION_ko_more = [ "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하", "기", "니", "디", "리", "미", "비", "시", "이", "지", "치", "키", "티", "피", "히", "구", "누", "두", "루", "무", "부", "수", "우", "주", "추", "쿠", "투", "드", "후", "고", "노", "도", "로", "모", "보", "소", "오", "조", "초", "코", "토", "포", "호" ];
exports.MISSION_en = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ];
exports.RANDOMWORD_ko = [ "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하", "기", "니", "디", "리", "미", "비", "시", "이", "지", "치", "키", "티", "피", "히", "구", "누", "두", "루", "무", "부", "수", "우", "주", "추", "쿠", "투", "드", "후", "고", "노", "도", "로", "모", "보", "소", "오", "조", "초", "코", "토", "포", "호", "그", "느", "드", "르", "브", "스", "으", "즈", "츠", "크", "트", "프", "흐", "게", "네", "데", "레", "메", "베", "세", "에", "제", "체", "케", "테", "페", "헤", "개", "내", "대", "래", "매", "배", "새", "애", "재", "채", "캐", "태", "패", "해", "낮", "높", "닥", "단", "당", "되", "뒤", "만", "맞", "목", "밤", "상", "선", "샌", "센", "악", "안", "언", "옆", "올", "장", "죽", "전", "첫", "한", "핸", "요", "좋", "꽃", "극", "헬", "거", "너", "더", "러", "머", "버", "서", "어", "저", "처", "커", "터", "퍼", "허", "걷", "겨", "꿈", "백", "붉", "붕", "흰" ];
exports.BLOCKWORD_ko = [ "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하", "기", "니", "디", "리", "미", "비", "시", "이", "지", "치", "키", "티", "피", "히", "구", "누", "두", "루", "무", "부", "수", "우", "주", "추", "쿠", "투", "드", "후", "고", "노", "도", "로", "모", "보", "소", "오", "조", "초", "코", "토", "포", "호" ];

exports.KO_INJEONG = [
	"IMS", "VOC", "KTV", "KOT", "DOT", "DGM",
	"RAG", "LVL", "LOL", "MMM", "MAP", "MKK",
	"MNG", "MOB", "STA", "OIJ", "BUS", "KGY",
	"ESB", "ELW", "OVW", "NEX", "BAN", "EMD",
	"KPO", "JLN", "JAN", "ZEL", "POK", "HAI",
	"HSS", "KMV", "HDC", "HOS", "RUN", "MUN",
	"KPOP", "SOK", "PKT", "PIC", "MIN", "NYA",
	"CKR", "DBD", "HAK", "DONG", "MFA", "ZHS",
	"KTR", "ILN", "TRR", "THP", "UND", "TLR",
	"HKI", "MINBE", "BST", "FGO", "YGO", "PCN",
	"WOW", "SMW", "CPR", "OPC"
];
exports.KO_EVENT = [
	"NLD"
];
exports.EN_INJEONG = [
	"LOL", "LVL", "ENANI", "POP"
];
exports.KO_THEME = [
	"30", "40", "60", "80", "90",
	"140", "150", "160", "170", "190",
	"220", "230", "240", "270", "310",
	"320", "350", "360", "380", "420",
	"430", "450", "490", "530", "440",
	"200"
];
exports.EN_THEME = [
	"e05", "e08", "e12", "e13", "e15",
	"e18", "e20", "e43", "530", "NEX"
];
exports.IJP_EXCEPT = [
	"OIJ"
];
exports.KO_IJP = exports.KO_INJEONG.concat(exports.KO_THEME).filter(function(item){ return !exports.IJP_EXCEPT.includes(item); });
exports.EN_IJP = exports.EN_INJEONG.concat(exports.EN_THEME).filter(function(item){ return !exports.IJP_EXCEPT.includes(item); });
exports.REGION = {
	'en': "en",
	'ko': "kr"
};
exports.KOR_STRICT = /(^|,)(1|INJEONG)($|,)/;
exports.KOR_GROUP = new RegExp("(,|^)(" + [
	"0", "1", "3", "7", "8", "11", "9",
	"16", "15", "17", "2", "18", "20", "26", "19",
	"INJEONG"
].join('|') + ")(,|$)");
exports.ENG_ID = /^[a-z]+$/i;
exports.KOR_FLAG = {
	LOANWORD: 1, // 외래어
	INJEONG: 2,	// 어인정
	SPACED: 4, // 띄어쓰기를 해야 하는 어휘
	SATURI: 8, // 방언
	OLD: 16, // 옛말
	MUNHWA: 32 // 문화어
};
exports.WP_REWARD = function(){
	return 10 + Math.floor(Math.random() * 91);
};

