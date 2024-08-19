import React from "react";
import { useLexicon } from "@daldalso/i18n";

import lOpensource from "front/@global/languages/l.opensource";
import Bind from "front/ReactBootstrap";
import type { Nest } from "common/Nest";

export default function OpenSource(props: Nest.Page.Props<"OpenSource">) {
  const { l } = useLexicon(lOpensource);

  return (
    <article id="main">
      <h2>{l("dependencies")}</h2>
      <section>
        {props.data.dependencies.map(([name, version], index) => (
          <div key={index} className="dependency">
            <div className="name ellipse">{name}</div>
            <div className="version">{version}</div>
          </div>
        ))}
      </section>
    </article>
  );
}
Bind(OpenSource);

