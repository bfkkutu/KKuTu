const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-naver').Strategy, // example: naver, require strategy
    color: '#000000', // example: #1EC800
    fontColor: '#FFFFFF', //example: #FFFFFF
    vendor: '', // example: naver
    displayName: '네이버'
}

module.exports.strategyConfig = { // example: naver
    clientID: config.naver.clientID, // 보안을 위해서입니다.
    clientSecret: config.naver.clientSecret, // 이 방법을 사용하는 것을
    callbackURL: config.naver.callbackURL, // 적극 권장합니다.
    passReqToCallback: true /*,
    profileFields: ['id' ,'name' , 'gender', 'age_range', 'displayName'], -> require facebook
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/plus.login'], -> require google */
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.authType = "naver";
        $p.id = profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        if (!!profile._json.hasOwnProperty("profile_image")) $p.image = profile._json.profile_image;
        else $p.image = "https://img.lovepik.com/element/40081/3369.png_300.png";
		
        /* 망할 셧다운제
        $p._age = profile._json.age.split('-').map(Number);
        $p._age = { min: ($p._age[0] || 0) - 1, max: $p._age[1] - 1 };
        $p.birth = profile._json.birthday.split('-').map(Number);
        if(MONTH < $p.birth[0] || (MONTH == $p.birth[0] && DATE < $p.birth[1])){
            $p._age.min--;
            $p._age.max--;
        }
        $p.isAjae = Ajae($p.birth, $p._age);
        */
        // $p.sex = profile[0].gender[0];

        process(req, accessToken, MainDB, $p, done);
    } // example naver
}