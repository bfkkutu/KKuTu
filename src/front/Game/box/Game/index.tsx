import React from "react";

import L from "front/@global/Language";
import ClassName from "front/@global/ClassName";
import { useStore } from "front/Game/Store";
import { Room } from "front/Game/box/Room";
import { KKuTu } from "../../../../common/KKuTu";

export namespace Game {
  export const GRAPHICS: Record<KKuTu.Game.Graphic, React.FC<{}>> = {
    [KKuTu.Game.Graphic.Normal]: Normal,
    [KKuTu.Game.Graphic.Huge]: Huge,
  };

  export function Normal() {
    const users = useStore((state) => state.users);
    const game = Room.useStore((state) => state.room!.game!);

    return (
      <div className="product-body normal">
        <div className="head">
          <div className="hint"></div>
          <div className="stage">
            <div className="top">
              <div className="rounds">
                {[...game.prompt].map((character, index) => (
                  <div
                    key={index}
                    className={new ClassName("item")
                      .if(game.round === index, "current")
                      .toString()}
                  >
                    {character}
                  </div>
                ))}
              </div>
              <div className="character">
                <img className="eye-left" src="/media/image/ui/jjoeyeL.png" />
                <img className="nose" src="/media/image/ui/jjonose.png" />
                <img className="eye-right" src="/media/image/ui/jjoeyeR.png" />
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
          {game.players.map((id, index) => {
            const member = users[id];
            return (
              <div key={index} className="member">
                {member.nickname}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  export function Huge() {
    return <div className="product-body huge"></div>;
  }
}
