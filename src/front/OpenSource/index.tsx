import React from "react";

import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import { Nest } from "common/Nest";

export default class OpenSource extends React.PureComponent<
  Nest.Page.Props<"OpenSource">
> {
  public render() {
    return (
      <article id="main">
        <h2>BF끄투는 아래 오픈소스 소프트웨어에 의존하고 있습니다.</h2>
        <ul>
          {this.props.data.dependencies.map(([name, version], index) => (
            <li key={index}>
              {name} 버전 {version}
            </li>
          ))}
        </ul>
      </article>
    );
  }
}
Bind(OpenSource);
