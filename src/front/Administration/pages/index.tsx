import React from "react";

import L from "front/@global/Language";

export default function Main() {
  // TODO: 전체 공지 등 메인 페이지
  return (
    <article className="page-main">
      <p>{L.get("welcome")}</p>
    </article>
  );
}
