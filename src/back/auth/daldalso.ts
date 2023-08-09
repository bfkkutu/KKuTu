import { Strategy } from "passport-daldalso";

import { AUTH_CONFIG } from "back/utils/System";
import { AuthModule } from "back/utils/LoginRoute";

interface Profile {
  id: string;
  name: string;
  profile: {
    image: string;
    text: string;
  };
}

export const config = {
  strategy: Strategy,
  color: "#0F132F",
  image: "https://daldal.so/media/images/oauth-button.png",
  fontColor: "#FFFFFF",
  vendor: "daldalso",
  displayName: "withDaldalso",
  useOAuthButtons: true,
};
export const options = {
  clientID: AUTH_CONFIG.daldalso.clientID,
  clientSecret: AUTH_CONFIG.daldalso.clientSecret,
  callbackURL: AUTH_CONFIG.daldalso.callbackURL,
  passReqToCallback: true,
};
export const createProfile: AuthModule["createProfile"] = ({
  id,
  name,
  profile,
}: Profile) => ({
  authType: config.vendor,
  id,
  name,
  title: name,
  image:
    profile && profile.image
      ? profile.image == "https://daldal.so/anonymous.png"
        ? "https://daldal.so/media/images/anonymous.png"
        : profile.image
      : "https://daldal.so/media/images/anonymous.png",
  exordial: profile && profile.text ? profile.text : "",
});
