const React = require("react");

const Jungle = require("../components/Jungle");
const Header = require("../components/Header");
const Top = require("../components/Top");
const Footer = require("../components/Footer");
const { Expl, FA, GoogleAdvertisement } = require("../components/Module");
const _L = require("../components/Language");

const Portal = (props) => {
  const L = (e) => {
    return _L(props, e);
  };
  return (
    <html lang="ko_KR">
      <head>
        <noscript>
          <h1>You can't play BFKKuTu without JavaScript.</h1>
        </noscript>
        <Header kind="portal" title="새로운 끄투의 시작, BF끄투" />
      </head>
      <Jungle props={props} />
      <body>
        <Top kind="portal" props={props} />
        <article
          id="Middle"
          style={{
            marginTop: "80px",
          }}
        >
          <div className="flex">
            <img
              id="logo"
              src="https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/kkutu/short_logo.png"
              alt="Logo"
            />
            <div id="start-button">
              <button id="game-start" disabled>
                {L("gameStart")}
              </button>
            </div>
          </div>
          <div className="flex" style={{ width: "100%" }}>
            <div className="flex" style={{ width: "100%", height: "0px" }}>
              <a
                className="p_button daldalso"
                target="_blank"
                href="http://daldal.so/"
              >
                달달소
              </a>
              <a
                className="p_button cafe"
                target="_blank"
                href="http://cafe.bfkkutu.ze.am/"
              >
                네이버 카페
              </a>
              <a
                className="p_button discord"
                target="_blank"
                href="http://discord.gg/scPVHcE"
              >
                디스코드
              </a>
            </div>
            <div className="flex" style={{ borderRadius: "10px" }}>
              <div className="server-list-box">
                <h3 className="server-list-title">
                  <div id="server-list-refresh-container">
                    <a id="server-refresh">
                      <FA id="refresh" />
                      <Expl text={L("serverRefresh")} />
                    </a>
                    <label className="inline-flex">{L("serverList")}</label>
                  </div>
                  <label id="server-total" />
                </h3>
                <div id="server-list" />
              </div>
            </div>
          </div>
          <div className="iframe-container">
            <iframe id="kkutu-bulletin" src="/kkutu_bulletin.html" />
          </div>
        </article>
        <div id="Bottom">
          <GoogleAdvertisement props={props} />
        </div>
        <Footer props={props} />
      </body>
    </html>
  );
};

module.exports = Portal;
