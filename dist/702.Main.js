"use strict";
exports.id = 702;
exports.ids = [702];
exports.modules = {

/***/ 5702:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.createProfile = exports.options = exports.config = void 0;
const passport_discord_1 = __webpack_require__(7135);
const System_1 = __webpack_require__(8555);
exports.config = {
    strategy: passport_discord_1.Strategy,
    color: "#7289DA",
    fontColor: "#FFFFFF",
    vendor: "discord",
    displayName: "withDiscord",
    useOAuthButtons: true,
};
exports.options = {
    clientID: System_1.AUTH_CONFIG.discord.clientID,
    clientSecret: System_1.AUTH_CONFIG.discord.clientSecret,
    callbackURL: System_1.AUTH_CONFIG.discord.callbackURL,
    passReqToCallback: true,
    scope: "identify",
};
const createProfile = (profile) => ({
    authType: exports.config.vendor,
    id: `${exports.config.vendor}-${profile.id}`,
    name: profile.username,
    title: profile.username,
    image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
    exordial: "",
});
exports.createProfile = createProfile;


/***/ })

};
;