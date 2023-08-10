import Express from "express";

import { loadLanguages } from "back/utils/Language";
import { PageBuilder } from "back/utils/ReactNest";
import { getLoginMethods } from "back/utils/LoginRoute";
import Channel from "back/game/Channel";
import { SETTINGS } from "back/utils/System";
import DB from "back/utils/Database";

import User from "back/models/User";

export default function (App: Express.Application): void {
  App.get("/", PageBuilder("Portal"));
  App.get("/game/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.sendStatus(400);
    if (req.session.profile === undefined) {
      res.status(401);
      return res.redirect("/login");
    }
    if (
      (await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", { oid: req.session.profile.id })
        .getCount()) === 0
    )
      return res.redirect("/register");
    return PageBuilder("Game", {
      wsUrl: `${SETTINGS.secure.ssl ? "wss" : "ws"}://${
        SETTINGS.wsUrl || req.hostname
      }:${SETTINGS.ports.channel[id]}/?sid=${req.session.id}`,
    })(req, res, next);
  });
  App.get("/login", (req, res, next) =>
    PageBuilder("Login", { loginMethods: getLoginMethods() })(req, res, next)
  );
  App.get("/servers", (req, res) =>
    res.send({
      list: Channel.instances.map((v) => v.getActiveUserCount()),
      max: SETTINGS.max[0],
    })
  );
  App.get("/admin/load-languages", (req, res) => {
    loadLanguages();
    return res.sendStatus(200);
  });
}
