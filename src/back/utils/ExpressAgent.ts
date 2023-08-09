import Express from "express";
import CookieParser from "cookie-parser";
import passport from "passport";

import { resolve, SETTINGS } from "back/utils/System";
import * as ReactNest from "back/utils/ReactNest";
import { getLocale } from "back/utils/Language";
import { send404 } from "back/utils/Middleware";
import { Logger, LogStyle } from "back/utils/Logger";
import { Profile } from "back/utils/LoginRoute";
import { sessionParser } from "back/utils/ExpressSession";

declare module "express-session" {
  interface SessionData {
    authType: string;
    profile?: Profile;
  }
}

export default function (App: Express.Application): void {
  // JJWAK 기본
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
  App.use((req, res, next) => {
    req.address = req.ip || req.ips.join();
    if (req.xhr) {
      Logger.log()
        .putS(LogStyle.METHOD, req.method)
        .putS(LogStyle.XHR, " XHR")
        .next("URL")
        .put(req.originalUrl)
        .next("Address")
        .put(req.address)
        .out();
    } else {
      Logger.log()
        .putS(LogStyle.METHOD, req.method)
        .next("URL")
        .put(req.originalUrl)
        .next("Address")
        .put(req.address)
        .out();
    }
    next();
  });
  App.use(sessionParser);
  App.use(passport.initialize());
  App.use(passport.session());
  /*App.use((req, res, next) => {
    if (req.session.passport) 
      delete req.session.passport;
    next();
  });*/
  App.use(Express.json({ limit: "1MB" }));
  App.use(CookieParser(SETTINGS.cookie.secret));
  App.use((req, res, next) => {
    req.agentInfo = `${req.address} (${req.header("User-Agent")})`;
    req.locale = getLocale(req);
    res.metadata = {
      ad: SETTINGS.advertisement,
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
    path: path,
    maxAge: SETTINGS.cookie.age,
    secure: true,
  });
}
