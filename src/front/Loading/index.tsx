import React from "react";
import { Oval } from "react-loader-spinner";

import Jungle from "../@part/Jungle";

export default class Loading extends React.PureComponent {
  render() {
    return (
      <>
        <Jungle />
        <article id="loading">
          <div id="loading-wrapper">
            <Oval
              height={80}
              width={80}
              color="#fff"
              ariaLabel="oval-loading"
              secondaryColor="#000"
              strokeWidth={3}
              strokeWidthSecondary={3}
              wrapperClass="spinner-wrapper"
              visible
            />
            <h2 className="loading-text">불러오는 중...</h2>
          </div>
        </article>
      </>
    );
  }
}
