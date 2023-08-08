"use strict";
exports.id = 301;
exports.ids = [301];
exports.modules = {

/***/ 4301:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.createProfile = exports.options = exports.config = void 0;
const passport_kakao_1 = __webpack_require__(9762);
const System_1 = __webpack_require__(8555);
exports.config = {
    strategy: passport_kakao_1.Strategy,
    color: "#FFDE00",
    image: "",
    fontColor: "#3C1E1E",
    vendor: "kakao",
    displayName: "withKakao",
    useOAuthButtons: true,
};
exports.options = {
    clientID: System_1.AUTH_CONFIG.kakao.clientID,
    clientSecret: System_1.AUTH_CONFIG.kakao.clientSecret,
    callbackURL: System_1.AUTH_CONFIG.kakao.callbackURL,
    passReqToCallback: true,
    scope: "profile",
};
const createProfile = (profile) => ({
    authType: exports.config.vendor,
    id: `${exports.config.vendor}-${profile.id}`,
    name: profile.username,
    title: profile.displayName,
    image: profile._json.properties.profile_image,
    exordial: "",
});
exports.createProfile = createProfile;


/***/ })

};
;