const React = require("react");

const Header = require("../components/Header");

const Unsupported = (props) => {
  return (
    <html>
      <Header kind="error" title="BF끄투 - 지원하지 않는 브라우저" />
      <body>
        <article id="main">
          <h1>400 Bad Request</h1>
          <label>지원하지 않는 브라우저입니다.</label>
          <p />
          <label>
            인터넷 익스플로러 등 구형 브라우저에서는 BF끄투를 플레이하실 수
            없습니다.
          </label>
          <p />
          <label>
            <a href="https://www.google.com/intl/ko/chrome">크롬</a> 또는{" "}
            <a href="https://www.microsoft.com/ko-kr/edge">엣지</a> 사용을
            권장합니다.
          </label>
        </article>
      </body>
    </html>
  );
};

module.exports = Unsupported;
