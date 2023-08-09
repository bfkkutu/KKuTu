import Express from "express";

import { loadLanguages } from "back/utils/Language";
import { PageBuilder } from "back/utils/ReactNest";
import { getLoginMethods } from "back/utils/LoginRoute";
import Channel from "back/game/Channel";
import { SETTINGS } from "back/utils/System";

export default function (App: Express.Application): void {
  App.get("/", PageBuilder("Portal"));
  App.get("/game/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.sendStatus(400);
    return PageBuilder("Game", {
      wsUrl: `${SETTINGS.secure.ssl ? "wss" : "ws"}://${req.hostname}:${
        SETTINGS.ports.channel[id]
      }`,
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
