import React from "react";

import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import { Nest } from "common/Nest";

interface State {
  loginButtons: React.ReactNode[];
}

export default class Login extends React.PureComponent<
  Nest.Page.Props<"Login">,
  State
> {
  public state: State = { loginButtons: [] };
  public componentDidMount() {
    const loginButtons: React.ReactNode[] = [];
    for (const config of this.props.data.loginMethods)
      if (config.useOAuthButtons) {
        loginButtons.push(
          <a href={`/login/${config.vendor}`}>
            <div
              className={`lbtn lbtn-${config.vendor}`}
              style={{ marginLeft: Math.max(0, window.innerWidth * 0.5 - 157) }}
            >
              <i className="logo" />
              <a className="label">{L.render(config.displayName)}</a>
            </div>
          </a>
        );
      } else {
        loginButtons.push(
          <a href={`/login/${config.vendor}`}>
            <button
              type="button"
              id={config.vendor}
              style={{
                color: config.fontColor,
                backgroundColor: config.color,
              }}
            >
              {L.render(config.displayName)}
            </button>
          </a>
        );
      }
    this.setState({ loginButtons });
  }
  public render() {
    return (
      <article id="main">
        <div className="login-with">{L.render("loginWith")}</div>
        <a href="/">
          <button type="button" id="portal" />
        </a>
        {this.state.loginButtons}
        <div className="login-legal">
          로그인이 이루어지면 BFKKuTu가 공지하는{" "}
          <a href="/docs/service_terms" target="_blank">
            {L.get("serviceTerms")}
          </a>{" "}
          및{" "}
          <a href="/docs/privacy_policy" target="_blank">
            {L.get("privacyPolicy")}
          </a>
          에 동의하는 것으로 간주합니다.
        </div>
        <link
          rel="stylesheet"
          href="/libs/oauth-buttons/oauth-buttons.min.css"
        />
        <script src="/libs/oauth-buttons/oauth-buttons.min.js" />
      </article>
    );
  }
}
Bind(Login);
