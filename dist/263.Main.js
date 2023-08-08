"use strict";
exports.id = 263;
exports.ids = [263];
exports.modules = {

/***/ 4263:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.createProfile = exports.options = exports.config = void 0;
const passport_line_1 = __webpack_require__(419);
const System_1 = __webpack_require__(8555);
exports.config = {
    strategy: passport_line_1.Strategy,
    color: "#1EC800",
    image: "",
    fontColor: "#FFFFFF",
    vendor: "line",
    displayName: "withLine",
    useOAuthButtons: false,
};
exports.options = {
    clientID: System_1.AUTH_CONFIG.line.clientID,
    clientSecret: System_1.AUTH_CONFIG.line.clientSecret,
    callbackURL: System_1.AUTH_CONFIG.line.callbackURL,
    passReqToCallback: true,
};
const createProfile = (profile) => ({
    authType: exports.config.vendor,
    id: `${exports.config.vendor}-${profile.id}`,
    name: profile.displayName,
    title: profile.displayName,
    image: profile.avatar,
    exordial: "",
});
exports.createProfile = createProfile;


/***/ })

};
;