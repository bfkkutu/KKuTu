"use strict";
exports.id = 896;
exports.ids = [896];
exports.modules = {

/***/ 9896:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.createProfile = exports.options = exports.config = void 0;
const passport_google_oauth2_1 = __webpack_require__(8117);
const System_1 = __webpack_require__(8555);
exports.config = {
    strategy: passport_google_oauth2_1.Strategy,
    color: "#FFFFFF",
    image: "",
    fontColor: "#000000",
    vendor: "google",
    displayName: "withGoogle",
    useOAuthButtons: true,
};
exports.options = {
    clientID: System_1.AUTH_CONFIG.google.clientID,
    clientSecret: System_1.AUTH_CONFIG.google.clientSecret,
    callbackURL: System_1.AUTH_CONFIG.google.callbackURL,
    passReqToCallback: true,
    scope: [
        "profile",
        "email" /*, 'https://www.googleapis.com/auth/plus.login'*/,
    ],
};
const createProfile = (profile) => ({
    authType: exports.config.vendor,
    id: profile.id,
    name: (profile.name.familyName != "" ? profile.name.familyName + " " : "") +
        profile.name.givenName,
    title: profile.nickname,
    image: profile.photos[0].value,
    exordial: "",
});
exports.createProfile = createProfile;


/***/ })

};
;