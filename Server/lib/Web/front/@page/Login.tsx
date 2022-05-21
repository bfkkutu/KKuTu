import React, { PureComponent } from "react";

import Jungle from "../@part/Jungle";
import Bind, { L } from "../ReactBootstrap";

interface Props {
  locale: any;
  loginList: any[];
  text: string;
}
interface State {
  loginBtns: React.ReactNode[];
}

export default class Login extends PureComponent<Props, State> {
  state: State = { loginBtns: [] };
  componentDidMount() {
    let loginBtns = [];
    for (let i in this.props.loginList) {
      if (this.props.loginList[i].useOAuthButtons)
        loginBtns.push(
          <a href={`/login/${this.props.loginList[i].vendor}`}>
            <div
              className={`lbtn lbtn-${this.props.loginList[i].vendor}`}
              style={{ marginLeft: Math.max(0, window.innerWidth * 0.5 - 157) }}
            >
              <i className="logo" />
              <a className="label">{L(this.props.loginList[i].displayName)}</a>
            </div>
          </a>
        );
      else
        loginBtns.push(
          <a href={`/login/${this.props.loginList[i].vendor}`}>
            <button
              id={this.props.loginList[i].vendor}
              style={{
                color: this.props.loginList[i].fontColor,
                backgroundColor: this.props.loginList[i].color,
              }}
            >
              {L(this.props.loginList[i].displayName)}
            </button>
          </a>
        );
    }
    this.setState({ loginBtns });
  }
  render() {
    return (
      <>
        <Jungle />
        <article id="main">
          <div className="login-with">
            {this.props.text ? L(this.props.text) : L("loginWith")}
          </div>
          <a href="/">
            <button id="portal" />
          </a>
          {this.state.loginBtns}
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
          <link rel="stylesheet" href="/css/oauth-buttons.min.css" />
          <script src="/js/oauth-buttons.min.js" />
        </article>
      </>
    );
  }
}
Bind(Login);
