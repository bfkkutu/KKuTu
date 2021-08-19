const React = require("react");
const _L = require("./Language");

const MENU = [
  { key: "HOME", href: "/" },
  {
    key: "FEAT",
    sub: [
      { key: "PLAYTS", href: "https://opg.kr/" },
      { key: "KKTDN", href: "https://kkutu.xyz/" },
      { key: "OURKKT", href: "/" },
      {
        key: "IWANT",
        onclick: `
          alert(
            "제휴 관련 문의는 디스코드 베프#4867 또는 BF끄투 디스코드로 문의해 주세요."
          );`,
      },
    ],
  },
  {
    key: "DALDALSO",
    sub: [
      { key: "DALDALSO_MAIN", href: "https://daldal.so/" },
      { key: "DALDALSO_LIST", href: "https://kkutu.kr/" },
    ],
  },
];

const Menu = (_props) => {
  const menuList = [];
  const props = _props.props;
  const L = (e) => {
    return _L(props, e);
  };

  for (let i in MENU) {
    if (MENU[i].href)
      menuList.push(
        <button
          id={`menu-item-${MENU[i].key}`}
          className="menu-btn passiveBtn"
          href={MENU[i].href}
        >
          {L(MENU[i].key)}
        </button>
      );
    else if (MENU[i].onclick)
      menuList.push(
        <button
          id={`menu-item-${MENU[i].key}`}
          className="menu-btn passiveBtn"
          click={MENU[i].onclick}
        >
          {L(MENU[i].key)}
        </button>
      );
    else if (MENU[i].sub) {
      let subMenuList = [];
      for (let j in MENU[i].sub) {
        if (MENU[i].sub[j].onclick)
          subMenuList.push(
            <div
              className="menu-sub-btn passiveBtn"
              click={MENU[i].sub[j].onclick}
            >
              {L(MENU[i].sub[j].key)}
            </div>
          );
        else
          subMenuList.push(
            <div className="menu-sub-btn passiveBtn" href={MENU[i].sub[j].href}>
              {L(MENU[i].sub[j].key)}
            </div>
          );
      }
      menuList.push(
        <div id={`menu-item-${MENU[i].key}`} className="menu-btn passiveBtn">
          {L(MENU[i].key)}
          <div className="menu-sub-separator">{subMenuList}</div>
        </div>
      );
    }
  }
  return (
    <div className="Menu">
      {menuList}
      <div id="account">
        <span id="profile">
          {props.session.profile ? JSON.stringify(props.session.profile) : "{}"}
        </span>
        <div id="account-info" />
      </div>
    </div>
  );
};

const Expl = (text, width) => {
  if (!text) return <div></div>;
  return (
    <div className="expl" style={{ width: width ? width + "px" : "initial" }}>
      <h5>{text}</h5>
    </div>
  );
};

const FA = (id) => {
  return <i className={`fa fa-${id}`} />;
};

module.exports = { Menu, Expl, FA };
