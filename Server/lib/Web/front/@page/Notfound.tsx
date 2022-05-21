import React, { PureComponent } from "react";

import Bind from "../ReactBootstrap";

export default class NotFound extends PureComponent {
  render() {
    return (
      <article id="main">
        <h1>404 Not Found</h1>
      </article>
    );
  }
}
Bind(NotFound);
