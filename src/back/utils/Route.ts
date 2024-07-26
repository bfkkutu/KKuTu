import Express from "express";

import { loadLanguages } from "back/utils/Language";
import { PageBuilder } from "back/utils/ReactNest";
import { getLoginMethods } from "back/utils/LoginRoute";
import Channel from "back/game/Channel";
import { PACKAGE, SETTINGS } from "back/utils/System";
import DB from "back/utils/Database";
import { Database } from "../../common/Database";
import { KKuTu } from "../../common/KKuTu";
import API from "common/API";

import User from "back/models/User";
import Word from "back/models/Word";
import Mean from "back/models/Mean";

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
  App.get("/servers", (req, res) =>
    res.send({
      list: Channel.instances.map((v) => v.getActiveUserCount()),
      max: SETTINGS.max[0],
    })
  );
  App.get("//servers", (req, res) => res.redirect("/servers"));

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

      if (user.departures === Database.Departure.None) {
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
      } catch (e) {
        console.log(e);
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    }
  );
  App.get("/admin/load-languages", (req, res) => {
    loadLanguages();
    return res.sendStatus(200);
  });
}

