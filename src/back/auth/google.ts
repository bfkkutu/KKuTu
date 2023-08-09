import { Strategy } from "passport-google-oauth2";

import { AUTH_CONFIG } from "back/utils/System";
import { AuthModule } from "back/utils/LoginRoute";

interface ProfilePhoto {
  value: string;
}
interface Profile {
  id: string;
  name: {
    familyName: string;
    givenName: string;
  };
  nickname: string;
  photos: ProfilePhoto[];
}

export const config = {
  strategy: Strategy,
  color: "#FFFFFF",
  image: "",
  fontColor: "#000000",
  vendor: "google",
  displayName: "withGoogle",
  useOAuthButtons: true,
};
export const options = {
  clientID: AUTH_CONFIG.google.clientID,
  clientSecret: AUTH_CONFIG.google.clientSecret,
  callbackURL: AUTH_CONFIG.google.callbackURL,
  passReqToCallback: true,
  scope: [
    "profile",
    "email" /*, 'https://www.googleapis.com/auth/plus.login'*/,
  ],
};
export const createProfile: AuthModule["createProfile"] = (
  profile: Profile
) => ({
  authType: config.vendor,
  id: profile.id,
  name:
    (profile.name.familyName != "" ? profile.name.familyName + " " : "") +
    profile.name.givenName,
  title: profile.nickname,
  image: profile.photos[0].value,
  exordial: "",
});
