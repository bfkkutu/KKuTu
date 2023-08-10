import { Strategy } from "passport-line";

import { AUTH_CONFIG } from "back/utils/System";
import { AuthModule } from "back/utils/LoginRoute";

interface Profile {
  id: string;
  displayName: string;
  avatar: string;
}

export const config = {
  strategy: Strategy,
  color: "#1EC800",
  image: "",
  fontColor: "#FFFFFF",
  vendor: "line",
  displayName: "withLine",
  useOAuthButtons: false,
};
export const options = {
  clientID: AUTH_CONFIG.line.clientID,
  clientSecret: AUTH_CONFIG.line.clientSecret,
  callbackURL: AUTH_CONFIG.line.callbackURL,
  passReqToCallback: true,
};
export const createProfile: AuthModule["createProfile"] = (
  profile: Profile
) => ({
  authType: config.vendor,
  id: `${config.vendor}-${profile.id}`,
  name: profile.displayName,
  title: profile.displayName,
  image: profile.avatar,
  exordial: "",
});
