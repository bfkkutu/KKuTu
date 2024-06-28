import Express from "express";

import { loadLanguages } from "back/utils/Language";
import { PageBuilder } from "back/utils/ReactNest";
import { getLoginMethods } from "back/utils/LoginRoute";
import Channel from "back/game/Channel";
import { PACKAGE, SETTINGS } from "back/utils/System";
import DB from "back/utils/Database";

import User from "back/models/User";

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
    if (isNaN(id)) return res.sendStatus(400);

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

    return PageBuilder("Game", {
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
  App.get("/admin/load-languages", (req, res) => {
    loadLanguages();
    return res.sendStatus(200);
  });
}
