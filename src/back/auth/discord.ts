import { Strategy } from "passport-discord";

import { AUTH_CONFIG } from "back/utils/System";
import { AuthModule } from "back/utils/LoginRoute";

interface Profile {
  id: string;
  username: string;
  avatar: string;
}

export const config = {
  strategy: Strategy,
  color: "#7289DA",
  fontColor: "#FFFFFF",
  vendor: "discord",
  displayName: "withDiscord",
  useOAuthButtons: true,
};
export const options = {
  clientID: AUTH_CONFIG.discord.clientID,
  clientSecret: AUTH_CONFIG.discord.clientSecret,
  callbackURL: AUTH_CONFIG.discord.callbackURL,
  passReqToCallback: true,
  scope: "identify",
};
export const createProfile: AuthModule["createProfile"] = (
  profile: Profile
) => ({
  authType: config.vendor,
  id: `${config.vendor}-${profile.id}`,
  name: profile.username,
  title: profile.username,
  image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
  exordial: "",
});
