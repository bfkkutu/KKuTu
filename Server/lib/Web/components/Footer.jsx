const React = require("react");

const Footer = (props) => {
    return (
        <div id="Footer">
            <p />
            <div className="footer-left">
                <div>
                    새로운 끄투의 시작, BF끄투 Copyright (C) 2018 이승훈(
                    <a target="_blank" href="mailto:op@bf1.tech">
                        op@bf1.tech
                    </a>{" "}
                    /{" "}
                    <a target="_blank" href="mailto:op@bfkkutu.kr">
                        op@bfkkutu.kr
                    </a>
                    )
                </div>
                <div style={{ color: "#666" }}>
                    <br />
                    이 프로그램은 제품에 대한 어떠한 형태의 보증도 제공되지
                    않습니다.
                    <br />
                    이 프로그램은 자유 소프트웨어이며 배포 규정을 만족시키는
                    조건 아래 자유롭게 재배포할 수 있습니다.
                    <br />
                    이에 대한 자세한 사항은 본 프로그램의 구현을 담은 다음
                    레포지토리에서 확인하십시오:
                    <a target="_blank" href="https://github.com/bfkkutu/KKuTu">
                        https://github.com/bfkkutu/KKuTu
                    </a>
                    <p />
                </div>
            </div>
            <div className="footer-right">
                <div>
                    <a href="/public_info_use.html" target="_blank">
                        서비스 이용 약관
                    </a>{" "}
                    ·{" "}
                    <a href="/public_info_personal.html" target="_blank">
                        개인정보 취급 방침
                    </a>{" "}
                    ·{" "}
                    <a href="http://ingame.bfk.kro.kr" target="_blank">
                        인게임 운영 정책
                    </a>{" "}
                    ·{" "}
                    <a href="http://discord.bfk.kro.kr" target="_blank">
                        디스코드 운영 정책
                    </a>
                </div>
                <div>
                    <br />
                    <label style={{ color: "#777777" }}>
                        WordNet 3.0 Copyright 2006 by Princeton University. All
                        rights reserved.
                    </label>
                    <br />
                    <label style={{ color: "#777777" }}>
                        우리말샘 Copyright 2016 by 국립국어원. All rights
                        reserved.
                    </label>
                </div>
            </div>
        </div>
    );
};

module.exports = Footer;
