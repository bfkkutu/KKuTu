import Express from "express";
import passport from "passport";
import Strategy from "passport-oauth2";

import { AUTH_CONFIG } from "back/utils/System";
import { Logger } from "back/utils/Logger";
import DB from "back/utils/Database";

import User from "back/models/User";
import Session from "back/models/Session";

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
  createProfile: (profile: any) => Profile;
}
export interface Profile {
  authType: string;
  // 이 식별자는 인게임에서 사용하지 않는다.
  id: string;
  name: string;
  title: string;
  image: string;
  exordial: string;

  token?: string;
  sid?: string;
}

async function strategyProcess(
  req: Express.Request,
  accessToken: string,
  profile: Profile,
  done: Strategy.VerifyCallback
) {
  profile.token = accessToken;
  profile.sid = req.session.id;

  const now = Date.now();
  req.session.authType = profile.authType;
  const user =
    (await DB.Manager.createQueryBuilder(User, "u")
      .where("u.id == :id:", { id: profile.id })
      .getOne()) || new User();
  req.session.profile = profile;
  req.session.save();
  if (user.nickname === null) user.nickname = profile.name;
  const session =
    (await DB.Manager.createQueryBuilder(Session, "ses")
      .where("ses.id == :id:", { id: req.session.id })
      .getOne()) || new Session();
  session.profile = {
    authType: profile.authType,
    id: profile.id,
    nickname: user.nickname,
    exordial: user.exordial,
    image: profile.image,
    token: profile.token,
    sid: profile.sid,
  };
  session.createdAt = now;
  await DB.Manager.save(session);
  user.lastLogin = now;
  await DB.Manager.save(user);
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

  for (const vendor in AUTH_CONFIG)
    try {
      const { config, options, createProfile }: AuthModule = await import(
        `back/auth/${vendor}`
      );
      App.get(`/login/${vendor}`, passport.authenticate(vendor));
      App.get(
        `/login/${vendor}/callback`,
        passport.authenticate(vendor, {
          successRedirect: "/",
          failureRedirect: "/loginfail",
        })
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
    if (!req.session.profile) return res.redirect("/");
    else req.session.destroy(() => res.redirect("/"));
  });
}
