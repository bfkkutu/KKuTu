import React, { PureComponent } from "react";

import Expl from "../@block/Expl";
import { Menu } from "./Module";
import { Props } from "../ReactBootstrap";

interface State {
  notice: { [key: string]: any };
  isNoticeClosed: boolean;
}

export default class Header extends PureComponent<Props, State> {
  state: State = { notice: {}, isNoticeClosed: false };
  componentDidMount() {
    fetch(`/notice/${this.props.page}.html`)
      .then((res) => res.text())
      .then((text) => {
        this.setState({
          notice: { ...this.state.notice, [this.props.page]: text },
        });
      });
    fetch(`/notice/global.html`)
      .then((res) => res.text())
      .then((text) => {
        this.setState({ notice: { ...this.state.notice, global: text } });
      });
  }
  render() {
    return (
      <header>
        <Menu props={this.props} />
        {this.state.notice[this.props.page] ? (
          <div
            id="global-notice"
            style={{ display: this.state.isNoticeClosed ? "none" : "block" }}
            onClick={() => {
              this.setState({ isNoticeClosed: true });
            }}
          >
            <div
              id="gn-content"
              dangerouslySetInnerHTML={{
                __html:
                  this.state.notice[this.props.page] ||
                  this.state.notice["global"],
              }}
            />
            <Expl text="클릭하여 닫기" />
          </div>
        ) : null}
      </header>
    );
  }
}
