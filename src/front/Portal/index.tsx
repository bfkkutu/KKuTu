import React, { useEffect, useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import ClassName from "front/@global/ClassName";
import { Spinner } from "front/@global/bayadere/Spinner";
import lCommon from "front/@global/languages/l.common";
import lPortal from "front/@global/languages/l.portal";
import Icon from "front/@block/Icon";
import GoogleAdvertisement from "front/@block/GoogleAdvertisement";
import Bind from "front/ReactBootstrap";
import { sum } from "../../common/Utility";
import type { Nest } from "common/Nest";

export default function Portal(props: Nest.Page.Props<"Portal">) {
  const { l } = useLexicon(lCommon, lPortal);
  const [list, setList] = useState<Array<number | null>>([]);
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
        window.alert(l("error", 500));
      }
    } else {
      window.alert(l("error", res.status));
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
            {l("gameStart")}
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
            {l("daldalso")}
          </a>
          <a
            className="p_button discord"
            target="_blank"
            href="http://discord.gg/scPVHcE"
          >
            {l("discord")}
          </a>
        </div>
        <div className="flex server-list-wrapper">
          <div className="server-list-box">
            <h3 className="server-list-title">
              <div id="server-list-refresh-container">
                <a id="server-refresh" onClick={() => seekServers()}>
                  <Icon type={Icon.Type.NORMAL} name="refresh" />
                </a>
                <label className="inline-flex">{l("serverList")}</label>
              </div>
              <label id="server-total">
                {l("total")}{" "}
                {l("unitPeople", sum(...list.filter((v) => v !== null)))}
              </label>
            </h3>
            <div id="server-list">
              {list.map((v, index) => {
                if (v === null) {
                  return (
                    <div key={index} className="server">
                      <div className="server-status ss-x" />
                      <div className="server-name">{l("server", index)}</div>
                      <LegacyGraph className="server-people graph" />
                      <div className="server-enter">{l("serverEnter")}</div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="server"
                    onClick={() => (location.href = `/game/${index}`)}
                  >
                    <div
                      className={new ClassName("server-status")
                        .if(v >= 99, "ss-q")
                        .elif(v >= 90, "ss-p")
                        .else("ss-o")
                        .toString()}
                    />
                    <div className="server-name">{l("server", index)}</div>
                    <LegacyGraph className="server-people graph" value={v} />
                    <div className="server-enter">{l("serverEnter")}</div>
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

interface Props {
  className: string;
  value?: number;
}
function LegacyGraph(props: Props) {
  if (props.value === undefined) {
    return (
      <div className={props.className}>
        <div className="graph-bar" style={{ width: "0" }} />
        <label>-</label>
      </div>
    );
  }

  return (
    <div className={props.className}>
      <div className="graph-bar" style={{ width: `${props.value}%` }} />
      <label>{props.value} / 100</label>
    </div>
  );
}

