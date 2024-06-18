import Express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";

import { setTable } from "front/@global/Language";
import { Root } from "front/ReactBootstrap";
import { getLanguageTable, L } from "back/utils/Language";
import { getProjectData, PACKAGE, SETTINGS } from "back/utils/System";
import { Nest } from "common/Nest";

const HTML_TEMPLATE = getProjectData("template.html").toString();

const READER_SSR = createReader("SSR");
const READER_NEST = /("?)\/\*\{(.+?)\}\*\/\1/g;

function createReader(key: string): RegExp {
  return new RegExp(`("?)/\\* %%${key}%% \\*/\\1`, "g");
}

/**
 * 주어진 페이지를 렌더하는 Express 끝점 클로저를 반환한다.
 *
 * @param page 페이지.
 * @param data 추가 정보.
 */
export function PageBuilder<T extends Nest.Page.Type>(
  page: T,
  data?: Nest.Page.DataTable[T]
): Express.RequestHandler {
  return async (req, res) => {
    res.render(page, {
      session: req.session,
      locale: req.locale,
      page,
      path: req.originalUrl,
      data,

      metadata: res.metadata,
    } as Nest.Page.Props<T>);
  };
}
/**
 * 주어진 파일에서 정의된 컴포넌트를 최상위 컴포넌트로 삼도록 한 HTML을 전달한다.
 *
 * HTML 내(JavaScript 포함)에서 `／*{...}*／` 구문은 이 함수 스코프 안에서 `eval(...)` 함수의 결과로 대체된다.
 *
 * @param path 뷰(React) 파일 경로.
 * @param $ Express 관련 추가 정보.
 * @param callback 콜백 함수.
 */
export function Engine<T extends Nest.Page.Type>(
  path: string,
  $: Nest.Page.Props<T>,
  callback: (err: any, content?: string) => void
): void {
  const mode = process.env["NODE_ENV"] || "development";
  const isProduction = mode === "production";
  const REACT_SUFFIX = isProduction ? "production.min" : "development";
  const KEY = `${$.locale}/${$.page}`;
  const SSR = $.ssr;
  const GOOGLE_ADS = isProduction
    ? `<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${
    $.metadata!.ad?.google.client
  }"
  crossorigin="anonymous"
></script>`
    : "";
  let Index: any;

  $.title = L(`${KEY}#title`, ...($.metadata?.titleArgs || []));
  $.version = PACKAGE["version"];
  $.mode = mode;
  // NOTE Express 내부적으로 정의한 정보가 외부에 노출되지 않도록 삭제
  delete ($ as any)["settings"];
  delete ($ as any)["cache"];
  delete ($ as any)["_locals"];

  const CLIENT_SETTINGS: Partial<Nest.ClientSettings> = {};
  if (SSR) {
    setTable(getLanguageTable($.locale, $.page));
    Index = require(`front/${$.page}/index.tsx`).default;
    Object.assign(
      Index["__CLIENT_SETTINGS"],
      SETTINGS.application,
      CLIENT_SETTINGS
    );
  }
  const HTML = HTML_TEMPLATE.replace(
    READER_SSR,
    SSR
      ? ReactDOMServer.renderToString(
          React.createElement(
            Root,
            $,
            React.createElement(require(`front/${$.page}/index.tsx`).default, $)
          )
        )
      : ""
  ).replace(READER_NEST, (v, p1, p2) => String(eval(p2)));
  callback(null, HTML);
}
