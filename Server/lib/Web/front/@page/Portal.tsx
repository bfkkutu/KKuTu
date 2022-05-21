import React, { PureComponent } from "react";

import Icon from "../@block/Icon";
import Expl from "../@block/Expl";
import Bind, { Props } from "../ReactBootstrap";
import L from "../Language";

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

interface State {
  profile: any;
  list: any[];
  isRefreshing: boolean;
  isListInitialized: boolean;
  sum: number;

  windowWidth: number;
  windowHeight?: number;
}

export default class Portal extends PureComponent<Props, State> {
  state: State = {
    profile: {},
    list: [],
    isRefreshing: true,
    isListInitialized: false,
    sum: 0,

    windowWidth: window.innerWidth,
  };
  componentDidMount() {
    this.seekServers = this.seekServers.bind(this);
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    this.setState({ profile: this.props.session.profile || {} });
    window.addEventListener("resize", () => {
      this.setState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    });
    setInterval(() => {
      if (this.state.isRefreshing)
        return alert(this.props.locale["serverWait"]);
      this.setState({ isRefreshing: true });
      setTimeout(this.seekServers, 1000);
    }, 60000);
    this.seekServers();
  }
  async seekServers() {
    const { list } = await (await fetch("/servers")).json();
    this.setState({
      list,
      sum: list.reduce((partialSum: number, i: number) => partialSum + i, 0),
      isRefreshing: false,
      isListInitialized: true,
    });
  }
  render() {
    return (
      <article
        id="Middle"
        style={{
          marginLeft: Math.max(0, this.state.windowWidth * 0.5 - 500),
        }}
      >
        <div className="flex">
          <img
            id="logo"
            src="https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/kkutu/short_logo.png"
            alt="Logo"
          />
          <div id="start-button">
            <button
              id="game-start"
              onClick={() => {
                if (!this.state.profile) return (location.href = "/?server=0");
                for (let i = 0.9; i < 1; i += 0.01)
                  for (let j in this.state.list)
                    if (this.state.list[j] < i * 100)
                      return (location.href = `/?server=${j}`);
              }}
              disabled={!this.state.isListInitialized}
            >
              {L("gameStart")}
            </button>
          </div>
        </div>
        <div
          className="flex"
          style={{
            width: "100%",
          }}
        >
          <div
            className="flex"
            style={{
              width: "100%",
            }}
          >
            <a
              className="p_button daldalso"
              target="_blank"
              href="http://daldal.so/"
            >
              달달소
            </a>
            <a
              className="p_button cafe"
              target="_blank"
              href="http://cafe.bfkkutu.ze.am/"
            >
              네이버 카페
            </a>
            <a
              className="p_button discord"
              target="_blank"
              href="http://discord.gg/scPVHcE"
            >
              디스코드
            </a>
          </div>
          <div className="flex server-list-wrapper">
            <div className="server-list-box">
              <h3 className="server-list-title">
                <div id="server-list-refresh-container">
                  <a
                    id="server-refresh"
                    onClick={() => {
                      if (this.state.isRefreshing)
                        return alert(L("serverWait"));
                      this.setState({ isRefreshing: true });
                      setTimeout(this.seekServers, 1000);
                    }}
                  >
                    <Icon
                      name="refresh"
                      className={this.state.isRefreshing ? "fa-spin" : ""}
                    />
                    <Expl text={L("serverRefresh")} />
                  </a>
                  <label className="inline-flex">{L("serverList")}</label>
                </div>
                <label id="server-total">
                  &nbsp;{L("TOTAL")} {this.state.sum}
                  {L("MN")}
                </label>
              </h3>
              <div id="server-list">
                {this.state.list.map((v, i) => {
                  let status = v === null ? "x" : "o";
                  const people = status == "x" ? "-" : v + " / " + 100;
                  const limp = (v / 100) * 100;

                  if (status == "o")
                    if (limp >= 99) status = "q";
                    else if (limp >= 90) status = "p";
                  return (
                    <div
                      className="server"
                      onClick={() => {
                        if (status != "x") location.href = `/?server=${i}`;
                      }}
                    >
                      <div className={`server-status ss-${status}`} />
                      <div className="server-name">{L(`server_${i}`)}</div>
                      <div className="server-people graph">
                        <div
                          className="graph-bar"
                          style={{ width: `${limp}%` }}
                        />
                        <label>{people}</label>
                      </div>
                      <div className="server-enter">
                        {status == "x" ? "-" : L("serverEnter")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="iframe-container">
          <iframe id="kkutu-bulletin" src="/kkutu_bulletin.html" />
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "728px", height: "90px" }}
          data-ad-client="ca-pub-6336614061281577"
          data-ad-slot="5588160330"
        />
      </article>
    );
  }
}
Bind(Portal);
