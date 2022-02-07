const React = require("react");
const ReactHTMLParser = require("react-html-parser").default;
const fs = require("fs");

const { Menu, Expl } = require("./Module");

const Notice = {
  portal: ReactHTMLParser(
    fs.readFileSync("./lib/Web/public/notice/portal.html", "utf8")
  ),
  global: ReactHTMLParser(
    fs.readFileSync("./lib/Web/public/notice/global.html", "utf8")
  ),
};

const Top = (_props) => {
  const props = _props.props;
  return (
    <div id="Top">
      <Menu props={props} />
      <div id="global-notice">
        <div id="gn-content">
          {_props.kind == "portal" ? Notice.portal : Notice.global}
        </div>
        <Expl text="클릭하여 닫기" />
      </div>
    </div>
  );
};

module.exports = Top;
