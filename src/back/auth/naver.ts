import { Strategy } from "passport-naver";

import { AUTH_CONFIG } from "../utils/System";
import { AuthModule } from "../utils/LoginRoute";

interface Profile {
  id: string;
  displayName: string;
  _json: {
    profile_image: string;
  };
}

export const config = {
  strategy: Strategy,
  color: "#1EC800",
  image: "",
  fontColor: "#FFFFFF",
  vendor: "naver",
  displayName: "withNaver",
  useOAuthButtons: true,
};
export const options = {
  clientID: AUTH_CONFIG.naver.clientID,
  clientSecret: AUTH_CONFIG.naver.clientSecret,
  callbackURL: AUTH_CONFIG.naver.callbackURL,
  passReqToCallback: true,
};
export const createProfile: AuthModule["createProfile"] = (
  profile: Profile
) => ({
  authType: config.vendor,
  id: profile.id,
  name: profile.displayName,
  title: profile.displayName,
  image: profile._json.profile_image,
  exordial: "",
});
