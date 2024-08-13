import React from "react";
import { useLexicon } from "@daldalso/i18n";

import lAdministration from "front/@global/languages/l.administration";

export default function Main() {
  const { l } = useLexicon(lAdministration);

  // TODO: 전체 공지 등 메인 페이지
  return (
    <article className="page-main">
      <p>{l("welcome")}</p>
    </article>
  );
}
