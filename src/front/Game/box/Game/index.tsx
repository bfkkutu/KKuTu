import React from "react";

import L from "front/@global/Language";
import RoomTitle from "front/@block/RoomTitle";
import { Room } from "front/Game/box/Room";
import { useStore } from "front/Game/Store";
import { KKuTu } from "../../../../common/KKuTu";

export namespace Game {
  export const GRAPHICS: Record<KKuTu.Game.Graphic, React.FC<{}>> = {
    [KKuTu.Game.Graphic.Normal]: Normal,
    [KKuTu.Game.Graphic.Huge]: Huge,
  };

  export function Normal() {
    const users = useStore((state) => state.users);
    const room = Room.useStore((state) => state.room!);

    return (
      <section id="box-game" className="product normal">
        <RoomTitle {...room} />
        <div className="product-body">
          <div className="head">
            <div className="hint"></div>
            <div className="stage">
              <div className="top">
                <div className="rounds">제 시 어</div>
                <div className="character">
                  <img className="eye-left" src="/media/image/ui/jjoeyeL.png" />
                  <img className="nose" src="/media/image/ui/jjonose.png" />
                  <img
                    className="eye-right"
                    src="/media/image/ui/jjoeyeR.png"
                  />
                </div>
              </div>
              <div className="bottom">
                <div className="display ellipse">DISPLAY</div>
                <div className="graph turn-time"></div>
                <div className="graph round-time"></div>
              </div>
            </div>
            <div className="chain"></div>
          </div>
          <div className="neck">
            <div className="history"></div>
            <input
              className="input"
              placeholder={L.get("game_input_placeholder")}
            />
          </div>
          <div className="body">
            {Object.keys(room.members).map((id, index) => {
              const member = users[id];
              return (
                <div key={index} className="member">
                  {member.nickname}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  export function Huge() {
    return <section id="box-game" className="product huge"></section>;
  }
}
