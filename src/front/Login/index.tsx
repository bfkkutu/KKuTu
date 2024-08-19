import React from "react";
import { useLexicon } from "@daldalso/i18n";

import lCommon from "front/@global/languages/l.common";
import lLogin from "front/@global/languages/l.login";
import Bind from "front/ReactBootstrap";
import type { Nest } from "common/Nest";

export default function Login(props: Nest.Page.Props<"Login">) {
  const { l } = useLexicon(lCommon, lLogin);

  return (
    <article id="main">
      <div className="login-with">{l("loginWith")}</div>
      <a href="/">
        <button type="button" id="portal" />
      </a>
      {props.data.loginMethods.map((config) =>
        config.useOAuthButtons ? (
          <a href={`/login/${config.vendor}`}>
            <div
              className={`lbtn lbtn-${config.vendor}`}
              style={{ marginLeft: Math.max(0, window.innerWidth * 0.5 - 157) }}
            >
              <i className="logo" />
              <a className="label">{l("with", config.vendor)}</a>
            </div>
          </a>
        ) : (
          <a href={`/login/${config.vendor}`}>
            <button
              type="button"
              id={config.vendor}
              style={{
                color: config.fontColor,
                backgroundColor: config.color,
              }}
            >
              {l("with", config.vendor)}
            </button>
          </a>
        )
      )}
      <div className="login-legal">
        로그인이 이루어지면 BFKKuTu가 공지하는{" "}
        <a href="/docs/service_terms" target="_blank">
          {l("serviceTerms")}
        </a>{" "}
        및{" "}
        <a href="/docs/privacy_policy" target="_blank">
          {l("privacyPolicy")}
        </a>
        에 동의하는 것으로 간주합니다.
      </div>
      <link rel="stylesheet" href="/libs/oauth-buttons/oauth-buttons.min.css" />
      <script src="/libs/oauth-buttons/oauth-buttons.min.js" />
    </article>
  );
}
Bind(Login);

