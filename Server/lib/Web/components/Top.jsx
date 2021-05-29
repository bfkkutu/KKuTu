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
  let props = _props.props;
  let document = _props.document;
  return (
    <div id="Top">
      <Menu props={props} document={document} />
      <div
        id="global-notice"
        onClick={(e) => {
          document.getElementById(e.currentTarget).style.display = "none";
        }}
      >
        <div id="gn-content">
          {_props.kind == "portal" ? Notice.portal : Notice.global}
        </div>
        <div>{Expl("클릭하여 닫기")}</div>
      </div>
    </div>
  );
};

module.exports = Top;
