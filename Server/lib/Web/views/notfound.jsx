const React = require("react");

const Header = require("../components/Header");

const NotFound = (props) => {
  return (
    <html>
      <Header kind="error" title="BF끄투 - 404 Not Found" />
      <body>
        <article id="main">
          <h1>404 Not Found</h1>
        </article>
      </body>
    </html>
  );
};

module.exports = NotFound;
