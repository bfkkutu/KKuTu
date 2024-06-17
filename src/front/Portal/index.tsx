import React from "react";

import { Icon } from "front/@block/Icon";
import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import { Nest } from "common/Nest";
import { Schema } from "common/Schema";

interface State {
  profile?: Schema.Profile;
  list: any[];
  isRefreshing: boolean;
  isListInitialized: boolean;
  sum: number;

  windowWidth: number;
  windowHeight?: number;
}

export default class Portal extends React.PureComponent<
  Nest.Page.Props<"Portal">,
  State
> {
  public state: State = {
    list: [],
    isRefreshing: true,
    isListInitialized: false,
    sum: 0,

    windowWidth: window.innerWidth,
  };
  public componentDidMount() {
    this.seekServers = this.seekServers.bind(this);
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    this.setState({ profile: this.props.session.profile });
    window.addEventListener("resize", () => {
      this.setState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    });
    setInterval(() => {
      if (this.state.isRefreshing) return alert(L.get("serverWait"));
      this.setState({ isRefreshing: true });
      setTimeout(this.seekServers, 1000);
    }, 60000);
    this.seekServers();
  }
  public async seekServers() {
    const { list } = await (await fetch("/servers")).json();
    if (list && list.length)
      this.setState({
        list,
        sum: list.reduce((partialSum: number, i: number) => partialSum + i, 0),
        isRefreshing: false,
        isListInitialized: true,
      });
  }
  public render() {
    return (
      <article
        id="main"
        style={{
          marginLeft: Math.max(0, this.state.windowWidth * 0.5 - 500),
        }}
      >
        <div className="flex">
          <img id="logo" src="/media/img/kkutu/short_logo.png" alt="Logo" />
          <div id="start-button">
            <button
              className="game-start"
              type="button"
              onClick={() => {
                if (this.state.profile === undefined)
                  return (location.href = "/game/0");
                for (let i = 0.9; i < 1; i += 0.01)
                  for (let j in this.state.list)
                    if (this.state.list[j] < i * 100)
                      return (location.href = `/game/${j}`);
              }}
              disabled={!this.state.isListInitialized}
            >
              {L.render("gameStart")}
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
              {L.get("daldalso")}
            </a>
            <a
              className="p_button discord"
              target="_blank"
              href="http://discord.gg/scPVHcE"
            >
              {L.get("discord")}
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
                        return alert(L.get("serverWait"));
                      this.setState({ isRefreshing: true });
                      setTimeout(this.seekServers, 1000);
                    }}
                  >
                    <Icon
                      name="refresh"
                      className={this.state.isRefreshing ? "fa-spin" : ""}
                    />
                  </a>
                  <label className="inline-flex">
                    {L.render("serverList")}
                  </label>
                </div>
                <label id="server-total">
                  &nbsp;
                  {L.get("total")} {L.get("unitPeople", this.state.sum)}
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
                        if (status != "x") location.href = `/game/${i}`;
                      }}
                    >
                      <div className={`server-status ss-${status}`} />
                      <div className="server-name">
                        {L.render(`server_${i}`)}
                      </div>
                      <div className="server-people graph">
                        <div
                          className="graph-bar"
                          style={{ width: `${limp}%` }}
                        />
                        <label>{people}</label>
                      </div>
                      <div className="server-enter">
                        {status == "x" ? "-" : L.render("serverEnter")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="iframe-container">
          <iframe id="kkutu-bulletin" src="/media/notice/bulletin.html" />
        </div>
        <ins
          className="adsbygoogle"
          data-ad-client={this.props.metadata!.ad.google.client}
          data-ad-slot={this.props.metadata!.ad.google.slot}
        />
      </article>
    );
  }
}
Bind(Portal);
