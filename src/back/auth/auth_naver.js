const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-naver').Strategy,
    color: '#1EC800',
	image: '',
    fontColor: '#FFFFFF',
    vendor: 'naver',
    displayName: 'withNaver',
	useOAuthButtons: true
	//authImage: '/img/auth/naver.png'
}
module.exports.strategyConfig = {
    clientID: config.naver.clientID, // 보안을 위해서입니다.
    clientSecret: config.naver.clientSecret, // 이 방법을 사용하는 것을
    callbackURL: config.naver.callbackURL, // 적극 권장합니다.
    passReqToCallback: true
}

module.exports.strategy = (strategyProcess, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};
		
		$p.authType = "naver";
		$p.id = profile.id;
		$p.name = profile.displayName;
		$p.title = profile.displayName;
		$p.image = profile._json.profile_image;
		strategyProcess(req, accessToken, MainDB, $p, done);
    }
}