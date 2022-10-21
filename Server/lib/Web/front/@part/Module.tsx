import React from "react";

import { Props } from "../ReactBootstrap";
import L from "../Language";

interface MenuItem {
  key: string;
  href?: string;
  sub?: MenuItem[];
  onClick?: React.MouseEventHandler<unknown>;
}

const MENU: MenuItem[] = [
  { key: "HOME", href: "/" },
  { key: "KKUTU3", href: "https://kkutu.kr" },
  { key: "KKUTU2", href: "https://free.kkutu.kr/" },
  {
    key: "DALDALSO",
    href: "https://daldal.so/",
  },
];

export const Menu = ({ props }: { props: Props }) => {
  const menuList = [];

  for (let item of MENU) {
    if (item.href)
      menuList.push(
        <button
          className="menu-btn"
          onClick={() => {
            if (item.href) location.href = item.href;
          }}
        >
          {L.render(item.key)}
        </button>
      );
    else if (item.sub) {
      let subMenuList = [];
      for (let subitem of item.sub) {
        if (!subitem) continue;
        if (subitem.onClick)
          subMenuList.push(
            <div className="menu-sub-btn" onClick={subitem.onClick}>
              {L.render(subitem.key)}
            </div>
          );
        else if (subitem.href)
          subMenuList.push(
            <div
              className="menu-sub-btn"
              onClick={() => {
                if (subitem.href) location.href = subitem.href;
              }}
            >
              {L.render(subitem.key)}
            </div>
          );
        else
          subMenuList.push(
            <div className="menu-sub-btn">{L.render(subitem.key)}</div>
          );
      }
      menuList.push(
        <div id={`menu-item-${item.key}`} className="menu-btn">
          {L.render(item.key)}
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
