import React from "react";

import { Schema } from "common/Schema";
import L from "front/@global/Language";

interface Props {
  profile?: Schema.Profile;
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

export default class Header extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <header>
        <div id="menu">
          {Menu.map((item, index) => (
            <React.Fragment key={index}>
              <a className="menu-btn" {...item.props}>
                {L.render(item.key)}
              </a>
              {item.children.length !== 0 ? (
                <div id={`menu-item-${item.key}`} className="menu-btn">
                  {L.render(item.key)}
                  <div className="menu-sub-separator">
                    {item.children.map((item, index) => (
                      <a key={index} className="menu-btn" {...item.props}>
                        {L.render(item.key)}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          ))}
          <div
            id="account-info"
            onClick={async () => {
              if (this.props.profile === undefined) location.href = "/login";
              else if (await window.confirm(L.get("askLogout")))
                location.href = "/logout";
            }}
          >
            {this.props.profile ? this.props.profile.name : L.get("login")}
          </div>
        </div>
      </header>
    );
  }
}
