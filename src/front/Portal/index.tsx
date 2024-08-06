import React, { useEffect, useState } from "react";

import L from "front/@global/Language";
import { Spinner } from "front/@global/Bayadere/Spinner";
import Icon from "front/@block/Icon";
import GoogleAdvertisement from "front/@block/GoogleAdvertisement";
import Bind from "front/ReactBootstrap";
import { sum } from "../../common/Utility";
import { Nest } from "common/Nest";

export default function Portal(props: Nest.Page.Props<"Portal">) {
  const [list, setList] = useState<(number | null)[]>([]);
  const [width, setWidth] = useState(window.innerWidth);
  const [visible, show, hide] = Spinner.useStore((state) => [
    state.visible,
    state.show,
    state.hide,
  ]);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);

    seekServers();
    setInterval(() => {
      if (visible) {
        return;
      }
      seekServers();
    }, 60000);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  async function seekServers(): Promise<void> {
    show();
    const res = await fetch("/servers");
    if (res.ok) {
      try {
        const { list } = await res.json();
        setList(list);
      } catch (e) {
        window.alert(L.get("error_500"));
      }
    } else {
      window.alert(L.get(`error_${res.status}`));
    }
    hide();
  }

  return (
    <article
      id="main"
      style={{
        marginLeft: Math.max(0, width / 2 - 500),
      }}
    >
      <div className="flex">
        <img id="logo" src="/media/image/kkutu/short_logo.png" alt="Logo" />
        <div id="start-button">
          <button
            className="game-start"
            type="button"
            onClick={() => {
              if (props.session.profile === undefined) {
                return (location.href = "/login");
              }
              for (let i = 90; i < 100; ++i) {
                for (const index in list) {
                  if (list[index] === null) {
                    continue;
                  }
                  if (list[index] < i) {
                    return (location.href = `/game/${index}`);
                  }
                }
              }
            }}
          >
            {L.render("gameStart")}
          </button>
        </div>
      </div>
      <div
        className="flex"
        style={{
          width: "100%",
        }}
      >
        <div
          className="flex"
          style={{
            width: "100%",
          }}
        >
          <a
            className="p_button daldalso"
            target="_blank"
            href="http://daldal.so/"
          >
            {L.get("daldalso")}
          </a>
          <a
            className="p_button discord"
            target="_blank"
            href="http://discord.gg/scPVHcE"
          >
            {L.get("discord")}
          </a>
        </div>
        <div className="flex server-list-wrapper">
          <div className="server-list-box">
            <h3 className="server-list-title">
              <div id="server-list-refresh-container">
                <a id="server-refresh" onClick={() => seekServers()}>
                  <Icon type={Icon.Type.NORMAL} name="refresh" />
                </a>
                <label className="inline-flex">{L.render("serverList")}</label>
              </div>
              <label id="server-total">
                {L.get("total")}{" "}
                {L.get("unitPeople", sum(...list.filter((v) => v !== null)))}
              </label>
            </h3>
            <div id="server-list">
              {list.map((v, index) => {
                let status = v === null ? "x" : "o";
                const people = status == "x" ? "-" : v + " / " + 100;
                const limp = v === null ? 0 : (v / 100) * 100;

                if (status == "o") {
                  if (limp >= 99) {
                    status = "q";
                  } else if (limp >= 90) {
                    status = "p";
                  }
                }
                return (
                  <div
                    key={index}
                    className="server"
                    onClick={() => {
                      if (status != "x") {
                        location.href = `/game/${index}`;
                      }
                    }}
                  >
                    <div className={`server-status ss-${status}`} />
                    <div className="server-name">
                      {L.render(`server_${index}`)}
                    </div>
                    <div className="server-people graph">
                      <div
                        className="graph-bar"
                        style={{ width: `${limp}%` }}
                      />
                      <label>{people}</label>
                    </div>
                    <div className="server-enter">
                      {status == "x" ? "-" : L.render("serverEnter")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="beta">
        <h1>Q&A</h1>
        <h2>1. 서버가 어떻게 된 건가요?</h2>
        <p>
          버전 관리 중 문제가 발생하여 기존 BF끄투 소스코드가 손상되었습니다. 본
          서버는 BFKKuTu Reatomized 프로젝트로 다시 개발 중입니다.
        </p>
        <h2>2. 제 게임 데이터는 날아간 건가요?</h2>
        <p>
          BF끄투의 모든 데이터(전적, 핑, 아이템 등)는 데이터베이스에 보관
          중입니다. 추후 개발이 완료되면 복원할 예정입니다.
        </p>
        <h2>3. 이 서버의 데이터는 어떻게 되는 건가요?</h2>
        <p>정식 오픈 전에 모두 폐기됩니다.</p>
        <h2>4. 서버 응답이 너무 느려요.</h2>
        <p>
          기존에 사용하던 클라우드 업체의 폐업으로 다른 업체를 알아보고
          있습니다. 서버 응답이 느린 것은 임시로 클라우드플레어를 사용 중이기
          때문입니다.
        </p>
      </div>
      {props.mode === "production" ? (
        <GoogleAdvertisement {...props.metadata!.ad.google} />
      ) : null}
    </article>
  );
}
Bind(Portal);

