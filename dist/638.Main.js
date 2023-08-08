"use strict";
exports.id = 638;
exports.ids = [638];
exports.modules = {

/***/ 6638:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.createProfile = exports.options = exports.config = void 0;
const passport_daldalso_1 = __webpack_require__(9983);
const System_1 = __webpack_require__(8555);
exports.config = {
    strategy: passport_daldalso_1.Strategy,
    color: "#0F132F",
    image: "https://daldal.so/media/images/oauth-button.png",
    fontColor: "#FFFFFF",
    vendor: "daldalso",
    displayName: "withDaldalso",
    useOAuthButtons: true,
};
exports.options = {
    clientID: System_1.AUTH_CONFIG.daldalso.clientID,
    clientSecret: System_1.AUTH_CONFIG.daldalso.clientSecret,
    callbackURL: System_1.AUTH_CONFIG.daldalso.callbackURL,
    passReqToCallback: true,
};
const createProfile = ({ id, name, profile, }) => ({
    authType: exports.config.vendor,
    id,
    name,
    title: name,
    image: profile && profile.image
        ? profile.image == "https://daldal.so/anonymous.png"
            ? "https://daldal.so/media/images/anonymous.png"
            : profile.image
        : "https://daldal.so/media/images/anonymous.png",
    exordial: profile && profile.text ? profile.text : "",
});
exports.createProfile = createProfile;


/***/ })

};
;