import React from "react";

import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import { Nest } from "common/Nest";

export default class Administration extends React.PureComponent<
  Nest.Page.Props<"Administration">
> {
  public render() {
    return <article id="main"></article>;
  }
}
Bind(Administration);

