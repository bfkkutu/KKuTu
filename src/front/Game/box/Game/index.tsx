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
            <div className="hints"></div>
            <div className="stage">
              <img className="eye-left" src="/media/image/ui/jjoeyeL.png" />
              <img className="nose" src="/media/image/ui/jjonose.png" />
              <img className="eye-right" src="/media/image/ui/jjoeyeR.png" />
              <div className="display-bar">
                <div className="display ellipse">DISPLAY</div>
                <div className="graph turn-time"></div>
                <div className="graph round-time"></div>
              </div>
            </div>
            <div className="chain"></div>
            <div className="rounds"></div>
            <div className="history"></div>
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
          <input
            className="input"
            placeholder={L.get("game-input-placeholder")}
          />
        </div>
      </section>
    );
  }
  export function Huge() {
    return <section id="box-game" className="product huge"></section>;
  }
}
