const ReactHTMLParser = require("react-html-parser").default;

const L = (props, id) => {
  let R = props.locale[id] || "(L#" + id + ")";

  R = R.toString();
  for (let i = 1; arguments[i]; i++)
    R = R.replace(new RegExp("{V" + i + "}", "g"), arguments[i]);
  return ReactHTMLParser(R.replace(/FA\{[^\}]+\}/g, _L_Replace));
};

/*const _L_Replace = (seq) => {
  return <i class={`fa fa-${seq.slice(3, seq.length - 1)}`}></i>;
};*/

function _L_Replace(seq) {
  return "<i class='fa fa-" + seq.slice(3, seq.length - 1) + "'></i>";
}

module.exports = L;
