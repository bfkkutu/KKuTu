import React from "react";
import { useLexicon } from "@daldalso/i18n";

import lCommon from "front/@global/languages/l.common";
import { Schema } from "common/Schema";

interface MenuItem {
  key: any;
  props: {
    href: string;
  };
  children: MenuItem[];
}

const MENU: MenuItem[] = [
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

interface Props {
  profile?: Schema.Profile;
}
export default function Header(props: Props) {
  const { l } = useLexicon(lCommon);

  return (
    <header>
      <nav id="menu">
        {MENU.map((item, index) => (
          <React.Fragment key={index}>
            <a className="menu-btn" {...item.props}>
              {l(item.key)}
            </a>
            {item.children.length !== 0 ? (
              <div id={`menu-item-${item.key}`} className="menu-btn">
                {l(item.key)}
                <div className="menu-sub-separator">
                  {item.children.map((item, index) => (
                    <a key={index} className="menu-btn" {...item.props}>
                      {l(item.key)}
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
            if (props.profile === undefined) {
              location.href = "/login";
              return;
            }
            if (await window.confirm(l("askLogout"))) {
              location.href = "/logout";
            }
          }}
        >
          {props.profile === undefined ? l("login") : props.profile.name}
        </div>
      </nav>
    </header>
  );
}

