const config = require('../../sub/auth.json');



module.exports.config = {

    strategy: require('passport-youtube').Strategy,

    color: '#E74610',

    fontColor: '#FFFFFF',

    vendor: 'youtube',

    displayName: 'withYoutube'
	
	//authImage: '/img/auth/youtube.png'

}



module.exports.strategyConfig = {

    clientID: config.youtube.clientID, // 보안을 위해서입니다.

    clientSecret: config.youtube.clientSecret, // 이 방법을 사용하는 것을

    callbackURL: config.youtube.callbackURL, // 적극 권장합니다.

    passReqToCallback: true,

    scope: ['profile']

}



module.exports.strategy = (strategyProcess, MainDB, Ajae) => {

    return (req, accessToken, refreshToken, profile, done) => {

        const $p = {};



        $p.authType = "youtube";

        $p.id = profile.id;

        $p.name = (profile.name.familyName != '' ? profile.name.familyName + ' ' : '') + profile.name.givenName;
		
        $p.title = profile.nickname;
		
		$p.image = profile.photos[0].value;
		
		
        strategyProcess(req, accessToken, MainDB, $p, done);

    }

}