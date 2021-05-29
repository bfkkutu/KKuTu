const React = require("react");

const _L = require("../components/Language");

const Footer = (props) => {
  let L = (e) => {
    return _L(props.props, e);
  };
  return (
    <div id="Footer">
      <p />
      <div className="footer-left">
        <div>{L("copyright")}</div>
        <div>{L("GPL")}</div>
      </div>
      <div className="footer-right">
        <div>{L("allDocument")}</div>
        <div>{L("dictionarySupport")}</div>
      </div>
    </div>
  );
};

module.exports = Footer;
