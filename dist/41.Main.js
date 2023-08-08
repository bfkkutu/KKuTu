"use strict";
exports.id = 41;
exports.ids = [41];
exports.modules = {

/***/ 1041:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.createProfile = exports.options = exports.config = void 0;
const passport_naver_1 = __webpack_require__(9521);
const System_1 = __webpack_require__(8555);
exports.config = {
    strategy: passport_naver_1.Strategy,
    color: "#1EC800",
    image: "",
    fontColor: "#FFFFFF",
    vendor: "naver",
    displayName: "withNaver",
    useOAuthButtons: true,
};
exports.options = {
    clientID: System_1.AUTH_CONFIG.naver.clientID,
    clientSecret: System_1.AUTH_CONFIG.naver.clientSecret,
    callbackURL: System_1.AUTH_CONFIG.naver.callbackURL,
    passReqToCallback: true,
};
const createProfile = (profile) => ({
    authType: exports.config.vendor,
    id: profile.id,
    name: profile.displayName,
    title: profile.displayName,
    image: profile._json.profile_image,
    exordial: "",
});
exports.createProfile = createProfile;


/***/ })

};
;