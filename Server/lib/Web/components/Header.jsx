const React = require("react");

const Header = (props) => {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <meta name="description" content="새로운 끄투의 시작, BF끄투!" />
      <meta
        name="keywords"
        content="끄투, 끝말잇기, 쿵쿵따, 그림퀴즈, 자음퀴즈, 초성퀴즈, 십자말풀이, 타자, 앞말잇기"
      />
      <meta
        property="og:image"
        content="https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/kkutu/logo.png"
      />
      <meta property="og:url" content="https://bfkkutu.kr/" />
      <meta property="og:title" content="새로운 끄투의 시작, BF끄투!" />
      <meta
        property="og:description"
        content="끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
      />
      <script
        src="https://unpkg.com/react@17/umd/react.development.js"
        crossOrigin="true"
      ></script>
      <script
        src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"
        crossOrigin="true"
      ></script>
      <script
        type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/js/checkBrowser.js"
      />
      <link rel="stylesheet" href={`/css/style.css`} />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/css/fa.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/css/expl.css"
      />
      <link rel="stylesheet" href="/css/in_game_kkutu.css" />
      <link rel="stylesheet" href={`/css/in_${props.kind}.css`} />
      {props.kind == "login" ? (
        <link rel="stylesheet" href="/css/oauth-buttons.min.css" />
      ) : (
        ""
      )}
      {props.kind == "login" ? <script src="/js/oauth-buttons.min.js" /> : ""}
      <span id="explSize" />
      <title>{props.title}</title>
    </head>
  );
};

module.exports = Header;
