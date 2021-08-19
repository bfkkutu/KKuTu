const React = require("react");

const Header = require("../components/Header");
const _L = require("../components/Language");

const Login = (props) => {
  const L = (e) => {
    return _L(props, e);
  };
  let loginBtns = [];
  for (let i in props.loginList) {
    if (props.loginList[i].useOAuthButtons)
      loginBtns.push(
        <div className={`lbtn lbtn-${props.loginList[i].vendor}`}>
          <i className="logo" />
          <a className="label" href={`/login/${props.loginList[i].vendor}`}>
            {L(props.loginList[i].displayName)}
          </a>
        </div>
      );
    else
      loginBtns.push(
        <a href={`/login/${props.loginList[i].vendor}`}>
          <button
            id={props.loginList[i].vendor}
            style={{
              color: props.loginList[i].fontColor,
              backgroundColor: props.loginList[i].color,
            }}
          >
            {L(props.loginList[i].displayName)}
          </button>
        </a>
      );
  }
  return (
    <html>
      <Header kind="login" title="BF끄투 - 로그인" />
      <body>
        <article id="main">
          <span id="locale">{JSON.stringify(props.locale)}</span>
          <div className="login-with">
            {props.text ? L(props.text) : L("loginWith")}
          </div>
          <a href="/">
            <button id="portal" />
          </a>
          {loginBtns}
          <div className="login-legal">{L("loginLegal")}</div>
        </article>
      </body>
    </html>
  );
};

module.exports = Login;
