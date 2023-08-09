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
    console.log(this.props.data.loginMethods);
    for (const config of this.props.data.loginMethods) {
      if (config.useOAuthButtons)
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
      else
        loginButtons.push(
          <a href={`/login/${config.vendor}`}>
            <button
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
      <>
        <article id="main">
          <div className="login-with">{L.render("loginWith")}</div>
          <a href="/">
            <button id="portal" />
          </a>
          {this.state.loginButtons}
          <div className="login-legal">
            로그인이 이루어지면 BFKKuTu가 공지하는{" "}
            <a href="http://agreement.bfkkutu.ze.am" target="_blank">
              서비스 이용 약관
            </a>{" "}
            및{" "}
            <a href="http://privacy.bfkkutu.ze.am" target="_blank">
              개인정보 취급 방침
            </a>
            에 동의하는 것으로 간주 합니다.
          </div>
          <link
            rel="stylesheet"
            href="/libs/oauth-buttons/oauth-buttons.min.css"
          />
          <script src="/libs/oauth-buttons/oauth-buttons.min.js" />
        </article>
      </>
    );
  }
}
Bind(Login);