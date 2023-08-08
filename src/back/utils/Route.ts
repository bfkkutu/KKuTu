import Express from "express";

import { loadLanguages } from "back/utils/Language";
import { PageBuilder } from "back/utils/ReactNest";
import { getLoginMethods } from "back/utils/LoginRoute";

export default function (App: Express.Application): void {
  App.get("/", PageBuilder("Portal"));
  App.get("/login", (req, res, next) =>
    PageBuilder("Login", { loginMethods: getLoginMethods() })(req, res, next)
  );
  App.get("/admin/load-languages", (req, res) => {
    loadLanguages();
    res.sendStatus(200);
  });
}
