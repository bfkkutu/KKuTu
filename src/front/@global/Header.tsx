import React from "react";

import { Schema } from "common/Schema";
import L from "front/@global/Language";

interface Props {
  profile?: Schema.Profile;
}
interface State {
  menuNode: React.ReactNode[];
}

interface MenuItem {
  key: string;
  props: any;
  children: MenuItem[];
}

const Menu: MenuItem[] = [
  {
    key: "home",
    props: {
      href: "/",
    },
    children: [],
  },
  {
    key: "freeServerList",
    props: { href: "https://free.kkutu.kr/" },
    children: [],
  },
  {
    key: "daldalso",
    props: {
      href: "https://daldal.so/",
    },
    children: [],
  },
];
const menuNode: React.ReactNode[] = [];
for (const item of Menu) {
  menuNode.push(
    <a className="menu-btn" {...item.props}>
      {L.render(item.key)}
    </a>
  );
  if (item.children.length) {
    const subMenuNode: React.ReactNode[] = [];
    for (const subItem of item.children)
      subMenuNode.push(
        <a className="menu-btn" {...subItem.props}>
          {L.render(subItem.key)}
        </a>
      );
    menuNode.push(
      <div id={`menu-item-${item.key}`} className="menu-btn">
        {L.render(item.key)}
        <div className="menu-sub-separator">{subMenuNode}</div>
      </div>
    );
  }
}

export default class Header extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <header>
        <div id="menu">
          {menuNode}
          <div
            id="account-info"
            onClick={() => {
              if (this.props.profile === undefined) location.href = "/login";
              else if (confirm(L.get("askLogout"))) location.href = "/logout";
            }}
          >
            {this.props.profile ? this.props.profile.name : L.get("login")}
          </div>
        </div>
      </header>
    );
  }
}
