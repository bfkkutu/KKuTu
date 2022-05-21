import React, { PureComponent } from "react";
import ReactLoading from "react-loading";

import Jungle from "../@part/Jungle";

export default class Loading extends PureComponent {
  render() {
    return (
      <>
        <Jungle />
        <article id="loading">
          <div id="loading-wrapper">
            <ReactLoading type="spin" color="#FFF" />
            <h2 className="loading-text">불러오는 중...</h2>
          </div>
        </article>
      </>
    );
  }
}
