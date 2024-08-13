import Express from "express";

import { PageBuilder } from "back/utils/ReactNest";
import { getLoginMethods } from "back/utils/LoginRoute";
import Channel from "back/game/Channel";
import { PACKAGE, SETTINGS } from "back/utils/System";
import DB from "back/utils/Database";
import { Database } from "../../common/Database";
import { KKuTu } from "../../common/KKuTu";
import API from "../../common/API";

import User from "back/models/User";
import Word from "back/models/Word";
import Mean from "back/models/Mean";
import { Manner } from "back/models/cache";

export default function (App: Express.Application): void {
  const WEBSOCKET_PROTOCOL =
    SETTINGS.secure.ssl || SETTINGS.secure.proxied ? "wss" : "ws";
  const DEPENDENCIES = [
    ...Object.entries(PACKAGE.devDependencies),
    ...Object.entries(PACKAGE.dependencies),
  ].sort();

  App.get("/", PageBuilder("Portal"));
  App.get("/game/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.sendStatus(400);
    }

    if (req.session.profile === undefined) {
      res.status(401);
      return res.redirect("/login");
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.redirect("/register");
    }

    return PageBuilder("KKuTu", {
      id: user.id,
      ws: `${WEBSOCKET_PROTOCOL}://${
        SETTINGS.channel[id].hostname || req.hostname
      }:${SETTINGS.channel[id].ports.external}/?sid=${req.session.id}`,
    })(req, res, next);
  });
  App.get("/login", (req, res, next) =>
    PageBuilder("Login", { loginMethods: getLoginMethods() })(req, res, next)
  );
  App.get(
    "/docs/opensource",
    PageBuilder("OpenSource", {
      dependencies: DEPENDENCIES,
    })
  );
  App.get("/servers", (_, res) =>
    res.send({
      list: Channel.instances.map((v) =>
        v.alive ? v.getActiveUserCount() : null
      ),
      max: SETTINGS.max[0],
    })
  );
  App.get("//servers", (_, res) => res.redirect("/servers"));

  App.get("/admin", async (req, res, next) => {
    if (req.session.profile === undefined) {
      res.status(401);
      return res.redirect("/login");
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.redirect("/register");
    }

    if (user.departures === Database.Departure.None) {
      return res.sendStatus(403);
    }

    return PageBuilder("Administration", { departures: user.departures })(
      req,
      res,
      next
    );
  });
  App.get<
    "/admin/owner/appointment",
    {},
    any,
    any,
    API.GET["/admin/owner/appointment"]
  >("/admin/owner/appointment", async (req, res) => {
    if (req.session.profile === undefined) {
      return res.sendStatus(401);
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.sendStatus(401);
    }

    if (!(user.departures & Database.Departure.Owner)) {
      return res.sendStatus(403);
    }

    const { id } = req.query;
    if (typeof id !== "string") {
      return res.sendStatus(400);
    }

    const target = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.id = :id", { id })
      .getOne();
    if (target === null) {
      return res.sendStatus(404);
    }

    return res.send({ departures: target.departures });
  });
  App.put<
    "/admin/owner/appointment",
    {},
    any,
    API.PUT["/admin/owner/appointment"]
  >("/admin/owner/appointment", async (req, res) => {
    if (req.session.profile === undefined) {
      return res.sendStatus(401);
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.sendStatus(401);
    }

    if (!(user.departures & Database.Departure.Owner)) {
      return res.sendStatus(403);
    }

    const { id, departures } = req.body;
    if (typeof id !== "string") {
      return res.sendStatus(400);
    }
    if (!Number.isInteger(departures)) {
      return res.sendStatus(400);
    }

    const target = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.id = :id", { id })
      .getOne();
    if (target === null) {
      return res.sendStatus(404);
    }

    target.departures = departures;
    try {
      await DB.Manager.save(target);
    } catch (e) {
      return res.sendStatus(500);
    }

    return res.sendStatus(200);
  });
  App.get<
    "/admin/database/word",
    {},
    any,
    any,
    API.GET["/admin/database/word"]
  >("/admin/database/word", async (req, res) => {
    if (req.session.profile === undefined) {
      return res.sendStatus(401);
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.sendStatus(401);
    }

    if (!(user.departures & Database.Departure.DatabaseWord)) {
      return res.sendStatus(403);
    }

    const { language, data, full } = req.query;
    if (!KKuTu.Game.LANGUAGES.includes(language)) {
      return res.sendStatus(400);
    }
    if (typeof data !== "string") {
      return res.sendStatus(400);
    }

    const builder = DB.Manager.createQueryBuilder(Word[language], "w").where(
      "w.data = :data",
      { data }
    );
    if (full === "1") {
      builder.innerJoinAndSelect("w.means", "m");
    }

    const word = await builder.getOne();
    if (word === null) {
      return res.sendStatus(404);
    }

    return res.send(word.serialize());
  });
  App.get<
    "/admin/database/words",
    {},
    any,
    any,
    API.GET["/admin/database/words"]
  >("/admin/database/words", async (req, res) => {
    if (req.session.profile === undefined) {
      return res.sendStatus(401);
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.sendStatus(401);
    }

    if (!(user.departures & Database.Departure.DatabaseWord)) {
      return res.sendStatus(403);
    }

    const { language, type: type_, data } = req.query;
    if (!KKuTu.Game.LANGUAGES.includes(language)) {
      return res.sendStatus(400);
    }
    const type = parseInt(type_);
    if (
      !Number.isInteger(type) ||
      !Object.values(API.QueryType).includes(type)
    ) {
      return res.sendStatus(400);
    }
    if (typeof data !== "string") {
      return res.sendStatus(400);
    }

    const builder = DB.Manager.createQueryBuilder(
      Word[language],
      "w"
    ).innerJoinAndSelect("w.means", "m");

    switch (type) {
      case API.QueryType.Exact:
        builder.where("w.data = :data", { data });
        break;
      case API.QueryType.Includes:
        builder.where("w.data LIKE :like", { like: `%${data}%` });
        break;
      case API.QueryType.StartsWith:
        builder.where("w.data LIKE :like", { like: `${data}%` });
        break;
      case API.QueryType.EndsWith:
        builder.where("w.data LIKE :like", { like: `%${data}` });
        break;
    }

    return res.send((await builder.getMany()).map((word) => word.serialize()));
  });
  App.post<"/admin/database/word", {}, any, API.POST["/admin/database/word"]>(
    "/admin/database/word",
    async (req, res) => {
      if (req.session.profile === undefined) {
        return res.sendStatus(401);
      }

      const user = await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", { oid: req.session.profile.id })
        .getOne();
      if (user === null) {
        return res.sendStatus(401);
      }

      if (!(user.departures & Database.Departure.DatabaseWord)) {
        return res.sendStatus(403);
      }

      const { language, word: data } = req.body;
      if (!KKuTu.Game.LANGUAGES.includes(language)) {
        return res.sendStatus(400);
      }
      if (typeof data.data !== "string" || data.data.length === 0) {
        return res.sendStatus(400);
      }
      if (typeof data.means !== "object") {
        return res.sendStatus(400);
      }

      if (
        await DB.Manager.createQueryBuilder(Word[language], "w")
          .where("w.data = :data", { data: data.data })
          .getExists()
      ) {
        return res.sendStatus(409);
      }

      const word = new Word[language]();
      word.data = data.data;
      word.means = [];
      for (const [theme, means] of Object.entries(data.means)) {
        const mean = new Mean[language]();
        mean.word = word;
        mean.theme = theme;
        mean.data = means;
        word.means.push(mean);
      }

      try {
        await DB.Manager.save(word);
        await DB.Manager.save(word.means);
        await purgeCache(language, word.data);
      } catch (e) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    }
  );
  App.post<"/admin/database/words", {}, any, API.POST["/admin/database/words"]>(
    "/admin/database/words",
    async (req, res) => {
      if (req.session.profile === undefined) {
        return res.sendStatus(401);
      }

      const user = await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", { oid: req.session.profile.id })
        .getOne();
      if (user === null) {
        return res.sendStatus(401);
      }

      if (!(user.departures & Database.Departure.DatabaseWord)) {
        return res.sendStatus(403);
      }

      const { language, theme, words } = req.body;
      if (!KKuTu.Game.LANGUAGES.includes(language)) {
        return res.sendStatus(400);
      }
      if (
        !KKuTu.Game.THEMES.includes(theme) &&
        !KKuTu.Game.THEMES_WIDE.includes(theme)
      ) {
        return res.sendStatus(400);
      }
      if (!Array.isArray(words)) {
        return res.sendStatus(400);
      }

      const wordsToBeSaved = [];
      const meansToBeSaved = [];
      for (const data of words) {
        const word = await DB.Manager.createQueryBuilder(Word[language], "w")
          .where("w.data = :data", { data })
          .innerJoinAndSelect("w.means", "m")
          .getOne();
        const mean = new Mean[language]();
        mean.data = [""];
        if (word === null) {
          const word = new Word[language]();
          word.data = data;
          mean.word = word;
          mean.theme = theme;
          word.means = [mean];
          wordsToBeSaved.push(word);
        } else {
          if (word.means.map((mean) => mean.theme).includes(theme)) {
            continue;
          }
          mean.word = word;
          mean.theme = theme;
          word.means.push(mean);
          wordsToBeSaved.push(word);
        }
        meansToBeSaved.push(mean);
      }

      try {
        await DB.Manager.save(wordsToBeSaved);
        await DB.Manager.save(meansToBeSaved);
      } catch (e) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    }
  );
  App.put<"/admin/database/word", {}, any, API.PUT["/admin/database/word"]>(
    "/admin/database/word",
    async (req, res) => {
      if (req.session.profile === undefined) {
        return res.sendStatus(401);
      }

      const user = await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", { oid: req.session.profile.id })
        .getOne();
      if (user === null) {
        return res.sendStatus(401);
      }

      if (!(user.departures & Database.Departure.DatabaseWord)) {
        return res.sendStatus(403);
      }

      const { language, word: data } = req.body;
      if (!KKuTu.Game.LANGUAGES.includes(language)) {
        return res.sendStatus(400);
      }
      if (typeof data.data !== "string" || data.data.length === 0) {
        return res.sendStatus(400);
      }
      if (typeof data.means !== "object") {
        return res.sendStatus(400);
      }

      const word = await DB.Manager.createQueryBuilder(Word[language], "w")
        .where("w.id = :id", { id: data.id })
        .innerJoinAndSelect("w.means", "m")
        .getOne();
      if (word === null) {
        return res.sendStatus(404);
      }

      const means: Mean[] = []; // 삭제될 주제
      for (const mean of word.means) {
        if (!(mean.theme in data.means)) {
          means.push(mean);
        }
      }
      word.means = word.means.filter((mean) => !means.includes(mean));

      for (const [theme, means] of Object.entries(data.means)) {
        const mean = word.means.find((mean) => mean.theme === theme);
        if (mean === undefined) {
          const mean = new Mean[language]();
          mean.word = word;
          mean.theme = theme;
          mean.data = means;
          word.means.push(mean);
        } else {
          mean.data = means;
          word.means.push(mean);
        }
      }
      try {
        await DB.Manager.remove(means);
        await DB.Manager.save(word.means);
        await DB.Manager.save(word);
      } catch (e) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    }
  );
  App.delete<
    "/admin/database/word",
    {},
    any,
    API.DELETE["/admin/database/word"]
  >("/admin/database/word", async (req, res) => {
    if (req.session.profile === undefined) {
      return res.sendStatus(401);
    }

    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.oid = :oid", { oid: req.session.profile.id })
      .getOne();
    if (user === null) {
      return res.sendStatus(401);
    }

    if (!(user.departures & Database.Departure.DatabaseWord)) {
      return res.sendStatus(403);
    }

    const { language, id } = req.body;
    if (!KKuTu.Game.LANGUAGES.includes(language)) {
      return res.sendStatus(400);
    }
    try {
      parseInt(id);
    } catch (e) {
      return res.sendStatus(400);
    }

    const word = await DB.Manager.createQueryBuilder(Word[language], "w")
      .where("w.id = :id", { id })
      .innerJoinAndSelect("w.means", "m")
      .getOne();
    if (word === null) {
      return res.sendStatus(404);
    }

    try {
      await DB.Manager.remove(word.means);
      await DB.Manager.remove(word);
      await purgeCache(language, word.data);
    } catch (e) {
      return res.sendStatus(500);
    }

    return res.sendStatus(200);
  });

  async function purgeCache(
    language: KKuTu.Game.Language,
    word: string
  ): Promise<void> {
    const caches = [];
    const first = await DB.Manager.createQueryBuilder(Manner[language], "c_m")
      .where("c_m.last = :first", { first: word[0] })
      .getOne();
    if (first !== null) {
      caches.push(first);
    }
    const last = await DB.Manager.createQueryBuilder(Manner[language], "c_m")
      .where("c_m.last = :last", { last: word[word.length - 1] })
      .getOne();
    if (last !== null) {
      caches.push(last);
    }
    if (language === KKuTu.Game.Language.Korean) {
      const first = await DB.Manager.createQueryBuilder(
        Manner.koNoInitial,
        "c_m"
      )
        .where("c_m.last = :first", { first: word[0] })
        .getOne();
      if (first !== null) {
        caches.push(first);
      }
      const last = await DB.Manager.createQueryBuilder(
        Manner.koNoInitial,
        "c_m"
      )
        .where("c_m.last = :last", { last: word[word.length - 1] })
        .getOne();
      if (last !== null) {
        caches.push(last);
      }
    }
    await DB.Manager.remove(caches);
  }
}

