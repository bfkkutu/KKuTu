const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-discord').Strategy,
    color: '#7289DA',
    fontColor: '#FFFFFF',
    vendor: 'discord',
    displayName: 'withDiscord'
	//authImage: '/img/auth/discord.png'
}
module.exports.strategyConfig = {
    clientID: config.discord.clientID,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.discord.callbackURL,
    passReqToCallback: true,
    scope: "identify"
}

module.exports.strategy = (strategyProcess, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};
        // var fullname = profile.username+"#"+profile.discriminator;
		
		$p.authType = "discord";
		$p.id = $p.authType+"-"+profile.id;
		$p.name = profile.username;
		$p.title = profile.username;
		$p.image = profile.avatar;
        strategyProcess(req, accessToken, MainDB, $p, done);
    }
}