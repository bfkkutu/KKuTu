const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-kakao').Strategy,
    color: '#FFDE00',
	image: '',
    fontColor: '#3C1E1E',
    vendor: 'kakao',
    displayName: 'withKakao',
	useOAuthButtons: true
	//authImage: '/img/auth/kakao.png'
}
module.exports.strategyConfig = {
    clientID: config.kakao.clientID, // 보안을 위해서입니다.
    callbackURL: config.kakao.callbackURL,  // 이 방법을 사용하는 것을
    passReqToCallback: true,  // 적극 권장합니다.
	scope: "profile"
}

module.exports.strategy = (strategyProcess, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.authType = "kakao";
        $p.id = $p.authType + profile.id.toString();
        $p.name = profile.username;
        $p.title = profile.displayName;
        $p.image = profile._json.properties.profile_image;
        strategyProcess(req, accessToken, MainDB, $p, done);
    }
}