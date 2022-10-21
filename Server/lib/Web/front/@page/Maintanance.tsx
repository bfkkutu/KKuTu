import React, { PureComponent } from "react";

import Bind from "../ReactBootstrap";

export default class Maintanance extends PureComponent {
  render() {
    return (
      <article id="maintanance">
        <div id="maintanance-wrapper">
          <h1>BF끄투는 현재 점검 중입니다.</h1>
          <h2>점검 일정은 다음과 같습니다.</h2>
          <ol>
            <li>22:30 일반 유저 접속 차단</li>
            <li>22:40 기존 데이터베이스 dump</li>
            <li>22:50 작업 시작</li>
          </ol>
          <div>
            점검 종료 일시는 정해지지 않았으며 가능한 한 빠르게 작업을 완료할 수
            있도록 하겠습니다.
          </div>
          <div>이용에 불편을 드려 죄송합니다.</div>
        </div>
      </article>
    );
  }
}
Bind(Maintanance);
