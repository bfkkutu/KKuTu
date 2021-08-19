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

const log4js = require("log4js");
log4js.configure({
    appenders: { System: { type: "file", filename: "WordInit.log" } },
    categories: { default: { appenders: ["System"], level: "info" } },
});
const logger = log4js.getLogger("System");
const fs = require("fs");
const MainDB = require("../db");
const JLog = require("../../sub/jjlog");
const Lizard = require("../../sub/lizard.js");
const Express = require("express");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "lib/Web/public/uploaded");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

let Language = {
    ko_KR: require("../lang/ko_KR.json"),
    en_US: require("../lang/en_US.json"),
};
let GLOBAL = require("../../sub/global.json");

fs.watchFile("./lib/sub/global.json", () => {
    GLOBAL = require("../../sub/global.json");
    JLog.info("global.json is Auto-Updated at {lib/Web/routes/admin.js}");
});

const translateToPromise = (query) => {
    return new Promise((res, rej) => {
        query.on(
            (doc) => {
                res(doc);
            },
            null,
            (err) => {
                rej(err);
            }
        );
    });
};
const validate = (list, item) => {
    if (typeof list == "object") list = list.filter((x) => x != item);
    else list = list == item ? "" : list;
    return list;
};
const getDirectories = (path, callback) => {
    let files = null;
    try {
        files = fs.readdirSync(path);
    } catch (e) {
        return callback(e);
    }
    return callback(false, files);
};
const noticeAdmin = (req, ...args) => {
    req.ip = req.headers["x-forwarded-for"] || "";
    if (typeof req.ip == "string" && req.ip.includes(","))
        req.ip = req.ip.split(",")[0];

    if (req.originalUrl == "/gwalli/shopditem") {
        logger.info(
            `[ADMIN]: ${req.originalUrl} Removed item ${args} ${req.ip}`
        );
        fs.appendFileSync(
            `../IP-Log/ItemLog.txt`,
            `\n[ADMIN]: ${req.originalUrl} Removed item ${args} ${req.ip}`,
            "utf8",
            (err, ip, path) => {
                if (err)
                    return logger.error(
                        `IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`
                    );
            }
        );
        JLog.info(`[ADMIN]: ${req.originalUrl} Removed item ${args} ${req.ip}`);
    } else {
        logger.info(
            `[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(" | ")}`
        );
        fs.appendFileSync(
            `../IP-Log/WordInit.txt`,
            `\n[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(" | ")}`,
            "utf8",
            (err, ip, path) => {
                if (err)
                    return logger.error(
                        `IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`
                    );
            }
        );
        JLog.info(
            `[ADMIN]: ${req.originalUrl} ${req.ip} | ${args.join(" | ")}`
        );
    }
};
const itemLog = (item, req, ...args) => {
    req.ip = req.headers["x-forwarded-for"] || "";
    if (typeof req.ip == "string" && req.ip.includes(","))
        req.ip = req.ip.split(",")[0];

    if (req.originalUrl == "/gwalli/kkutuDdb")
        logger.info(
            `[ADMIN]: ${req.originalUrl} Removed Word ${item} ${
                req.ip
            } | ${args.join(" | ")}`
        );
    else
        logger.info(
            `[ADMIN]: ${req.originalUrl} Added Word ${item} ${
                req.ip
            } | ${args.join(" | ")}`
        );
    fs.appendFileSync(
        `../IP-Log/WordInit.txt`,
        `\n[ADMIN]: ${req.originalUrl} ${item} ${req.ip} | ${args.join(" | ")}`,
        "utf8",
        (err, ip, path) => {
            if (err)
                return logger.error(
                    `IP를 기록하는 중에 문제가 발생했습니다.   (${err.toString()})`
                );
        }
    );
    if (req.originalUrl == "/gwalli/kkutuDdb")
        JLog.info(
            `[ADMIN]: ${req.originalUrl} Removed Word ${item} ${
                req.ip
            } | ${args.join(" | ")}`
        );
    else
        JLog.info(
            `[ADMIN]: ${req.originalUrl} Added Word ${item} ${
                req.ip
            } | ${args.join(" | ")}`
        );
};
const checkAdmin = (req, res, type) => {
    req.ip = req.headers["x-forwarded-for"] || "";
    if (global.isPublic) {
        if (req.session.profile) {
            if (GLOBAL.ADMINS["MANAGER"].indexOf(req.session.profile.id) != -1)
                return true;

            if (GLOBAL.ADMINS[type].indexOf(req.session.profile.id) == -1) {
                req.session.admin = false;
                JLog.warn(
                    `권한이 없는 회원이 관리자 페이지에 접근을 시도했습니다.　\n시용자(ID | IP): [${req.session.profile.id}] | [${req.ip}]`
                );
                return (
                    res.send(
                        `<title>BF끄투 - 500</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>500 Access Denied</h2><div>이 곳에 접근할 권한이 없습니다.</div><br/><ul> <li>해당 페이지에 접근할 권한이 없습니다.</li><li>접속한 페이지가 자신의 부서와 맞는지 확인해 보세요.</li><li>정상적인 방법으로 접근한 것인지 확인해 보세요.</li><li>권한 부여가 아직 되지 않았을 수 있습니다. 총관리자에게 식별 번호를 알려주세요.</li></ul>`
                    ),
                    false
                );
            }
        } else {
            req.session.admin = false;
            JLog.warn(
                `권한이 없는 비회원이 관리자 페이지에 접근을 시도했습니다.　\n사용자(IP): [${req.ip}]`
            );
            return (
                res.send(
                    `<title>BF끄투 - 500</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>500 Access Denied</h2><div>이 곳에 접근할 권한이 없습니다.</div><br/><ul> <li>해당 페이지에 접근할 권한이 없습니다.</li><li>정상적인 방법으로 접근한 것인지 확인해 보세요.</li><li>관리자 계정으로 로그인 후에 다시 시도해 보세요.</li></ul>`
                ),
                false
            );
        }
    } else {
        req.session.admin = false;
        JLog.warn(`잘못된 요청입니다.　\n사용자(IP): [${req.ip}]`);
        return (
            res.send(
                `<title>BF끄투 - 400</title><style>body{font-family: 나눔바른고딕, 맑은 고딕, 돋움;}</style></title><h2>400 Bad Request</h2><div>잘못된 요청입니다.</div><br/><ul> <li>서버에 문제가 발생했을 수 있습니다.</li></ul>`
            ),
            false
        );
    }
    return true;
};
const flushShop = () => {
	MainDB.kkutu_shop_desc.find().on(($docs) => {
		const flush = (lang) => {
			let db;
				
			Language[lang].SHOP = db = {};
			for (let j in $docs)
				db[$docs[j]._id] = [
					$docs[j][`name_${lang}`],
					$docs[j][`desc_${lang}`],
				];
		}
		for (let i in Language) flush(i);
	});
	JLog.log("Flushed Shop DB!");
};

exports.flushShop = flushShop;

exports.run = (Server, page, Bot) => {
    Server.get("/admin/developer", (req, res) => {
        if (!checkAdmin(req, res, "DEVELOPER")) return;

        req.session.admin = true;
        page(req, res, "admin_developer");
    });
    Server.get("/admin/words", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;

        req.session.admin = true;
        page(req, res, "admin_words");
    });
    Server.get("/admin/users", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        req.session.admin = true;
        page(req, res, "admin_users");
    });
    Server.get("/admin/designer", (req, res) => {
        if (!checkAdmin(req, res, "DESIGNER")) return;

        req.session.admin = true;
        page(req, res, "admin_designer");
    });
    Server.get("/admin/upload", (req, res) => {
        if (!checkAdmin(req, res, "DESIGNER")) return;

        req.session.admin = true;
        res.render("upload.pug");
    });
    Server.post("/admin/upload", upload.single("userfile"), (req, res) => {
        res.send("Uploaded file completely.");
        console.log(req.file);
    });
    Server.use("/admin/uploaded", Express.static("uploads"));

    Server.get("/gwalli/injeong", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;

        MainDB.kkutu_injeong
            .find(["theme", { $not: "~" }])
            .limit(100)
            .on(($list) => {
                res.send({ list: $list });
            });
    });
    Server.get("/gwalli/gamsi", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        MainDB.users
            .findOne(["_id", req.query.id])
            .limit(["server", true])
            .on(($u) => {
                if (!$u) return res.sendStatus(404);
                const data = { _id: $u._id, server: $u.server };

                MainDB.session
                    .findOne(["profile.id", $u._id])
                    .limit(["profile", true])
                    .on(($s) => {
                        if ($s)
                            data.title = $s.profile.title || $s.profile.name;
                        res.send(data);
                    });
            });
    });
    Server.get("/gwalli/users", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        if (req.query.name) {
            MainDB.session.find(["profile.title", req.query.name]).on(($u) => {
                if ($u) return onSession($u);
                MainDB.session
                    .find(["profile.name", req.query.name])
                    .on(($u) => {
                        if ($u) return onSession($u);
                        res.sendStatus(404);
                    });
            });
        } else {
            MainDB.users.findOne(["_id", req.query.id]).on(($u) => {
                if ($u) return res.send({ list: [$u] });
                res.sendStatus(404);
            });
        }
        function onSession(list) {
            const board = {};

            Lizard.all(
                list.map((v) => {
                    if (board[v.profile.id]) return null;
                    else {
                        board[v.profile.id] = true;
                        return getProfile(v.profile.id);
                    }
                })
            ).then((data) => {
                res.send({ list: data });
            });
        }
        function getProfile(id) {
            const R = new Lizard.Tail();

            if (id)
                MainDB.users.findOne(["_id", id]).on(($u) => {
                    R.go($u);
                });
            else R.go(null);
            return R;
        }
    });
    Server.post("/gwalli/ip_log", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        res.send(fs.readFileSync("./../IP-Log/Join_Exit.txt", "utf8"));
    });
    Server.post("/gwalli/kkutu_log", (req, res) => {
        if (!checkAdmin(req, res, "DEVELOPER")) return;

        res.send("Sorry, This feature is not supported(Undeveloped).");
    });
    Server.post("/gwalli/kkutu_error", (req, res) => {
        if (!checkAdmin(req, res, "DEVELOPER")) return;

        res.send("Sorry, This feature is not supported(Undeveloped).");
    });
    Server.get("/gwalli/kkutudb/:word", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;

        const TABLE = MainDB.kkutu[req.query.lang];

        if (!TABLE) return res.sendStatus(400);
        if (!TABLE.findOne) return res.sendStatus(400);

        TABLE.findOne(["_id", req.params.word]).on(($doc) => {
            res.send($doc);
        });
    });
    Server.get("/gwalli/kkututheme", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;

        const TABLE = MainDB.kkutu[req.query.lang];

        if (!TABLE) return res.sendStatus(400);
        if (!TABLE.find) return res.sendStatus(400);
        TABLE.find(["theme", new RegExp(req.query.theme)])
            .limit(["_id", true])
            .on(($docs) => {
                res.send({ list: $docs.map((v) => v._id) });
            });
    });
    Server.post("/gwalli/users/ipban", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        const IpFilters = JSON.parse(
            fs.readFileSync("./lib/Web/filters/User.json")
        );
        req.params.list.forEach((ip, index) => {
            if (IpFilters.ips.indexOf(ip) == -1) IpFilters.ips.push(ip);

            if (req.params.list.length == index) {
                fs.writeFile(
                    "./lib/Web/filters/User.json",
                    JSON.stringify(IpFilters, null, "\t"),
                    () => {
                        if (!err) return res.sendStatus(400);

                        JLog.info(
                            `[${clientIp}](IP) was banned At [${requestId}]`
                        );
                        res.send("SUCCESS");
                    }
                );
            }
        });
    });
    Server.get("/gwalli/reports", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        const data = {};

        const readFiles = (dirname, onFileContent, onError) => {
            fs.readdir(dirname, (err, filenames) => {
                if (err) {
                    onError(err);
                    return;
                }
                filenames.forEach((filename) => {
                    fs.readFile(dirname + filename, "utf-8", (err, content) => {
                        if (err) {
                            onError(err);
                            return;
                        }
                        onFileContent(filename, content);
                    });
                });
            });
        };
        readFiles(
            "./lib/Web/report/",
            (filename, content) => {
                data[filename] = content;
            },
            (err) => {
                return res.send({ error: err });
            }
        );
        setTimeout(() => {
            return res.send({ list: data });
        }, 1000);
    });
    Server.get("/gwalli/compt", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.query.pw != GLOBAL.PASS) return res.sendStatus(400);
        if (!req.query.file) return;

        let data = fs.readFileSync(
            `./lib/Web/report/${req.query.file}.json`,
            "utf8",
            (err) => {
                return res.send({ error: 404 });
            }
        );
        data = JSON.parse(data);

        setTimeout(() => {
            if (!data.compt) {
                data.compt = true;
                fs.writeFileSync(
                    `./lib/Web/report/${req.query.file}.json`,
                    JSON.stringify(data),
                    "utf8",
                    (err) => {
                        if (err) return res.send({ error: 404 });
                    }
                );
            } else return res.send({ error: 404 });
            return res.send({ result: "SUCCESS" });
        }, 100);
    });
    Server.get("/gwalli/chatlog", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        const data = fs.readFileSync(
            `./lib/Web/chatlog/all/${req.query.id}.log`,
            "utf8",
            (err) => {
                return res.send({ error: 404 });
            }
        );

        setTimeout(() => {
            return res.send({ data: data });
        }, 100);
    });
    Server.post("/gwalli/editor/getfile", (req, res) => {
        if (!checkAdmin(req, res, "DEVELOPER")) return;

        fs.readFile(req.params.path, "utf8", (err, data) => {
            if (!err) return res.sendStatus(400);
            res.send(data);
        });
    });
    Server.post("/gwalli/editor/setfile", (req, res) => {
        if (!checkAdmin(req, res, "DEVELOPER")) return;

        fs.writeFile(req.params.path, req.params.value, "utf8", (err, data) => {
            if (!err) return res.sendStatus(400);
            res.send(fs.readFileSync("./../../../" + req.params.path));
        });
    });
    Server.get("/gwalli/shop/:key", (req, res) => {
        if (!checkAdmin(req, res, "DESIGNER")) return;

        const q =
            req.params.key == "~ALL" ? undefined : ["_id", req.params.key];

        MainDB.kkutu_shop.find(q).on(($docs) => {
            MainDB.kkutu_shop_desc.find(q).on(($desc) => {
                res.send({ goods: $docs, desc: $desc });
            });
        });
    });
    Server.post("/gwalli/injeong", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const list = JSON.parse(req.body.list).list;

        list.forEach((v) => {
            if (v.ok) {
                req.body.nof = true;
                req.body.lang = "ko";
                v.theme.split(",").forEach((w, i) => {
                    setTimeout(
                        (lid, x) => {
                            req.body.list = lid;
                            req.body.theme = x;
                            onKKuTuDB(req, res);
                        },
                        i * 1000,
                        v._id.replace(/[^가-힣0-9]/g, ""),
                        w
                    );
                });
            } else {
                MainDB.kkutu_injeong
                    .update(["_id", v._origin])
                    .set(["theme", "~"])
                    .on();
            }
        });
        res.sendStatus(200);
    });
    Server.post("/gwalli/kkutudb", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const theme = req.body.theme;
        const TABLE = MainDB.kkutu[req.body.lang];
        let list = req.body.list;
        let validatedList = req.body.list.split("\n");

        if (list) list = list.split(/[,\r\n]+/);
        else return res.sendStatus(400);
        if (!TABLE) return res.sendStatus(400);
        if (!TABLE.insert) return res.sendStatus(400);

        (async () => {
            await Promise.all(
                list.map(async (item) => {
                    if (!item) return;
                    item = item.trim();
                    if (!item.length) return;
                    const $doc = await translateToPromise(
                        TABLE.findOne(["_id", item])
                    );
                    if (!$doc)
                        return await translateToPromise(
                            TABLE.insert(
                                ["_id", item],
                                ["type", "INJEONG"],
                                ["theme", theme],
                                ["mean", "＂1＂"],
                                ["flag", 2]
                            )
                        );
                    const means = $doc.mean.split(/＂[0-9]+＂/g).slice(1);
                    const len = means.length;

                    if ($doc.theme.indexOf(theme) == -1) {
                        $doc.type += ",INJEONG";
                        $doc.theme += "," + theme;
                        $doc.mean += `＂${len + 1}＂`;
                        await translateToPromise(
                            TABLE.update(["_id", item]).set(
                                ["type", $doc.type],
                                ["theme", $doc.theme],
                                ["mean", $doc.mean]
                            )
                        );
                    } else {
                        JLog.warn(
                            `Word '${item}' already has the theme '${theme}'!`
                        );
                        validatedList = await validate(validatedList, item);
                    }
                    itemLog(item, req, theme, list.length);
                })
            );
            Bot.word("추가", theme, validatedList.join("\n"));
        })();
        if (!req.body.nof) res.sendStatus(200);
    });
    Server.post("/gwalli/kkutudb/:word", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
        const TABLE = MainDB.kkutu[req.body.lang];
        const data = JSON.parse(req.body.data);

        if (!TABLE) res.sendStatus(400);
        if (!TABLE.upsert) res.sendStatus(400);

        noticeAdmin(req, data._id);
        if (data.mean == "") {
            TABLE.remove(["_id", data._id]).on(($res) => {
                res.send($res.toString());
            });
        } else {
            TABLE.upsert(["_id", data._id])
                .set(
                    ["flag", data.flag],
                    ["type", data.type],
                    ["theme", data.theme],
                    ["mean", data.mean]
                )
                .on(($res) => {
                    res.send($res.toString());
                });
        }
    });
    Server.post("/gwalli/kkutuDdb", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const theme = req.body.theme;
        const TABLE = MainDB.kkutu[req.body.lang];
        let list = req.body.list ? req.body.list.split(/[,\r\n]+/) : null;

        Bot.word("삭제", theme, list);

        if (!list) return res.sendStatus(400);
        if (!TABLE) res.sendStatus(400);

        list.forEach((item) => {
            if (!item) return;
            item = item.trim();
            if (!item.length) return;
            TABLE.findOne(["_id", item]).on(($doc) => {
                if (!$doc) {
                    JLog.warn(
                        `Word '${item}' already hasn't the theme '${theme}'!`
                    );
                    return;
                }
                const themes = $doc.theme.split(",");

                if (themes.length == 0) TABLE.remove(["_id", item]).on();
                if (themes.indexOf(theme) == -1) {
                    // 존재하지 않으면
                    JLog.warn(
                        `Word '${item}' already hasn't the theme '${theme}'!`
                    );
                } else {
                    // 존재하면
                    if (themes.length == 1) TABLE.remove(["_id", item]).on();
                    else {
                        let fmean = "";
                        let types = $doc.type.split(",");
                        let means = $doc.mean.split("＂");
                        let produced = "{";

                        for (let n in means) {
                            if (n != 0) {
                                produced += (n / 2).toString().includes(".")
                                    ? `"${means[Number(n)]}":`
                                    : ` "${means[Number(n)]}",`;
                            } else continue;
                        }

                        means = JSON.parse(produced.slice(0, -1) + "}");

                        for (let i in themes) {
                            if (themes[i] == theme) {
                                let thidx = themes.indexOf(theme);
                                let tyidx = types.indexOf(types[i]);

                                themes.splice(thidx, 1);
                                types.splice(tyidx, 1);

                                delete means[i];

                                for (let j in JSON.stringify(means).split(
                                    ","
                                )) {
                                    fmean += JSON.stringify(means)
                                        .replace(/[\{\}\[\]]/gi, "")
                                        .split(",")
                                        [j].replace('"', "＂")
                                        .replace('"', "＂")
                                        .replace(":", "")
                                        .replace('"', "")
                                        .replace('"', "");
                                }
                                TABLE.update(["_id", item])
                                    .set(
                                        ["theme", themes.toString()],
                                        ["type", types.toString()],
                                        ["mean", fmean]
                                    )
                                    .on();
                                break;
                            } else continue;
                        }
                        itemLog(item, req, theme, list.length);
                    }
                }
            });
        });
        if (!req.body.nof) res.sendStatus(200);
    });
    Server.post("/gwalli/kkutuDdb/:word", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
        const TABLE = MainDB.kkutu[req.body.lang];
        const data = JSON.parse(req.body.data);

        if (!TABLE) res.sendStatus(400);
        if (!TABLE.upsert) res.sendStatus(400);

        noticeAdmin(req, data._id);
        TABLE.remove(["_id", data._id]).on(($res) => {
            res.send($res.toString());
        });
    });
    Server.get("/gwalli/hitword", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        const TABLE = MainDB.kkutu[req.query.lang];

        if (!TABLE) return res.sendStatus(400);
        if (!TABLE.findOne) return res.sendStatus(400);

        TABLE.findOne(["_id", req.query.word]).on(($doc) => {
            if (!$doc) return res.sendStatus(400);
            else if (!$doc.hit) return res.sendStatus(400);
            else return res.send({ result: $doc.hit });
        });
    });
    Server.get("/gwalli/manner", (req, res) => {
        if (!checkAdmin(req, res, "WORDS")) return;
        const MANNER = MainDB.kkutu_manner[req.query.lang];

        if (!MANNER) return res.sendStatus(400);
        if (!MANNER.findOne) return res.sendStatus(400);

        MANNER.findOne(["_id", req.query.letter]).on(($doc) => {
            if (!$doc) return res.send({ result: 404 });
            else {
                MANNER.remove(["_id", req.query.letter]).on();
                return res.send({ result: 1 });
            }
        });
    });
    Server.post("/gwalli/users", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const list = JSON.parse(req.body.list).list;

        list.forEach((item) => {
            MainDB.users.upsert(["_id", item._id]).set(item).on();
        });
        res.sendStatus(200);
    });
    Server.post("/gwalli/monthly", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const list = req.body.list;
        const ping = req.body.ping;

        for (let i in list) {
            MainDB.users.findOne(["_id", list[i]]).on(($doc) => {
                if (!$doc) return res.sendStatus(400);

                MainDB.users
                    .upsert(["_id", list[i]])
                    .set(["money", Number($doc.money) + Number(ping)])
                    .on();
                return res.send({ result: "SUCCESS" });
            });
        }
    });
    Server.post("/gwalli/warn", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;

        if (!req.body.id) return res.send({ error: 404 });
        if (!req.body.warn) return res.send({ error: 404 });

        const id = req.body.id;
        const warn = Number(req.body.warn);

        MainDB.users.findOne(["_id", id]).on(($user) => {
            if (!$user) return res.send({ error: 404 });

            if (warn >= 4) {
                MainDB.users
                    .update(["_id", id])
                    .set(
                        ["warn", 0],
                        ["black", "경고 누적"],
                        ["bandate", 99999999999999]
                    )
                    .on();
                Bot.ban(
                    $user,
                    "관리자 페이지",
                    `경고 누적 (${warn}회)`,
                    "영구"
                );
                return res.send({ result: "SUCCESS" });
            } else {
                MainDB.users.update(["_id", id]).set(["warn", warn]).on();
                Bot.warn(
                    $user,
                    "관리자 페이지",
                    warn - Number($user.warn),
                    warn
                );
                return res.send({ result: "SUCCESS" });
            }
        });
    });
    Server.get("/gwalli/getWarn", (req, res) => {
        if (!req.query.id) return res.send({ error: 404 });
        const id = req.query.id;
        MainDB.users.findOne(["_id", id]).on(($user) => {
            if (!$user) return res.send({ error: 404 });
            else if (!$user.warn) return res.send({ error: 404 });
            else return res.send({ result: $user.warn });
        });
    });
    Server.get("/gwalli/resetRP", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.query.pw != GLOBAL.MPASS) return res.send({ error: 500 });

        MainDB.users.find().on(($list) => {
            if (!$list) return res.sendStatus(400);

            const rewardTarget = {
                bronze: [],
                silver: [],
                gold: [],
                platinum: [],
                diamond: [],
                master: [],
            };

            for (let i in $list) {
                if (
                    $list[i].kkutu["rankPoint"] >= 50 &&
                    $list[i].kkutu["rankPoint"] < 1000
                ) {
                    rewardTarget.bronze.push($list[i]._id);
                } else if (
                    $list[i].kkutu["rankPoint"] >= 1000 &&
                    $list[i].kkutu["rankPoint"] < 2000
                ) {
                    rewardTarget.silver.push($list[i]._id);
                } else if (
                    $list[i].kkutu["rankPoint"] >= 2000 &&
                    $list[i].kkutu["rankPoint"] < 3000
                ) {
                    rewardTarget.gold.push($list[i]._id);
                } else if (
                    $list[i].kkutu["rankPoint"] >= 3000 &&
                    $list[i].kkutu["rankPoint"] < 4000
                ) {
                    rewardTarget.platinum.push($list[i]._id);
                } else if (
                    $list[i].kkutu["rankPoint"] >= 4000 &&
                    $list[i].kkutu["rankPoint"] < 5000
                ) {
                    rewardTarget.diamond.push($list[i]._id);
                } else if ($list[i].kkutu["rankPoint"] >= 5000)
                    rewardTarget.master.push($list[i]._id);
            }
            for (let n in $list) {
                $list[n].kkutu["rankPoint"] = 0;
                MainDB.users
                    .update(["_id", $list[n]._id])
                    .set(["kkutu", $list[n].kkutu])
                    .on();
            }
            fs.writeFileSync(
                `./lib/Web/logs.log`,
                `${JSON.stringify(rewardTarget)}`,
                "utf8",
                (err) => {
                    if (err) return res.send({ result: 404 });
                }
            );
        });
        return res.send({ result: "SUCCESS" });
    });
    Server.post("/gwalli/shop", (req, res) => {
        if (!checkAdmin(req, res, "DESIGNER")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const list = JSON.parse(req.body.list).list;

        list.forEach((item) => {
            item.core.options = JSON.parse(item.core.options);
            MainDB.kkutu_shop.upsert(["_id", item._id]).set(item.core).on();
            MainDB.kkutu_shop_desc
                .upsert(["_id", item._id])
                .set(item.text)
                .on();
        });
		flushShop();
        return res.sendStatus(200);
    });
    Server.post("/gwalli/shopditem", (req, res) => {
        if (!checkAdmin(req, res, "DESIGNER")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const list = JSON.parse(req.body.list).list;
        let resItem;

        list.forEach((item) => {
            resItem = item;
            MainDB.kkutu_shop.remove(["_id", item._id]).on();
            MainDB.kkutu_shop_desc.remove(["_id", item._id]).on();
        });
        noticeAdmin(req, resItem._id);
		flushShop();
        return res.send({ _id: resItem._id });
    });
    Server.post("/gwalli/shopGIIL", (req, res) => {
        if (!checkAdmin(req, res, "DESIGNER")) return;
        if (req.body.pw != GLOBAL.PASS) return res.sendStatus(400);

        const list = req.body.list ? (list = list.split(/[,\r\n]+/)) : null;
        const item = req.body.item;
        const TABLE = MainDB.users;

        if (!list) return res.sendStatus(400);
        if (!TABLE) res.sendStatus(400);

        list.forEach((l) => {
            if (!l) return;
            l = l.trim();
            if (!l.length) return;
            TABLE.findOne(["_id", l]).on(($u) => {
                if (!$u) return res.send({ result: "fail" });
                else {
                    $u.box[item] = 1;
                    TABLE.update(["_id", l]).set(["box", $u.box]).on();
                }
            });
        });
        noticeAdmin(req, item);
        return res.send({ result: "success" });
    });

    Server.get("/gwalli/inquire", async (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.query.pw != GLOBAL.MPASS) return res.send({ error: 500 });

        const inquiries = [];
        let inquiry = {};
        async function* asyncGenerator(num) {
            let i = 0;
            while (i < num) {
                yield i++;
            }
        }
        await getDirectories("./lib/Web/inquire", async (err, files) => {
            for await (let i of asyncGenerator(files.length)) {
                inquiry = JSON.parse(
                    fs.readFileSync(`./lib/Web/inquire/${files[i]}`, "utf8")
                );
                if (!inquiry.answer.answered) inquiries.push(inquiry);
                else continue;
            }
        });
        return res.send(inquiries);
    });

    Server.post("/gwalli/inquire/answer", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.query.pw != GLOBAL.MPASS) return res.send({ error: 500 });

        const inquiry = JSON.parse(
            fs.readFileSync(
                `./lib/Web/inquire/${req.body.inquiry.id}_${req.body.inquiry.date}.json`,
                "utf8"
            )
        );

        inquiry.answer = req.body.answer;

        fs.writeFileSync(
            `./lib/Web/inquire/${req.body.inquiry.id}_${req.body.inquiry.date}.json`,
            JSON.stringify(inquiry),
            "utf8",
            (err) => {
                if (err) return res.send({ error: 404 });
            }
        );
        return res.sendStatus(200);
    });

    Server.get("/gwalli/migratebandata", (req, res) => {
        if (!checkAdmin(req, res, "USERS")) return;
        if (req.query.pw != GLOBAL.MPASS) return res.send({ error: 500 });

        MainDB.users.find().on((data) => {
            let newData;
            for (let i in data) {
                if (String(data[i].bandate).includes("99999999"))
                    data[i].bandate = "permanent";
                newData = `{"isBanned":${
                    data[i].black == "null" ? false : data[i].black != null
                },"reason":${
                    data[i].black == null || data[i].black == "null"
                        ? '""'
                        : '"' + data[i].black + '"'
                },"bannedAt":"","bannedUntil":${
                    data[i].black != null
                        ? String(data[i].bandate).substring(0, 10) == null
                            ? '""'
                            : '"' +
                              String(data[i].bandate).substring(0, 10) +
                              '"'
                        : '""'
                }}`;
                MainDB.users
                    .update(["_id", data[i]._id])
                    .set(["ban", newData])
                    .on(() => {});
            }
        });
        return res.sendStatus(200);
    });
};
