import Express from "express";
import passport from "passport";
import Strategy from "passport-oauth2";

import { AUTH_CONFIG } from "back/utils/System";
import { Logger } from "back/utils/Logger";
import DB from "back/utils/Database";
import { PageBuilder } from "back/utils/ReactNest";
import { Schema } from "common/Schema";

import User from "back/models/User";

const strategyList = new Map<string, AuthModuleConfig>();

export interface AuthModuleConfig {
  strategy: typeof Strategy;
  color: HexColor;
  image: string;
  fontColor: HexColor;
  vendor: string;
  displayName: string;
  useOAuthButtons: boolean;
}
export interface AuthModule {
  config: AuthModuleConfig;
  options: Strategy.StrategyOptionsWithRequest;
  createProfile: (profile: any) => Schema.AuthProfile;
}

async function strategyProcess(
  req: Express.Request,
  token: string,
  _profile: Schema.AuthProfile,
  done: Strategy.VerifyCallback
) {
  const user = await DB.Manager.createQueryBuilder(User, "u")
    .where("u.oid = :oid", { oid: _profile.id })
    .getOne();
  if (user === null) return done(null, _profile);
  const profile: Schema.Profile = {
    ..._profile,
    token,
    sid: req.session.id,
    locale: user.settings.locale,
  };
  profile.name = profile.title = user.nickname;
  done(null, profile);
}

export function getLoginMethods(): AuthModuleConfig[] {
  return Array.from(strategyList.values());
}

export default async function LoginRoute(App: Express.Application) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj as any);
  });

  App.get("/register", async (req, res, next) => {
    if (req.session.profile === undefined) return res.sendStatus(400);
    if (
      (await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", { oid: req.session.profile.id })
        .getCount()) !== 0
    )
      return res.sendStatus(400);
    return PageBuilder("Register")(req, res, next);
  });
  App.post("/register", async (req, res) => {
    if (req.session.profile === undefined) return res.sendStatus(400);
    if (
      (await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", { oid: req.session.profile.id })
        .getCount()) !== 0
    )
      return res.sendStatus(400);
    if (
      (await DB.Manager.createQueryBuilder(User, "u")
        .where("u.nickname = :nickname", { nickname: req.body.nickname })
        .getCount()) !== 0
    )
      return res.sendStatus(409);
    const user = new User();
    user.oid = req.session.profile.id;
    user.image = req.session.profile.image;
    user.nickname = req.body.nickname;
    user.exordial = req.body.exordial;
    await DB.Manager.save(user);
    return res.sendStatus(200);
  });

  for (const vendor in AUTH_CONFIG)
    try {
      const { config, options, createProfile }: AuthModule = await import(
        `back/auth/${vendor}`
      );
      App.get(`/login/${vendor}`, passport.authenticate(vendor));
      App.get(`/login/${vendor}/callback`, (req, res, next) =>
        passport.authenticate(
          vendor,
          async (e: unknown, profile: Schema.Profile, _: never, __: never) => {
            if (e) return res.redirect("/login/fail");
            req.session.profile = profile;
            await req.session.save();
            return res.redirect(
              (await DB.Manager.createQueryBuilder(User, "u")
                .where("u.oid = :oid", { oid: profile.id })
                .getCount()) === 0
                ? "/register"
                : "/"
            );
          }
        )(req, res, next)
      );
      const strategy = new config.strategy(
        options,
        (
          req: Express.Request,
          accessToken: string,
          _: string,
          profile: any,
          done: Strategy.VerifyCallback
        ) => strategyProcess(req, accessToken, createProfile(profile), done)
      );
      passport.use(strategy);
      strategyList.set(vendor, config);
      Logger.info(`OAuth Strategy ${vendor} loaded successfully.`).out();
    } catch (e) {
      Logger.error(`OAuth Strategy ${vendor} is not loaded`).out();
      if (e instanceof Error) Logger.error(e.message).out();
    }

  App.get("/logout", (req, res) => {
    if (req.session.profile === undefined) return res.redirect("/");
    else req.session.destroy(() => res.redirect("/"));
  });
}
