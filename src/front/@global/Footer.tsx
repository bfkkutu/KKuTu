import React from "react";

import L from "front/@global/Language";

export default class Footer extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <footer>
        <div className="left">
          <div>
            새로운 끄투의 시작, BF끄투 Copyright (C) 2018-2023 이승훈(
            <a target="_blank" href="mailto:op@lsh.sh">
              op@lsh.sh
            </a>
            )
          </div>
          <br />
          <div>
            이 프로그램은 오픈소스 프로젝트{" "}
            <a target="_blank" href="https://github.com/JJoriping/KKuTu">
              끄투
            </a>
            를{" "}
            <a target="_blank" href="https://github.com/JJoriping/JJWAK">
              JJWAK
            </a>
            을 기반으로 처음부터 다시 작성한 것입니다.
            <br />
            이 프로그램은 제품에 대한 어떠한 형태의 보증도 제공하지 않습니다.
            <br />
            이 프로그램은 자유 소프트웨어이며 배포 규정을 만족시키는 조건 아래
            자유롭게 재배포할 수 있습니다.
            <br />
            이에 대한 자세한 사항은 본 프로그램의 구현을 담은 다음
            레포지토리에서 확인하십시오:{" "}
            <a target="_blank" href="https://github.com/bfkkutu/KKuTu">
              https://github.com/bfkkutu/KKuTu
            </a>
            <p />
          </div>
        </div>
        <div className="right">
          <div>
            <a href="/docs/service_terms" target="_blank">
              {L.get("serviceTerms")}
            </a>{" "}
            ·{" "}
            <a href="/docs/privacy_policy" target="_blank">
              {L.get("privacyPolicy")}
            </a>{" "}
            ·{" "}
            <a href="/docs/opensource" target="_blank">
              {L.get("opensource")}
            </a>{" "}
            ·{" "}
            <a href="/docs/policy" target="_blank">
              {L.get("policy")}
            </a>
          </div>
          <br />
          <div>
            <label>{L.get("copyrightWordNet")}</label>
            <br />
            <label>{L.get("copyrightKorean")}</label>
          </div>
        </div>
      </footer>
    );
  }
}
