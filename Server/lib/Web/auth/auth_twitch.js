const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-twitch').Strategy,
    color: '#5C4EB0',
    fontColor: '#FFFFFF',
    vendor: 'twitch',
    displayName: 'withTwitch'
	//authImage: '/img/auth/twitch.png'
}

module.exports.strategyConfig = {
    clientID: config.twitch.clientID,
    clientSecret: config.twitch.clientSecret,
    callbackURL: config.twitch.callbackURL,
    passReqToCallback: true,
    scope: "user_read"
}

module.exports.strategy = (strategyProcess, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        // var fullname = profile.username+"#"+profile.discriminator;

        $p.authType = "twitch";
        $p.id = $p.authType+"-"+profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = profile.avatar;

        strategyProcess(req, accessToken, MainDB, $p, done);
    }
}