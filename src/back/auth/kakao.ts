import { Strategy } from "passport-kakao";

import { AUTH_CONFIG } from "back/utils/System";
import { AuthModule } from "back/utils/LoginRoute";

interface Profile {
  id: number;
  username: string;
  displayName: string;
  _json: {
    properties: {
      profile_image: string;
    };
  };
}

export const config = {
  strategy: Strategy,
  color: "#FFDE00",
  image: "",
  fontColor: "#3C1E1E",
  vendor: "kakao",
  displayName: "withKakao",
  useOAuthButtons: true,
};
export const options = {
  clientID: AUTH_CONFIG.kakao.clientID,
  clientSecret: AUTH_CONFIG.kakao.clientSecret,
  callbackURL: AUTH_CONFIG.kakao.callbackURL,
  passReqToCallback: true,
  scope: "profile",
};
export const createProfile: AuthModule["createProfile"] = (
  profile: Profile
) => ({
  authType: config.vendor,
  id: profile.id.toString(),
  name: profile.username,
  title: profile.displayName,
  image: profile._json.properties.profile_image,
  exordial: "",
});
