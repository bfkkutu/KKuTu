import React from "react";

import { Props } from "../ReactBootstrap";
import L from "../Language";

const MENU = [
  { key: "HOME", href: "/" },
  {
    key: "FEAT",
    sub: [
      { key: "PLAYTS", href: "https://opg.kr/" },
      { key: "OURKKT", href: "/" },
      {
        key: "IWANT",
        onClick: () => {
          alert(
            "제휴 관련 문의는 디스코드 베프#4867 또는 BF끄투 디스코드로 문의해 주세요."
          );
        },
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

export const Menu = ({ props }: { props: Props }) => {
  const menuList = [];

  for (let i in MENU) {
    if (MENU[i].href)
      menuList.push(
        <button
          className="menu-btn"
          onClick={() => {
            if (MENU[i].href) location.href = MENU[i].href;
          }}
        >
          {L.render(MENU[i].key)}
        </button>
      );
    else if (MENU[i].sub) {
      let subMenuList = [];
      for (let j in MENU[i].sub) {
        if (!MENU[i].sub[j]) continue;
        if (MENU[i].sub[j].onClick)
          subMenuList.push(
            <div className="menu-sub-btn" onClick={MENU[i].sub[j].onClick}>
              {L.render(MENU[i].sub[j].key)}
            </div>
          );
        else if (MENU[i].sub[j].href)
          subMenuList.push(
            <div
              className="menu-sub-btn"
              onClick={() => {
                location.href = MENU[i].sub[j].href;
              }}
            >
              {L.render(MENU[i].sub[j].key)}
            </div>
          );
        else
          subMenuList.push(
            <div className="menu-sub-btn">{L.render(MENU[i].sub[j].key)}</div>
          );
      }
      menuList.push(
        <div id={`menu-item-${MENU[i].key}`} className="menu-btn">
          {L.render(MENU[i].key)}
          <div className="menu-sub-separator">{subMenuList}</div>
        </div>
      );
    }
  }
  return (
    <div className="Menu">
      {menuList}
      <div id="account">
        <div
          id="account-info"
          onClick={() => {
            location.href =
              props.session.profile && confirm(L("ASK_LOGOUT"))
                ? "/logout"
                : "/login";
          }}
        >
          {props.session.profile
            ? props.session.profile.title || props.session.profile.name
            : L("LOGIN")}
        </div>
      </div>
    </div>
  );
};
