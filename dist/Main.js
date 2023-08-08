/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 8756:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(6860));
const https_1 = __importDefault(__webpack_require__(5687));
const Database_1 = __importDefault(__webpack_require__(1148));
const ExpressAgent_1 = __importDefault(__webpack_require__(1377));
const Language_1 = __webpack_require__(5908);
const Route_1 = __importDefault(__webpack_require__(1476));
const System_1 = __webpack_require__(8555);
const Logger_1 = __webpack_require__(1604);
const LoginRoute_1 = __importDefault(__webpack_require__(528));
const HTTPS_OPTIONS = System_1.SETTINGS.secure.ssl
    ? {
        key: (0, System_1.getProjectData)(System_1.SETTINGS.secure.key),
        cert: (0, System_1.getProjectData)(System_1.SETTINGS.secure.cert),
        ca: (0, System_1.getProjectData)(System_1.SETTINGS.secure.ca),
    }
    : null;
const App = (0, express_1.default)();
(async () => {
    await Database_1.default.initialize();
    (0, Language_1.loadLanguages)();
    (0, System_1.loadEndpoints)();
    (0, System_1.writeClientConstants)();
    (0, ExpressAgent_1.default)(App);
    (0, Route_1.default)(App);
    await (0, LoginRoute_1.default)(App);
    App.use((_, res) => res.sendStatus(404));
    if (HTTPS_OPTIONS === null)
        App.listen(System_1.SETTINGS.ports.http);
    else
        https_1.default.createServer(HTTPS_OPTIONS, App).listen(System_1.SETTINGS.ports.https, () => {
            Logger_1.Logger.success("HTTPS Server").put(System_1.SETTINGS.ports.https).out();
        });
})();
process.on("unhandledRejection", (err) => {
    const content = err instanceof Error ? err.stack : String(err);
    Logger_1.Logger.error("Unhandled promise rejection").put(content).out();
});


/***/ }),

/***/ 7554:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DateUnit = void 0;
var DateUnit;
(function (DateUnit) {
    DateUnit[DateUnit["MILLISECOND"] = 1] = "MILLISECOND";
    DateUnit[DateUnit["SECOND"] = 1000] = "SECOND";
    DateUnit[DateUnit["MINUTE"] = 60000] = "MINUTE";
    DateUnit[DateUnit["HOUR"] = 3600000] = "HOUR";
    DateUnit[DateUnit["DAY"] = 86400000] = "DAY";
    DateUnit[DateUnit["WEEK"] = 604800000] = "WEEK";
    DateUnit[DateUnit["MONTH"] = 2629743840] = "MONTH";
    DateUnit[DateUnit["YEAR"] = 31556926080] = "YEAR";
})(DateUnit || (exports.DateUnit = DateUnit = {}));


/***/ }),

/***/ 8643:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const TypeORM = __importStar(__webpack_require__(5250));
let Session = class Session {
    id;
    sid;
    profile;
    createdAt;
    serialize() {
        return {
            id: this.sid,
            profile: this.profile,
            createdAt: this.createdAt,
        };
    }
};
__decorate([
    TypeORM.PrimaryGeneratedColumn({ name: "ses_id", type: "int8" })
], Session.prototype, "id", void 0);
__decorate([
    TypeORM.Column({ name: "ses_sid", type: "varchar", length: 32 })
], Session.prototype, "sid", void 0);
__decorate([
    TypeORM.Column({ name: "ses_profile", type: "json" })
], Session.prototype, "profile", void 0);
__decorate([
    TypeORM.Column({
        name: "ses_createdAt",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        nullable: false,
    })
], Session.prototype, "createdAt", void 0);
Session = __decorate([
    TypeORM.Entity({ name: "kkutu_session" })
], Session);
exports["default"] = Session;


/***/ }),

/***/ 719:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const TypeORM = __importStar(__webpack_require__(5250));
let User = class User {
    id;
    money;
    record;
    inventory;
    equipment;
    nickname;
    exordial;
    punishment;
    server;
    password;
    friends;
    lastLogin;
    createdAt;
    serialize() {
        return {
            id: this.id,
            money: this.money,
            record: this.record,
            lastLogin: this.lastLogin,
            inventory: this.inventory,
            equipment: this.equipment,
            exordial: this.exordial,
            punishment: this.punishment,
            server: this.server,
            password: this.password,
            friends: this.friends,
            nickname: this.nickname,
            createdAt: this.createdAt,
        };
    }
};
__decorate([
    TypeORM.PrimaryGeneratedColumn({ name: "u_id", type: "int8" })
], User.prototype, "id", void 0);
__decorate([
    TypeORM.Column({
        name: "u_money",
        type: "int8",
        default: 0,
        nullable: false,
    })
], User.prototype, "money", void 0);
__decorate([
    TypeORM.Column({ name: "u_record", type: "json" })
], User.prototype, "record", void 0);
__decorate([
    TypeORM.Column({ name: "u_inventory", type: "json" })
], User.prototype, "inventory", void 0);
__decorate([
    TypeORM.Column({ name: "u_equipment", type: "json" })
], User.prototype, "equipment", void 0);
__decorate([
    TypeORM.Column({
        name: "u_nickname",
        type: "varchar",
        length: 16,
        nullable: true,
    })
], User.prototype, "nickname", void 0);
__decorate([
    TypeORM.Column({
        name: "u_exordial",
        type: "varchar",
        length: 100,
        default: "",
        nullable: false,
    })
], User.prototype, "exordial", void 0);
__decorate([
    TypeORM.Column({ name: "u_punishment", type: "json" })
], User.prototype, "punishment", void 0);
__decorate([
    TypeORM.Column({ name: "u_server", type: "varchar", nullable: true })
], User.prototype, "server", void 0);
__decorate([
    TypeORM.Column({
        name: "u_password",
        type: "varchar",
        length: 32,
        nullable: true,
    })
], User.prototype, "password", void 0);
__decorate([
    TypeORM.Column({ name: "u_friends", type: "json" })
], User.prototype, "friends", void 0);
__decorate([
    TypeORM.Column({ name: "u_lastLogin", type: "timestamp" })
], User.prototype, "lastLogin", void 0);
__decorate([
    TypeORM.Column({
        name: "u_createdAt",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        nullable: false,
    })
], User.prototype, "createdAt", void 0);
User = __decorate([
    TypeORM.Entity({ name: "kkutu_users" })
], User);
exports["default"] = User;


/***/ }),

/***/ 1148:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const TypeORM = __importStar(__webpack_require__(5250));
const System_1 = __webpack_require__(8555);
const Utility_1 = __webpack_require__(3376);
const Logger_1 = __webpack_require__(1604);
const User_1 = __importDefault(__webpack_require__(719));
const Session_1 = __importDefault(__webpack_require__(8643));
class DB {
    static dataSource = new TypeORM.DataSource({
        type: "postgres",
        ...System_1.SETTINGS["database"],
        synchronize: true,
        logging: [],
        entities: [User_1.default, Session_1.default],
    });
    static get Manager() {
        return DB.dataSource.manager;
    }
    static async initialize() {
        await DB.dataSource.initialize();
        Logger_1.Logger.success("DB").put(System_1.SETTINGS["database"].host).out();
    }
    static paginate(length, page) {
        return {
            skip: length * page,
            take: length,
        };
    }
    static getTable(Target) {
        return DB.Manager.connection.getMetadata(Target);
    }
    static getColumnName(table, column) {
        return table.findColumnWithPropertyName(column).databaseName;
    }
    static callProcedure(manager, name, ...args) {
        return manager.query(`CALL dds_p_${name}(${(0, Utility_1.Iterator)(args.length, "?").join(",")})`, args);
    }
    static coalesce(manager, Target, targetId, column, data) {
        if (manager === null)
            manager = DB.Manager;
        const table = DB.getTable(Target);
        const dataText = JSON.stringify(data);
        return manager.query(`UPDATE ${table.tableName}
      SET ${DB.getColumnName(table, column)} = COALESCE(JSON_MERGE_PATCH(${DB.getColumnName(table, column)}, ?), ?)
      WHERE ${DB.getColumnName(table, "id")} = ?
    `, [dataText, dataText, targetId]);
    }
    static async count(Model, conditions) {
        // NOTE .count() 함수는 내부적으로 DISTINCT PK를 쓰고 있어 느리다.
        const qb = DB.Manager.createQueryBuilder(Model, "model").select("COUNT(*) AS count");
        if (conditions) {
            qb.where(conditions);
        }
        return (await qb.getRawOne())["count"];
    }
}
exports["default"] = DB;


/***/ }),

/***/ 1377:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(6860));
const express_session_1 = __importDefault(__webpack_require__(6508));
const connect_redis_1 = __importDefault(__webpack_require__(2945));
const Redis = __importStar(__webpack_require__(7773));
const cookie_parser_1 = __importDefault(__webpack_require__(9710));
const passport_1 = __importDefault(__webpack_require__(3511));
const System_1 = __webpack_require__(8555);
const ReactNest = __importStar(__webpack_require__(6205));
const Language_1 = __webpack_require__(5908);
const Middleware_1 = __webpack_require__(212);
const Logger_1 = __webpack_require__(1604);
function default_1(App) {
    // JJWAK 기본
    App.engine("js", ReactNest.Engine);
    App.set("views", (0, System_1.resolve)("dist", "pages"));
    App.set("view engine", "js");
    App.use("/libs", express_1.default.static((0, System_1.resolve)("dist", "libs")), Middleware_1.send404);
    App.use("/media", express_1.default.static((0, System_1.resolve)("dist", "media")), Middleware_1.send404);
    App.use("/pages", express_1.default.static((0, System_1.resolve)("dist", "pages")), Middleware_1.send404);
    App.use("/strings", express_1.default.static((0, System_1.resolve)("dist", "strings")), Middleware_1.send404);
    App.use("/constants.js", (req, res) => res.sendFile((0, System_1.resolve)("dist", "constants.js")));
    App.use("/favicon.ico", (req, res) => res.sendFile((0, System_1.resolve)("dist", "favicon.ico")));
    App.use((req, res, next) => {
        req.address = req.ip || req.ips.join();
        if (req.xhr) {
            Logger_1.Logger.log()
                .putS(Logger_1.LogStyle.METHOD, req.method)
                .putS(Logger_1.LogStyle.XHR, " XHR")
                .next("URL")
                .put(req.originalUrl)
                .next("Address")
                .put(req.address)
                .out();
        }
        else {
            Logger_1.Logger.log()
                .putS(Logger_1.LogStyle.METHOD, req.method)
                .next("URL")
                .put(req.originalUrl)
                .next("Address")
                .put(req.address)
                .out();
        }
        next();
    });
    const redisClient = Redis.createClient();
    redisClient.connect();
    App.use((0, express_session_1.default)({
        store: new connect_redis_1.default({
            client: redisClient,
            ttl: 3600 * 12,
        }),
        secret: "kkutu",
        resave: false,
        saveUninitialized: true,
    }));
    App.use(passport_1.default.initialize());
    App.use(passport_1.default.session());
    /*App.use((req, res, next) => {
      if (req.session.passport)
        delete req.session.passport;
      next();
    });*/
    App.use(express_1.default.json({ limit: "1MB" }));
    App.use((0, cookie_parser_1.default)(System_1.SETTINGS.cookie.secret));
    App.use((req, res, next) => {
        req.agentInfo = `${req.address} (${req.header("User-Agent")})`;
        req.locale = (0, Language_1.getLocale)(req);
        if (req.session.profile === undefined) {
            req.session.profile = {};
            req.session.save();
        }
        res.metadata = {
            ad: System_1.SETTINGS.advertisement,
        };
        res.removeCookie = responseRemoveCookie;
        res.setCookie = responseSetCookie;
        res.header({
            "X-Frame-Options": "deny",
            "X-XSS-Protection": "1;mode=block",
        });
        next(null);
    });
}
exports["default"] = default_1;
function responseRemoveCookie(name, path = "/") {
    return this.clearCookie(name, {
        path: path,
    });
}
function responseSetCookie(name, value, path = "/") {
    return this.cookie(name, value, {
        path: path,
        maxAge: System_1.SETTINGS.cookie.age,
        secure: true,
    });
}


/***/ }),

/***/ 5908:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadLanguages = exports.getLocale = exports.getLanguageTable = exports.L = void 0;
const accept_language_parser_1 = __importDefault(__webpack_require__(6191));
const System_1 = __webpack_require__(8555);
const Utility_1 = __webpack_require__(3376);
const Logger_1 = __webpack_require__(1604);
const LANGUAGE_SUPPORT = Object.keys(System_1.SETTINGS["languageSupport"]);
let LANGUAGES;
/**
 * 문자열표에서 문자열을 얻어 반환한다.
 *
 * @param key 식별자.
 * @param args 추가 정보.
 */
function L(key, ...args) {
    return args.length
        ? (0, Utility_1.resolveLanguageArguments)(LANGUAGES[key], ...args)
        : LANGUAGES[key];
}
exports.L = L;
/**
 * 언어 파일에서 주어진 식별자와 대응되는 문자열표를 반환한다.
 *
 * @param locale 언어 식별자.
 * @param page 페이지 식별자.
 */
function getLanguageTable(locale, page) {
    return JSON.parse(LANGUAGES[`${locale}/${page}`]);
}
exports.getLanguageTable = getLanguageTable;
/**
 * 주어진 요청으로부터 사용 가능한 언어를 반환한다.
 *
 * @param req Express 요청 객체.
 */
function getLocale(req) {
    let R = req.cookies["dds.locale"];
    if (!LANGUAGES || !System_1.SETTINGS.languageSupport[R]) {
        R =
            accept_language_parser_1.default.pick(LANGUAGE_SUPPORT, String(req.headers["accept-language"])) ||
                LANGUAGE_SUPPORT[0];
    }
    return R;
}
exports.getLocale = getLocale;
/**
 * 프로젝트 데이터 폴더 내의 언어 파일을 새로 읽어 문자열표로 가공 후 메모리에 올린다.
 *
 * 메모리에 올려진 문자열표는 페이지 렌더 시 내용으로 포함된다.
 */
function loadLanguages() {
    const prototables = (0, Utility_1.reduceToTable)(LANGUAGE_SUPPORT, (v) => JSON.parse((0, System_1.getProjectData)(`lang/${v}.json`).toString()));
    const R = {};
    for (const locale in prototables) {
        const prototable = prototables[locale];
        for (const page in prototable) {
            if (page[0] === "$" || page[0] === "@")
                continue;
            const key = `${locale}/${page}`;
            const pageTable = prototable[page] || {};
            const table = {
                ...(prototable["$global"] || {}),
                ...(pageTable["$include"] || []).reduce(resolveDependency, {}),
                ...pageTable,
            };
            delete table["$include"];
            R[key] = JSON.stringify(table);
            R[`${key}#title`] = table["title"];
        }
        function resolveDependency(pv, v) {
            const pageTable = prototable[`@${v}`] || {};
            return Object.assign(pv, {
                ...(pageTable["$include"] || []).reduce(resolveDependency, {}),
                ...pageTable,
            });
        }
    }
    LANGUAGES = R;
    Logger_1.Logger.info("Languages has been updated.").out();
}
exports.loadLanguages = loadLanguages;


/***/ }),

/***/ 1604:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogStyle = exports.Logger = exports.LogLevel = exports.LogColor = void 0;
const DateUnit_1 = __webpack_require__(7554);
const Utility_1 = __webpack_require__(3376);
let FS;
let System;
/**
 * 로그의 색 열거형.
 *
 * ANSI 탈출 구문 `\x1b[?m`의 `?`에 들어갈 값과 같도록 설정되어 있다.
 */
var LogColor;
(function (LogColor) {
    LogColor[LogColor["NORMAL"] = 0] = "NORMAL";
    LogColor[LogColor["BRIGHT"] = 1] = "BRIGHT";
    LogColor[LogColor["DIM"] = 2] = "DIM";
    LogColor[LogColor["UNDERSCORE"] = 4] = "UNDERSCORE";
    LogColor[LogColor["F_BLACK"] = 30] = "F_BLACK";
    LogColor[LogColor["F_RED"] = 31] = "F_RED";
    LogColor[LogColor["F_GREEN"] = 32] = "F_GREEN";
    LogColor[LogColor["F_YELLOW"] = 33] = "F_YELLOW";
    LogColor[LogColor["F_BLUE"] = 34] = "F_BLUE";
    LogColor[LogColor["F_MAGENTA"] = 35] = "F_MAGENTA";
    LogColor[LogColor["F_CYAN"] = 36] = "F_CYAN";
    LogColor[LogColor["F_WHITE"] = 37] = "F_WHITE";
    LogColor[LogColor["B_BLACK"] = 40] = "B_BLACK";
    LogColor[LogColor["B_RED"] = 41] = "B_RED";
    LogColor[LogColor["B_GREEN"] = 42] = "B_GREEN";
    LogColor[LogColor["B_YELLOW"] = 43] = "B_YELLOW";
    LogColor[LogColor["B_BLUE"] = 44] = "B_BLUE";
    LogColor[LogColor["B_MAGENTA"] = 45] = "B_MAGENTA";
    LogColor[LogColor["B_CYAN"] = 46] = "B_CYAN";
    LogColor[LogColor["B_WHITE"] = 47] = "B_WHITE";
})(LogColor || (exports.LogColor = LogColor = {}));
/**
 * 로그의 수준 열거형.
 *
 * 수준에 따라 표시되는 아이콘이 달라지며, `ERROR` 수준이라고 해도 출력 후 자동으로 종료되지 않는다.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NORMAL"] = 0] = "NORMAL";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["SUCCESS"] = 2] = "SUCCESS";
    LogLevel[LogLevel["WARNING"] = 3] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * 로그를 출력해 주는 유틸리티 클래스.
 *
 * 로그 수준에 따라 `Logger.log()`, `Logger.info()`, `Logger.success()`, `Logger.warning()`, `Logger.error()` 메소드를
 * 호출할 수 있으며, 그 반환값으로 `Logger` 인스턴스를 얻을 수 있다.
 * 인스턴스의 메소드를 이용해 로그 내용을 입력한 후 `out()` 메소드를 호출하는 것으로 최종적으로 출력이 된다.
 *
 * 클라이언트 측과 서버 측 모두 로그 출력에 쓸 수 있으며,
 * 서버가 로그를 출력하려는 경우 `Logger.initialize()` 메소드로 초기화함으로써
 * 로그 내용을 파일로 보관할 수 있다.
 */
class Logger {
    static REGEXP_ANSI_ESCAPE = /\x1b\[(\d+)m/g;
    // 캡처되는 그룹 { 함수명, 파일명, 줄 번호 }
    static REGEXP_CALLER = /^\s*at (.+) \(.+?([^\\/]+):(\d+):\d+\)$/;
    // 캡처되는 그룹 { 파일명, 줄 번호, 칸 번호 }
    static REGEXP_CALLER_ANONYMOUS = /^\s*at .+?([^\\/]+):(\d+):(\d+)$/;
    static CALLER_LENGTH = 20;
    static WEBKIT_STYLE_TABLE = {
        [LogColor.NORMAL]: "",
        [LogColor.BRIGHT]: "font-weight: bold",
        [LogColor.DIM]: "font-style: italic",
        [LogColor.UNDERSCORE]: "text-decoration: underline",
        [LogColor.F_BLACK]: "color: black",
        [LogColor.F_RED]: "color: red",
        [LogColor.F_GREEN]: "color: green",
        [LogColor.F_YELLOW]: "color: yellow",
        [LogColor.F_BLUE]: "color: blue",
        [LogColor.F_MAGENTA]: "color: magenta",
        [LogColor.F_CYAN]: "color: deepskyblue",
        [LogColor.F_WHITE]: "color: white",
        [LogColor.B_BLACK]: "background: black",
        [LogColor.B_RED]: "background: red",
        [LogColor.B_GREEN]: "background: green",
        [LogColor.B_YELLOW]: "background: yellow",
        [LogColor.B_BLUE]: "background: blue",
        [LogColor.B_MAGENTA]: "background: magenta",
        [LogColor.B_CYAN]: "background: cyan",
        [LogColor.B_WHITE]: "background: white",
    };
    static recentFileInfo;
    static subject;
    static workerProcessId;
    /**
     * 로그 시스템을 초기화하고 파일에 쓸 준비를 한다.
     *
     * 설정 파일에서 정한 값에 따라 로그 파일 이름과 파일 교체 주기가 결정된다.
     * 설정 파일의 교체 주기가 0으로 설정된 경우 로그 파일을 생성하지 않는다.
     *
     * @param subject 주체의 식별자. 로그 디렉토리의 하위 디렉토리 이름으로 쓰인다.
     */
    static async initialize(subject) {
        FS = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 7147, 23));
        // @ts-ignore
        System = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 8555, 23));
        if ((await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 5001, 23))).default.isWorker) {
            Logger.workerProcessId = (await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 7282, 23))).pid;
        }
        Logger.subject = subject;
        if (!FS.existsSync(Logger.directoryPath)) {
            FS.mkdirSync(Logger.directoryPath, { recursive: true });
        }
        if (System.SETTINGS.log.interval)
            System.schedule(Logger.shiftFile, System.SETTINGS.log.interval, {
                callAtStart: true,
                punctual: true,
            });
        else
            Logger.warning().put("Log files won't be generated.").out();
    }
    /**
     * 오류 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
     *
     * @param title 제목.
     */
    static error(title) {
        return new Logger(LogLevel.ERROR, title);
    }
    /**
     * 안내 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
     *
     * @param title 제목.
     */
    static info(title) {
        return new Logger(LogLevel.INFO, title);
    }
    /**
     * 일반 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
     *
     * @param title 제목.
     */
    static log(title) {
        return new Logger(LogLevel.NORMAL, title);
    }
    /**
     * 성공 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
     *
     * @param title 제목.
     */
    static success(title) {
        return new Logger(LogLevel.SUCCESS, title);
    }
    /**
     * 경고 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
     *
     * @param title 제목.
     */
    static warning(title) {
        return new Logger(LogLevel.WARNING, title);
    }
    static escape(style = LogStyle.NORMAL) {
        return style.reduce((pv, v) => pv + `\x1b[${v}m`, "");
    }
    static getCaller() {
        const error = new Error().stack.split("\n");
        for (let level = 4; level < error.length; level++) {
            let chunk;
            if ((chunk = error[level].match(Logger.REGEXP_CALLER)))
                return {
                    file: chunk[2],
                    line: Number(chunk[3]),
                    function: chunk[1],
                };
            else if ((chunk = error[level].match(Logger.REGEXP_CALLER_ANONYMOUS)))
                return {
                    file: chunk[1],
                    line: Number(chunk[2]),
                    function: `:${chunk[3]} (Unknown)`,
                };
        }
        return null;
    }
    static getLocalFileNameDate() {
        const now = new Date();
        return [
            String(now.getFullYear() % 100).padStart(2, "0"),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0"),
            "-",
            String(now.getHours()).padStart(2, "0"),
            String(now.getMinutes()).padStart(2, "0"),
            String(now.getSeconds()).padStart(2, "0"),
        ].join("");
    }
    static getLocalISODate() {
        const now = new Date();
        const offset = -Math.round(Utility_1.TIMEZONE_OFFSET / DateUnit_1.DateUnit.HOUR) || "";
        return (new Date(now.getTime() - Utility_1.TIMEZONE_OFFSET).toISOString() +
            (offset && (0, Utility_1.toSignedString)(offset)));
    }
    static shiftFile() {
        const fileName = Logger.getLocalFileNameDate();
        const path = `${Logger.directoryPath}/${fileName}.log`;
        if (Logger.recentFileInfo) {
            Logger.recentFileInfo.stream.end();
        }
        Logger.recentFileInfo = {
            stream: FS.createWriteStream(path),
            path,
            createdAt: Date.now(),
        };
        Logger.success(Logger.subject).next("Path").put(fileName).out();
    }
    static get directoryPath() {
        return `${__dirname}/${System.SETTINGS.log.directory}/${Logger.subject}`;
    }
    type;
    list;
    timestamp;
    head;
    chunk;
    constructor(type = LogLevel.NORMAL, title = "") {
        const caller = Logger.getCaller();
        let fileLimit = Logger.CALLER_LENGTH - String(caller?.line).length;
        this.type = type;
        this.list = [];
        this.timestamp = `[${Logger.getLocalISODate()}]`;
        this.chunk = [];
        this.putS(LogStyle.TIMESTAMP, this.timestamp);
        if (Logger.workerProcessId) {
            fileLimit -= String(Logger.workerProcessId).length + 1;
            this.putS(LogStyle.CALLER_PID, "#", Logger.workerProcessId);
        }
        this.putS(LogStyle.CALLER_FILE, " ", (0, Utility_1.cut)(caller?.file || "", fileLimit).padStart(fileLimit, " "));
        this.putS(LogStyle.CALLER_LINE, ":", caller?.line, " ");
        this.putS(LogStyle.CALLER, (0, Utility_1.cut)(caller?.function || "", Logger.CALLER_LENGTH).padEnd(Logger.CALLER_LENGTH, " "), " ");
        switch (type) {
            case LogLevel.NORMAL:
                this.putS(LogStyle.TYPE_NORMAL, "(:)");
                break;
            case LogLevel.INFO:
                this.putS(LogStyle.TYPE_INFO, "(i)");
                break;
            case LogLevel.SUCCESS:
                this.putS(LogStyle.TYPE_SUCCESS, "(✓)");
                break;
            case LogLevel.WARNING:
                this.putS(LogStyle.TYPE_WARNING, "(△)");
                break;
            case LogLevel.ERROR:
                this.putS(LogStyle.TYPE_ERROR, "(×)");
                break;
        }
        if (title) {
            this.putS(LogStyle.TITLE, " [", title, "]");
        }
        this.put(" ");
    }
    getText() {
        const maxDigit = this.list.reduce((pv, v) => (pv < v[0]?.length ? v[0].length : pv), 1);
        const prefix = " ".repeat(this.timestamp.length + 2 * Logger.CALLER_LENGTH + 5);
        const last = this.list.length - 2;
        return [
            this.list[0][1],
            ...this.list.slice(1).map(([head, body], i) => {
                return `${prefix}${Logger.escape(LogStyle.LINE)}${i === last ? "└" : "├"}─ ${(head ?? String(i)).padEnd(maxDigit, " ")}${Logger.escape()}: ${body}`;
            }),
        ].join("\n");
    }
    /**
     * 이후 내용을 다음 줄에 기록하도록 하고 사슬 반환한다.
     *
     * @param head 다음 줄의 제목.
     */
    next(head) {
        this.list.push([this.head || "", this.chunk.join("")]);
        this.head = head;
        this.chunk = [];
        return this;
    }
    /**
     * 기록된 내용을 출력한다.
     *
     * 클라이언트나 파일에 출력하는 경우 ANSI 탈출 구문을 지원하지 않으므로 내용을 일부 수정해 출력한다.
     */
    out() {
        if (this.chunk.length) {
            this.next();
        }
        let text = this.getText();
        let args = [];
        if (Utility_1.FRONT) {
            text = text.replace(Logger.REGEXP_ANSI_ESCAPE, (v, p1) => {
                args.push(Logger.WEBKIT_STYLE_TABLE[p1]);
                return "%c";
            });
        }
        else if (Logger.recentFileInfo) {
            Logger.recentFileInfo.stream.write(`${text.replace(Logger.REGEXP_ANSI_ESCAPE, "")}\n`);
        }
        switch (this.type) {
            case LogLevel.NORMAL:
                console.log(text, ...args);
                break;
            case LogLevel.INFO:
            case LogLevel.SUCCESS:
                console.info(text, ...args);
                break;
            case LogLevel.WARNING:
                console.warn(text, ...args);
                break;
            case LogLevel.ERROR:
                console.error(text, ...args);
                break;
        }
    }
    /**
     * 현재 줄에 내용을 추가하고 사슬 반환한다.
     *
     * 여러 인자에 걸쳐 내용이 들어오는 경우 공백 없이 붙여서 출력된다.
     *
     * @param args 추가할 내용.
     */
    put(...args) {
        this.chunk.push(...args);
        return this;
    }
    /**
     * 현재 줄에 주어진 색 조합을 따르는 내용을 추가하고 사슬 반환한다.
     *
     * 여러 인자에 걸쳐 내용이 들어오는 경우 공백 없이 붙여서 출력된다.
     * ANSI 탈출 구문을 지원하지 않는 매체에 출력하는 경우 색 조합이 무시될 수 있다.
     *
     * @param value 색 조합.
     * @param args 추가할 내용.
     */
    putS(value, ...args) {
        this.chunk.push(Logger.escape(value), ...args, Logger.escape());
        return this;
    }
}
exports.Logger = Logger;
/**
 * 로그의 색 조합을 정의하는 유틸리티 클래스.
 */
class LogStyle {
    static NORMAL = [LogColor.NORMAL];
    static CALLER = [LogColor.F_CYAN];
    static CALLER_PID = [LogColor.F_MAGENTA];
    static CALLER_FILE = [LogColor.BRIGHT, LogColor.F_CYAN];
    static CALLER_LINE = [LogColor.NORMAL];
    static LINE = [LogColor.BRIGHT];
    static METHOD = [LogColor.F_YELLOW];
    static TIMESTAMP = [LogColor.F_BLUE];
    static TARGET = [LogColor.BRIGHT, LogColor.F_BLUE];
    static TITLE = [LogColor.BRIGHT];
    static TYPE_ERROR = [LogColor.BRIGHT, LogColor.B_RED];
    static TYPE_INFO = [LogColor.B_BLUE];
    static TYPE_NORMAL = [LogColor.BRIGHT];
    static TYPE_SUCCESS = [LogColor.F_BLACK, LogColor.B_GREEN];
    static TYPE_WARNING = [LogColor.F_BLACK, LogColor.B_YELLOW];
    static XHR = [LogColor.F_GREEN];
}
exports.LogStyle = LogStyle;


/***/ }),

/***/ 528:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getLoginMethods = void 0;
const passport_1 = __importDefault(__webpack_require__(3511));
const System_1 = __webpack_require__(8555);
const Logger_1 = __webpack_require__(1604);
const Database_1 = __importDefault(__webpack_require__(1148));
const User_1 = __importDefault(__webpack_require__(719));
const Session_1 = __importDefault(__webpack_require__(8643));
const strategyList = new Map();
async function strategyProcess(req, accessToken, profile, done) {
    profile.token = accessToken;
    profile.sid = req.session.id;
    const now = Date.now();
    req.session.authType = profile.authType;
    const user = (await Database_1.default.Manager.createQueryBuilder(User_1.default, "u")
        .where("u.id == :id:", { id: profile.id })
        .getOne()) || new User_1.default();
    req.session.profile = profile;
    req.session.save();
    if (user.nickname === null)
        user.nickname = profile.name;
    const session = (await Database_1.default.Manager.createQueryBuilder(Session_1.default, "ses")
        .where("ses.id == :id:", { id: req.session.id })
        .getOne()) || new Session_1.default();
    session.profile = {
        authType: profile.authType,
        id: profile.id,
        nickname: user.nickname,
        exordial: user.exordial,
        image: profile.image,
        token: profile.token,
        sid: profile.sid,
    };
    session.createdAt = now;
    await Database_1.default.Manager.save(session);
    user.lastLogin = now;
    await Database_1.default.Manager.save(user);
    done(null, profile);
}
function getLoginMethods() {
    return Array.from(strategyList.values());
}
exports.getLoginMethods = getLoginMethods;
async function LoginRoute(App) {
    passport_1.default.serializeUser((user, done) => {
        done(null, user);
    });
    passport_1.default.deserializeUser((obj, done) => {
        done(null, obj);
    });
    for (const vendor in System_1.AUTH_CONFIG)
        try {
            const { config, options, createProfile } = await __webpack_require__(9351)(`./${vendor}`);
            App.get(`/login/${vendor}`, passport_1.default.authenticate(vendor));
            App.get(`/login/${vendor}/callback`, passport_1.default.authenticate(vendor, {
                successRedirect: "/",
                failureRedirect: "/loginfail",
            }));
            const strategy = new config.strategy(options, (req, accessToken, _, profile, done) => strategyProcess(req, accessToken, createProfile(profile), done));
            passport_1.default.use(strategy);
            strategyList.set(vendor, config);
            Logger_1.Logger.info(`OAuth Strategy ${vendor} loaded successfully.`).out();
        }
        catch (e) {
            Logger_1.Logger.error(`OAuth Strategy ${vendor} is not loaded`).out();
            if (e instanceof Error)
                Logger_1.Logger.error(e.message).out();
        }
    App.get("/logout", (req, res) => {
        if (!req.session.profile)
            return res.redirect("/");
        else
            req.session.destroy(() => res.redirect("/"));
    });
}
exports["default"] = LoginRoute;


/***/ }),

/***/ 212:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.send404 = exports.raw = void 0;
const express_1 = __importDefault(__webpack_require__(6860));
exports.raw = express_1.default.raw({ limit: "100MB" });
const send404 = (req, res) => {
    res.sendStatus(404);
};
exports.send404 = send404;


/***/ }),

/***/ 6205:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Engine = exports.PageBuilder = void 0;
const react_1 = __importDefault(__webpack_require__(6689));
const server_1 = __importDefault(__webpack_require__(8684));
const Language_1 = __webpack_require__(1352);
const ReactBootstrap_1 = __webpack_require__(2153);
const Language_2 = __webpack_require__(5908);
const System_1 = __webpack_require__(8555);
const HTML_TEMPLATE = (0, System_1.getProjectData)("template.html").toString();
const READER_SSR = createReader("SSR");
const READER_NEST = /("?)\/\*\{(.+?)\}\*\/\1/g;
function createReader(key) {
    return new RegExp(`("?)/\\* %%${key}%% \\*/\\1`, "g");
}
/**
 * 주어진 페이지를 렌더하는 Express 끝점 클로저를 반환한다.
 *
 * @param page 페이지.
 * @param data 추가 정보.
 */
function PageBuilder(page, data) {
    return async (req, res) => {
        res.render(page, {
            session: req.session,
            locale: req.locale,
            page,
            path: req.originalUrl,
            data,
            metadata: res.metadata,
        });
    };
}
exports.PageBuilder = PageBuilder;
/**
 * 주어진 파일에서 정의된 컴포넌트를 최상위 컴포넌트로 삼도록 한 HTML을 전달한다.
 *
 * HTML 내(JavaScript 포함)에서 `／*{...}*／` 구문은 이 함수 스코프 안에서 `eval(...)` 함수의 결과로 대체된다.
 *
 * @param path 뷰(React) 파일 경로.
 * @param $ Express 관련 추가 정보.
 * @param callback 콜백 함수.
 */
function Engine(path, $, callback) {
    const REACT_SUFFIX =  true ? "production.min" : 0;
    const KEY = `${$.locale}/${$.page}`;
    const SSR = $.ssr;
    const ad_client = $.metadata.ad?.client;
    const GOOGLE_ADS = ad_client
        ? `<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ad_client}"
  crossorigin="anonymous"
></script>`
        : "";
    let Index;
    $.title = (0, Language_2.L)(`${KEY}#title`, ...($.metadata?.titleArgs || []));
    $.version = System_1.PACKAGE["version"];
    // NOTE Express 내부적으로 정의한 정보가 외부에 노출되지 않도록 삭제
    delete $["settings"];
    delete $["cache"];
    delete $["_locals"];
    const CLIENT_SETTINGS = {};
    if (SSR) {
        (0, Language_1.setTable)((0, Language_2.getLanguageTable)($.locale, $.page));
        Index = __webpack_require__(6122)(`./${$.page}/index.tsx`).default;
        Object.assign(Index["__CLIENT_SETTINGS"], System_1.SETTINGS.application, CLIENT_SETTINGS);
    }
    const HTML = HTML_TEMPLATE.replace(READER_SSR, SSR
        ? server_1.default.renderToString(react_1.default.createElement(ReactBootstrap_1.Root, $, react_1.default.createElement(__webpack_require__(6122)(`./${$.page}/index.tsx`).default, $)))
        : "").replace(READER_NEST, (v, p1, p2) => String(eval(p2)));
    // NOTE never used 오류 회피
    void REACT_SUFFIX;
    callback(null, HTML);
}
exports.Engine = Engine;


/***/ }),

/***/ 1476:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Language_1 = __webpack_require__(5908);
const ReactNest_1 = __webpack_require__(6205);
const LoginRoute_1 = __webpack_require__(528);
function default_1(App) {
    App.get("/", (0, ReactNest_1.PageBuilder)("Portal"));
    App.get("/login", (req, res, next) => (0, ReactNest_1.PageBuilder)("Login", { loginMethods: (0, LoginRoute_1.getLoginMethods)() })(req, res, next));
    App.get("/admin/load-languages", (req, res) => {
        (0, Language_1.loadLanguages)();
        res.sendStatus(200);
    });
}
exports["default"] = default_1;


/***/ }),

/***/ 8555:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.writeClientConstants = exports.schedule = exports.resolve = exports.loadEndpoints = exports.setProjectData = exports.getProjectData = exports.PACKAGE = exports.AUTH_CONFIG = exports.SETTINGS = exports.ENDPOINTS = exports.PROJECT_ROOT = void 0;
const fs_1 = __importDefault(__webpack_require__(7147));
const path_1 = __importDefault(__webpack_require__(1017));
const Utility_1 = __webpack_require__(3376);
/**
 * 프로젝트 루트 경로.
 */
exports.PROJECT_ROOT = path_1.default.resolve(__dirname, "..");
/**
 * `data/endpoints.json` 파일 객체.
 */
exports.ENDPOINTS = {};
/**
 * `data/settings.json` 파일 객체.
 */
exports.SETTINGS = Object.assign({}, JSON.parse(getProjectData("settings.json").toString()));
exports.AUTH_CONFIG = Object.assign({}, JSON.parse(getProjectData("auth.json").toString()));
/**
 * `package.json` 파일 객체.
 */
exports.PACKAGE = JSON.parse(getProjectData("../package.json").toString());
/**
 * 프로젝트 데이터 폴더의 데이터를 동기식으로 읽어 그 내용을 반환한다.
 *
 * @param path 프로젝트 데이터 폴더에서의 하위 경로.
 */
function getProjectData(path) {
    return fs_1.default.readFileSync(path_1.default.resolve(__dirname, `../data/${path}`));
}
exports.getProjectData = getProjectData;
/**
 * 프로젝트 데이터 폴더의 파일에 비동기식으로 내용을 쓴다.
 *
 * @param path 프로젝트 데이터 폴더에서의 하위 경로.
 * @param data 파일에 쓸 내용.
 */
function setProjectData(path, data) {
    return new Promise((res, rej) => {
        fs_1.default.writeFile(path_1.default.resolve(__dirname, `../data/${path}`), data, (err) => {
            if (err) {
                rej(err);
                return;
            }
            res();
        });
    });
}
exports.setProjectData = setProjectData;
/**
 * 프로젝트 데이터 폴더 내의 종점 파일을 새로 읽어 가공 후 메모리에 올린다.
 *
 * 메모리에 올려진 문자열표는 페이지 렌더 시 XHR 종점 목록으로 포함된다.
 */
function loadEndpoints() {
    const R = {};
    const endpoints = JSON.parse(getProjectData("endpoints.json").toString());
    const $items = endpoints["$items"];
    const $global = (0, Utility_1.reduceToTable)(endpoints["$global"], (v) => $items[v]);
    for (const k in endpoints) {
        if (k.startsWith("$")) {
            continue;
        }
        R[k] = Object.assign({}, $global, (0, Utility_1.reduceToTable)(endpoints[k], (v) => $items[v]));
    }
    Object.assign(exports.ENDPOINTS, R);
}
exports.loadEndpoints = loadEndpoints;
/**
 * 프로젝트 루트로부터 하위 경로를 구해 반환한다.
 *
 * @param path 하위 경로 배열.
 */
function resolve(...path) {
    return path_1.default.resolve(exports.PROJECT_ROOT, ...path);
}
exports.resolve = resolve;
/**
 * 주어진 함수가 주기적으로 호출되도록 한다.
 *
 * @param callback 매번 호출할 함수.
 * @param interval 호출 주기(㎳).
 * @param options 설정 객체.
 */
function schedule(callback, interval, options) {
    if (options?.callAtStart) {
        callback();
    }
    if (options?.punctual) {
        const now = Date.now() + Utility_1.TIMEZONE_OFFSET;
        const gap = (1 + Math.floor(now / interval)) * interval - now;
        global.setTimeout(() => {
            callback();
            global.setInterval(callback, interval);
        }, gap);
    }
    else {
        global.setInterval(callback, interval);
    }
}
exports.schedule = schedule;
/**
 * 외부에서 `/constants.js`로 접속할 수 있는 클라이언트 상수 파일을 만든다.
 *
 * 이 파일에는 `data/settings.json` 파일의 `application` 객체 일부가 들어가 있다.
 */
function writeClientConstants() {
    const data = {
        languageSupport: exports.SETTINGS.languageSupport,
    };
    fs_1.default.writeFileSync(resolve("dist", "constants.js"), `window.__CLIENT_SETTINGS=${JSON.stringify(data)}`);
}
exports.writeClientConstants = writeClientConstants;


/***/ }),

/***/ 3376:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toSignedString = exports.resolveLanguageArguments = exports.reduceToTable = exports.pick = exports.orderByString = exports.orderBy = exports.Iterator = exports.isEmpty = exports.merge = exports.cut = exports.TIMEZONE_OFFSET = exports.REGEXP_LANGUAGE_ARGS = exports.FRONT = exports.CLIENT_SETTINGS = void 0;
const DateUnit_1 = __webpack_require__(7554);
/**
 * 클라이언트 설정 객체.
 */
exports.CLIENT_SETTINGS = "FRONT" in Object && eval("window.__CLIENT_SETTINGS");
/**
 * 프론트엔드 여부.
 */
exports.FRONT = Boolean(exports.CLIENT_SETTINGS);
/**
 * 유효한 단일 샤프 인자의 집합.
 */
exports.REGEXP_LANGUAGE_ARGS = /\{#(\d+?)\}/g;
/**
 * 시간대 오프셋 값(㎳).
 */
exports.TIMEZONE_OFFSET = new Date().getTimezoneOffset() * DateUnit_1.DateUnit.MINUTE;
/**
 * 제한 길이를 초과하는 내용이 생략된 문자열을 반환한다.
 *
 * @param text 대상 문자열.
 * @param limit 제한 길이.
 */
function cut(text, limit) {
    return text.length > limit ? text.slice(0, limit - 1) + "…" : text;
}
exports.cut = cut;
/**
 * 대상 객체에 합칠 객체들을 모두 합친 객체를 반환한다.
 *
 * 대상 객체는 복사되지 않고 직접 수정되며,
 * 합치려는 값이 객체인 경우 값을 덮어쓰지 않고 이 함수를 재귀적으로 호출한다.
 *
 * @param target 대상 객체.
 * @param args 합칠 객체 목록.
 */
function merge(target, ...args) {
    for (const v of args) {
        for (const [k, w] of Object.entries(v)) {
            if (typeof target[k] === "object" &&
                typeof w === "object" &&
                w !== null) {
                merge(target[k], w);
            }
            else {
                target[k] = w;
            }
        }
    }
    return target;
}
exports.merge = merge;
/**
 * 대상 객체가 비어 있는지 확인해 반환한다.
 *
 * @param object 대상 객체.
 * @param includeNullity `true`인 경우 값이 `null`이나 `undefined`인 경우도 비어 있는 것으로 본다.
 */
function isEmpty(object, includeNullity) {
    return (!object ||
        (includeNullity
            ? Object.keys(object).filter((k) => object[k] !== null && object[k] !== undefined).length === 0
            : Object.keys(object).length === 0));
}
exports.isEmpty = isEmpty;
/**
 * 배열을 생성해 반환한다.
 *
 * @param length 배열의 길이.
 * @param fill 배열의 내용.
 */
function Iterator(length, fill) {
    return Array(length).fill(fill);
}
exports.Iterator = Iterator;
/**
 * 객체 배열을 정렬할 때 쓸 비교 함수를 만들어 반환한다.
 *
 * @param retriever 객체로부터 비굣값을 추출하는 함수.
 * @param desc 내림차순 정렬 여부.
 */
function orderBy(retriever, desc) {
    return desc
        ? (b, a) => retriever(a) - retriever(b)
        : (a, b) => retriever(a) - retriever(b);
}
exports.orderBy = orderBy;
/**
 * 객체 배열을 문자열 기준으로 정렬할 때 쓸 비교 함수를 만들어 반환한다.
 *
 * @param retriever 객체로부터 비굣값을 추출하는 함수.
 * @param desc 내림차순 정렬 여부.
 */
function orderByString(retriever, desc) {
    return desc
        ? (b, a) => retriever(a).localeCompare(retriever(b))
        : (a, b) => retriever(a).localeCompare(retriever(b));
}
exports.orderByString = orderByString;
/**
 * 대상 객체의 엔트리 일부만 갖는 객체를 반환한다.
 *
 * @param object 대상 객체.
 * @param keys 선택할 키.
 */
function pick(object, ...keys) {
    return keys.reduce((pv, v) => {
        if (v in object) {
            pv[v] = object[v];
        }
        return pv;
    }, {});
}
exports.pick = pick;
/**
 * 배열을 주어진 함수에 따라 딕셔너리로 바꾸어 반환한다.
 *
 * @param target 대상 배열.
 * @param placer 값을 반환하는 함수.
 * @param keyPlacer 키를 반환하는 함수.
 */
function reduceToTable(target, placer, keyPlacer) {
    return target.reduce(keyPlacer
        ? (pv, v, i, my) => {
            pv[keyPlacer(v, i, my)] = placer(v, i, my);
            return pv;
        }
        : (pv, v, i, my) => {
            pv[String(v)] = placer(v, i, my);
            return pv;
        }, {});
}
exports.reduceToTable = reduceToTable;
/**
 * 문자열 내 단일 샤프 인자들을 추가 정보로 대체시켜 반환한다.
 *
 * @param text 입력 문자열.
 * @param args 추가 정보.
 */
function resolveLanguageArguments(text, ...args) {
    return text.replace(exports.REGEXP_LANGUAGE_ARGS, (_, v1) => args[v1]);
}
exports.resolveLanguageArguments = resolveLanguageArguments;
/**
 * 주어진 수가 0보다 크면 + 기호를 붙여 반환한다.
 *
 * @param value 대상.
 */
function toSignedString(value) {
    return (value > 0 ? "+" : "") + value;
}
exports.toSignedString = toSignedString;


/***/ }),

/***/ 5876:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Icon = exports.IconType = void 0;
const react_1 = __importDefault(__webpack_require__(6689));
const FA_REGULAR_TESTER = /^(.+)-o$/;
const FA_CYCLE_TYPES = {
    "!": "fa-pulse",
    "@": "fa-spin",
};
var IconType;
(function (IconType) {
    IconType[IconType["NORMAL"] = 0] = "NORMAL";
    IconType[IconType["STACK"] = 1] = "STACK";
    IconType[IconType["PURE"] = 2] = "PURE";
})(IconType || (exports.IconType = IconType = {}));
const Icon = ({ className, name, type }) => {
    const classList = ["icon"];
    const style = {};
    let chunk;
    if (className)
        classList.push(className);
    switch (type) {
        default:
        case IconType.NORMAL: {
            const spinType = FA_CYCLE_TYPES[name[0]];
            classList.push("fa-fw");
            if (spinType) {
                classList.push(spinType);
                name = name.slice(1);
            }
            chunk = name.match(FA_REGULAR_TESTER);
            classList.push(...(chunk ? ["far", `fa-${chunk[1]}`] : ["fas", `fa-${name}`]));
            return react_1.default.createElement("i", { className: classList.join(" "), style: style });
        }
        case IconType.STACK:
            classList.push("fa-stack");
            return (react_1.default.createElement("span", { className: "ik fa-stack" }, name.split(",").map((v, i) => (react_1.default.createElement(exports.Icon, { key: i, className: "fa-stack-1x", name: v })))));
        case IconType.PURE:
            classList.push("ip", `icon-${name}`);
            style.backgroundImage = `url("/media/images/icons/${name}.png")`;
            return react_1.default.createElement("i", { className: classList.join(" "), style: style });
    }
};
exports.Icon = Icon;


/***/ }),

/***/ 4621:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(6689));
class Footer extends react_1.default.PureComponent {
    render() {
        return react_1.default.createElement("footer", null, "FOOTER");
    }
}
exports["default"] = Footer;


/***/ }),

/***/ 9284:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(6689));
class Header extends react_1.default.PureComponent {
    render() {
        return react_1.default.createElement("header", null, "HEADER");
    }
}
exports["default"] = Header;


/***/ }),

/***/ 1352:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getHumanTimeDistance = exports.getHumanNumber = exports.getHumanMinutes = exports.getHumanSeconds = exports.getHumanDigitalSpace = exports.setTable = void 0;
const react_1 = __importDefault(__webpack_require__(6689));
const Icon_1 = __webpack_require__(5876);
const Utility_1 = __webpack_require__(2788);
const Utility_2 = __webpack_require__(3376);
const PATTERN_RESOLVER = {
    BR: (key) => react_1.default.createElement("br", { key: key }),
    FA: (key, name) => react_1.default.createElement(Icon_1.Icon, { key: key, name: name }),
    FAK: (key, ...args) => (react_1.default.createElement(Icon_1.Icon, { key: key, name: args.join(","), type: Icon_1.IconType.STACK })),
    L: (key, className, data) => (react_1.default.createElement("label", { key: key, className: className }, data)),
    ICON: (key, name) => (react_1.default.createElement(Icon_1.Icon, { key: key, className: "language", name: name, type: Icon_1.IconType.PURE })),
    REF: (key, name, ...args) => (react_1.default.createElement(react_1.default.Fragment, { key: key }, L.render(name, ...args))),
    HUMAN_D: (key, data) => (react_1.default.createElement(react_1.default.Fragment, { key: key }, (0, exports.getHumanDigitalSpace)(Number(data)))),
    HUMAN_M: (key, data) => (react_1.default.createElement(react_1.default.Fragment, { key: key }, (0, exports.getHumanMinutes)(Number(data)))),
    HUMAN_N: (key, data) => (react_1.default.createElement(react_1.default.Fragment, { key: key }, (0, exports.getHumanNumber)(Number(data)))),
};
let TABLE = Utility_2.FRONT && eval("window.__LANGUAGE");
const setTable = (table) => {
    TABLE = { ...table };
};
exports.setTable = setTable;
class L {
    static REGEXP_PATTERN = /<\{(\w+?)(?:\|(.+?))?\}>/g;
    static REGEXP_ARGS = /\{#(\d+?)\}/g;
    static REGEXP_STRICT_ARGS = /\{##(\d+?)\}/g;
    static get(key, ...args) {
        const R = TABLE[key];
        if (!R)
            return `(L#${key})`;
        return R.replace(L.REGEXP_PATTERN, "").replace(L.REGEXP_ARGS, (p, v1) => args[v1]);
    }
    static render(key, ...args) {
        if (TABLE[key]) {
            return L.parse(TABLE[key], ...args);
        }
        else {
            return `(L#${key})`;
        }
    }
    static parse(value, ...args) {
        const R = [];
        const PATTERN = new RegExp(L.REGEXP_PATTERN);
        const blockBank = [];
        let execArray;
        let prevIndex = 0;
        value = value
            .replace(L.REGEXP_STRICT_ARGS, (p, v1) => {
            return args[v1];
        })
            .replace(L.REGEXP_ARGS, (p, v1) => {
            blockBank.push(args[v1]);
            return "<{__}>";
        });
        while ((execArray = PATTERN.exec(value))) {
            if (execArray.index - prevIndex > 0) {
                R.push(value.slice(prevIndex, execArray.index));
            }
            if (execArray[1] === "__") {
                R.push(blockBank.shift());
            }
            else {
                R.push(PATTERN_RESOLVER[execArray[1]](R.length, ...(execArray[2] ? execArray[2].split("|") : [])));
            }
            prevIndex = PATTERN.lastIndex;
        }
        if (prevIndex < value.length) {
            R.push(value.slice(prevIndex));
        }
        return react_1.default.createElement(react_1.default.Fragment, null, R);
    }
}
exports["default"] = L;
const getHumanDigitalSpace = (bytes) => {
    if (bytes < 1024)
        return bytes + " B";
    if (bytes < 1048576)
        return (bytes / 1024).toFixed(2) + " KiB";
    if (bytes < 1073741824)
        return (bytes / 1048576).toFixed(2) + " MiB";
    return (bytes / 1073741824).toFixed(2) + " GiB";
};
exports.getHumanDigitalSpace = getHumanDigitalSpace;
const getHumanSeconds = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
exports.getHumanSeconds = getHumanSeconds;
const getHumanMinutes = (minutes) => {
    if (minutes < 1)
        return L.get("MINUTES_0");
    minutes = Math.round(minutes);
    if (minutes < 60)
        return L.get("MINUTES_1", minutes);
    if (minutes < 1440)
        return L.get("MINUTES_2", Math.floor(minutes / 60), minutes % 60);
    if (minutes < 43800)
        return L.get("MINUTES_3", Math.floor(minutes / 1440), Math.round((minutes % 1440) / 60));
    return L.get("MINUTES_4", Math.floor(minutes / 43800), Math.round((minutes % 43800) / 1440));
};
exports.getHumanMinutes = getHumanMinutes;
const getHumanNumber = (number) => {
    if (number < 1e3)
        return String(number);
    const exp = Math.floor(number).toString().length;
    const digit = 2 - ((exp - 1) % 3);
    if (number < 1e6)
        return (number * 1e-3).toFixed(digit) + "k";
    if (number < 1e9)
        return (number * 1e-6).toFixed(digit) + "M";
    if (number < 1e12)
        return (number * 1e-9).toFixed(digit) + "G";
    if (number < 1e15)
        return (number * 1e-12).toFixed(digit) + "T";
    return (number * 1e-15).toFixed(0) + "P";
};
exports.getHumanNumber = getHumanNumber;
function getHumanTimeDistance(from, to = Date.now()) {
    const distance = (0, Utility_1.getTimeDistance)(from, to);
    return distance > -30
        ? L.render("TIME_DISTANCE_PAST", distance)
        : L.render("TIME_DISTANCE_FUTURE", -distance);
}
exports.getHumanTimeDistance = getHumanTimeDistance;


/***/ }),

/***/ 2788:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTimeDistance = exports.PROPS = void 0;
const Utility_1 = __webpack_require__(3376);
exports.PROPS = Utility_1.FRONT && eval("window['__PROPS']");
function getTimeDistance(from, to = Date.now()) {
    return (to - from) / 60000;
}
exports.getTimeDistance = getTimeDistance;


/***/ }),

/***/ 4199:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(6689));
const react_loader_spinner_1 = __webpack_require__(1223);
class Loading extends react_1.default.PureComponent {
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("article", { id: "loading" },
                react_1.default.createElement("div", { id: "loading-wrapper" },
                    react_1.default.createElement(react_loader_spinner_1.Oval, { height: 80, width: 80, color: "#fff", ariaLabel: "oval-loading", secondaryColor: "#000", strokeWidth: 3, strokeWidthSecondary: 3, wrapperClass: "spinner-wrapper", visible: true }),
                    react_1.default.createElement("h2", { className: "loading-text" }, "\uBD88\uB7EC\uC624\uB294 \uC911...")))));
    }
}
exports["default"] = Loading;


/***/ }),

/***/ 1883:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(6689));
const ReactBootstrap_1 = __importDefault(__webpack_require__(2153));
const Language_1 = __importDefault(__webpack_require__(1352));
class Login extends react_1.default.PureComponent {
    state = { loginButtons: [] };
    componentDidMount() {
        const loginButtons = [];
        console.log(this.props.data.loginMethods);
        for (const config of this.props.data.loginMethods) {
            if (config.useOAuthButtons)
                loginButtons.push(react_1.default.createElement("a", { href: `/login/${config.vendor}` },
                    react_1.default.createElement("div", { className: `lbtn lbtn-${config.vendor}`, style: { marginLeft: Math.max(0, window.innerWidth * 0.5 - 157) } },
                        react_1.default.createElement("i", { className: "logo" }),
                        react_1.default.createElement("a", { className: "label" }, Language_1.default.render(config.displayName)))));
            else
                loginButtons.push(react_1.default.createElement("a", { href: `/login/${config.vendor}` },
                    react_1.default.createElement("button", { id: config.vendor, style: {
                            color: config.fontColor,
                            backgroundColor: config.color,
                        } }, Language_1.default.render(config.displayName))));
        }
        this.setState({ loginButtons });
    }
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("article", { id: "main" },
                react_1.default.createElement("div", { className: "login-with" }, Language_1.default.render("loginWith")),
                react_1.default.createElement("a", { href: "/" },
                    react_1.default.createElement("button", { id: "portal" })),
                this.state.loginButtons,
                react_1.default.createElement("div", { className: "login-legal" },
                    "\uB85C\uADF8\uC778\uC774 \uC774\uB8E8\uC5B4\uC9C0\uBA74 BFKKuTu\uAC00 \uACF5\uC9C0\uD558\uB294",
                    " ",
                    react_1.default.createElement("a", { href: "http://agreement.bfkkutu.ze.am", target: "_blank" }, "\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00"),
                    " ",
                    "\uBC0F",
                    " ",
                    react_1.default.createElement("a", { href: "http://privacy.bfkkutu.ze.am", target: "_blank" }, "\uAC1C\uC778\uC815\uBCF4 \uCDE8\uAE09 \uBC29\uCE68"),
                    "\uC5D0 \uB3D9\uC758\uD558\uB294 \uAC83\uC73C\uB85C \uAC04\uC8FC \uD569\uB2C8\uB2E4."),
                react_1.default.createElement("link", { rel: "stylesheet", href: "/libs/oauth-buttons/oauth-buttons.min.css" }),
                react_1.default.createElement("script", { src: "/libs/oauth-buttons/oauth-buttons.min.js" }))));
    }
}
exports["default"] = Login;
(0, ReactBootstrap_1.default)(Login);


/***/ }),

/***/ 512:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(6689));
const Icon_1 = __webpack_require__(5876);
const ReactBootstrap_1 = __importDefault(__webpack_require__(2153));
const Language_1 = __importDefault(__webpack_require__(1352));
class Portal extends react_1.default.PureComponent {
    state = {
        profile: {},
        list: [],
        isRefreshing: true,
        isListInitialized: false,
        sum: 0,
        windowWidth: window.innerWidth,
    };
    componentDidMount() {
        this.seekServers = this.seekServers.bind(this);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        this.setState({ profile: this.props.session.profile || {} });
        window.addEventListener("resize", () => {
            this.setState({
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
            });
        });
        setInterval(() => {
            if (this.state.isRefreshing)
                return alert(Language_1.default.get("serverWait"));
            this.setState({ isRefreshing: true });
            setTimeout(this.seekServers, 1000);
        }, 60000);
        this.seekServers();
    }
    async seekServers() {
        const { list } = await (await fetch("/servers")).json();
        if (list && list.length)
            this.setState({
                list,
                sum: list.reduce((partialSum, i) => partialSum + i, 0),
                isRefreshing: false,
                isListInitialized: true,
            });
    }
    render() {
        return (react_1.default.createElement("article", { id: "Middle", style: {
                marginLeft: Math.max(0, this.state.windowWidth * 0.5 - 500),
            } },
            react_1.default.createElement("div", { className: "flex" },
                react_1.default.createElement("img", { id: "logo", src: "/media/img/kkutu/short_logo.png", alt: "Logo" }),
                react_1.default.createElement("div", { id: "start-button" },
                    react_1.default.createElement("div", { className: "game-start-wrapper" },
                        react_1.default.createElement("button", { className: "game-start", type: "button", onClick: () => {
                                if (!this.state.profile)
                                    return (location.href = "/?server=0");
                                for (let i = 0.9; i < 1; i += 0.01)
                                    for (let j in this.state.list)
                                        if (this.state.list[j] < i * 100)
                                            return (location.href = `/?server=${j}`);
                            }, disabled: !this.state.isListInitialized }, Language_1.default.render("gameStartBF")),
                        react_1.default.createElement("button", { className: "game-start", type: "button", onClick: () => {
                                location.href = "https://kkutu.kr";
                            }, disabled: true, dangerouslySetInnerHTML: { __html: Language_1.default.get("gameStartKKT3") } })))),
            react_1.default.createElement("div", { className: "flex", style: {
                    width: "100%",
                } },
                react_1.default.createElement("div", { className: "flex", style: {
                        width: "100%",
                    } },
                    react_1.default.createElement("a", { className: "p_button daldalso", target: "_blank", href: "http://daldal.so/" }, "\uB2EC\uB2EC\uC18C"),
                    react_1.default.createElement("a", { className: "p_button kkutu3", target: "_blank", href: "https://kkutu.kr" }, "\uB044\uD22C3"),
                    react_1.default.createElement("a", { className: "p_button discord", target: "_blank", href: "http://discord.gg/scPVHcE" }, "\uB514\uC2A4\uCF54\uB4DC")),
                react_1.default.createElement("div", { className: "flex server-list-wrapper" },
                    react_1.default.createElement("div", { className: "server-list-box" },
                        react_1.default.createElement("h3", { className: "server-list-title" },
                            react_1.default.createElement("div", { id: "server-list-refresh-container" },
                                react_1.default.createElement("a", { id: "server-refresh", onClick: () => {
                                        if (this.state.isRefreshing)
                                            return alert(Language_1.default.get("serverWait"));
                                        this.setState({ isRefreshing: true });
                                        setTimeout(this.seekServers, 1000);
                                    } },
                                    react_1.default.createElement(Icon_1.Icon, { name: "refresh", className: this.state.isRefreshing ? "fa-spin" : "" })),
                                react_1.default.createElement("label", { className: "inline-flex" }, Language_1.default.render("serverList"))),
                            react_1.default.createElement("label", { id: "server-total" },
                                "\u00A0",
                                Language_1.default.render("TOTAL"),
                                " ",
                                this.state.sum,
                                Language_1.default.render("MN"))),
                        react_1.default.createElement("div", { id: "server-list" }, this.state.list.map((v, i) => {
                            let status = v === null ? "x" : "o";
                            const people = status == "x" ? "-" : v + " / " + 100;
                            const limp = (v / 100) * 100;
                            if (status == "o")
                                if (limp >= 99)
                                    status = "q";
                                else if (limp >= 90)
                                    status = "p";
                            return (react_1.default.createElement("div", { className: "server", onClick: () => {
                                    if (status != "x")
                                        location.href = `/?server=${i}`;
                                } },
                                react_1.default.createElement("div", { className: `server-status ss-${status}` }),
                                react_1.default.createElement("div", { className: "server-name" }, Language_1.default.render(`server_${i}`)),
                                react_1.default.createElement("div", { className: "server-people graph" },
                                    react_1.default.createElement("div", { className: "graph-bar", style: { width: `${limp}%` } }),
                                    react_1.default.createElement("label", null, people)),
                                react_1.default.createElement("div", { className: "server-enter" }, status == "x" ? "-" : Language_1.default.render("serverEnter"))));
                        }))))),
            react_1.default.createElement("div", { className: "iframe-container" },
                react_1.default.createElement("iframe", { id: "kkutu-bulletin", src: "/media/notice/bulletin.html" })),
            react_1.default.createElement("ins", { className: "adsbygoogle", "data-ad-client": this.props.metadata.ad?.client, "data-ad-slot": this.props.metadata.ad?.slot })));
    }
}
exports["default"] = Portal;
(0, ReactBootstrap_1.default)(Portal);


/***/ }),

/***/ 2153:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Root = void 0;
const react_1 = __importDefault(__webpack_require__(6689));
const client_1 = __importDefault(__webpack_require__(7849));
const Utility_1 = __webpack_require__(2788);
const Footer_1 = __importDefault(__webpack_require__(4621));
const Header_1 = __importDefault(__webpack_require__(9284));
const Language_1 = __importDefault(__webpack_require__(1352));
function Bind(TargetClass) {
    const $root = document.getElementById("stage");
    client_1.default.createRoot($root).render(react_1.default.createElement(Root, Utility_1.PROPS, react_1.default.createElement(TargetClass, Utility_1.PROPS)));
}
exports["default"] = Bind;
class Root extends react_1.default.PureComponent {
    static getDerivedStateFromError(error) {
        return { error };
    }
    state = {};
    render() {
        if (this.state.error)
            return Language_1.default.render("ERROR", this.state.error.message);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(Header_1.default, null),
            this.props.children,
            react_1.default.createElement(Footer_1.default, null)));
    }
}
exports.Root = Root;


/***/ }),

/***/ 9351:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./daldalso": [
		6638,
		638
	],
	"./daldalso.ts": [
		6638,
		638
	],
	"./discord": [
		5702,
		702
	],
	"./discord.ts": [
		5702,
		702
	],
	"./google": [
		9896,
		896
	],
	"./google.ts": [
		9896,
		896
	],
	"./kakao": [
		4301,
		301
	],
	"./kakao.ts": [
		4301,
		301
	],
	"./line": [
		4263,
		263
	],
	"./line.ts": [
		4263,
		263
	],
	"./naver": [
		1041,
		41
	],
	"./naver.ts": [
		1041,
		41
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = 9351;
module.exports = webpackAsyncContext;

/***/ }),

/***/ 6122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./Loading/index.tsx": 4199,
	"./Login/index.tsx": 1883,
	"./Portal/index.tsx": 512
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 6122;

/***/ }),

/***/ 6191:
/***/ ((module) => {

"use strict";
module.exports = require("accept-language-parser");

/***/ }),

/***/ 2945:
/***/ ((module) => {

"use strict";
module.exports = require("connect-redis");

/***/ }),

/***/ 9710:
/***/ ((module) => {

"use strict";
module.exports = require("cookie-parser");

/***/ }),

/***/ 6860:
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ 6508:
/***/ ((module) => {

"use strict";
module.exports = require("express-session");

/***/ }),

/***/ 3511:
/***/ ((module) => {

"use strict";
module.exports = require("passport");

/***/ }),

/***/ 9983:
/***/ ((module) => {

"use strict";
module.exports = require("passport-daldalso");

/***/ }),

/***/ 7135:
/***/ ((module) => {

"use strict";
module.exports = require("passport-discord");

/***/ }),

/***/ 8117:
/***/ ((module) => {

"use strict";
module.exports = require("passport-google-oauth2");

/***/ }),

/***/ 9762:
/***/ ((module) => {

"use strict";
module.exports = require("passport-kakao");

/***/ }),

/***/ 419:
/***/ ((module) => {

"use strict";
module.exports = require("passport-line");

/***/ }),

/***/ 9521:
/***/ ((module) => {

"use strict";
module.exports = require("passport-naver");

/***/ }),

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 7849:
/***/ ((module) => {

"use strict";
module.exports = require("react-dom/client");

/***/ }),

/***/ 8684:
/***/ ((module) => {

"use strict";
module.exports = require("react-dom/server");

/***/ }),

/***/ 1223:
/***/ ((module) => {

"use strict";
module.exports = require("react-loader-spinner");

/***/ }),

/***/ 7773:
/***/ ((module) => {

"use strict";
module.exports = require("redis");

/***/ }),

/***/ 5250:
/***/ ((module) => {

"use strict";
module.exports = require("typeorm");

/***/ }),

/***/ 5001:
/***/ ((module) => {

"use strict";
module.exports = require("cluster");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 7282:
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".Main.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/require chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "loaded", otherwise not loaded yet
/******/ 		var installedChunks = {
/******/ 			179: 1
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++)
/******/ 				installedChunks[chunkIds[i]] = 1;
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// require() chunk loading for javascript
/******/ 		__webpack_require__.f.require = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					installChunk(require("./" + __webpack_require__.u(chunkId)));
/******/ 				} else installedChunks[chunkId] = 1;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(8756);
/******/ 	
/******/ })()
;