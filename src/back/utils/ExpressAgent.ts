import Express from "express";
import CookieParser from "cookie-parser";

import { resolve, SETTINGS } from "./System";
import * as ReactNest from "./ReactNest";
import { getLocale } from "./Language";
import { send404 } from "./Utility";

export default function (App: Express.Application) {
  App.engine(
    "js",
    ReactNest.Engine as (
      path: string,
      options: object,
      callback: (e: any, rendered: string) => void
    ) => void
  );
  App.set("views", resolve("dist", "pages"));
  App.set("view engine", "js");
  App.use("/libs", Express.static(resolve("dist", "libs")), send404);
  App.use("/media", Express.static(resolve("dist", "media")), send404);
  App.use("/pages", Express.static(resolve("dist", "pages")), send404);
  App.use("/strings", Express.static(resolve("dist", "strings")), send404);
  App.use("/constants.js", (req, res) =>
    res.sendFile(resolve("dist", "constants.js"))
  );
  App.use("/favicon.ico", (req, res) =>
    res.sendFile(resolve("dist", "favicon.ico"))
  );
  App.use(Express.json({ limit: "10MB" }));
  App.use(CookieParser(SETTINGS.cookie.secret) as Express.RequestHandler);
  App.use((req, res, next) => {
    req.agentInfo = `${req.address} (${req.header("User-Agent")})`;
    req.locale = getLocale(req);
    res.metadata = {};
    res.removeCookie = responseRemoveCookie;
    res.setCookie = responseSetCookie;
    res.header({
      "X-Frame-Options": "deny",
      "X-XSS-Protection": "1;mode=block",
    });
    next(null);
  });
}
function responseRemoveCookie(
  this: Express.Response,
  name: string,
  path: string = "/"
): Express.Response {
  return this.clearCookie(name, {
    path: path,
  });
}
function responseSetCookie(
  this: Express.Response,
  name: string,
  value: any,
  path: string = "/"
): Express.Response {
  return this.cookie(name, value, {
    path,
    maxAge: SETTINGS.cookie.age,
    secure: true,
  });
}
