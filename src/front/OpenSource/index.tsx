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
        <h2>{L.get("dependencies")}</h2>
        <section>
          {this.props.data.dependencies.map(([name, version], index) => (
            <div key={index} className="dependency">
              <div className="name ellipse">{name}</div>
              <div className="version">{version}</div>
            </div>
          ))}
        </section>
      </article>
    );
  }
}
Bind(OpenSource);

