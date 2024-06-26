import React, { useEffect, useState } from "react";

import L from "front/@global/Language";
import ClassName from "front/@global/ClassName";
import { getLevel } from "front/@global/Utility";
import AudioContext from "front/@global/AudioContext";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import Moremi from "front/@block/Moremi";
import Robot from "front/@block/Robot";
import LevelIcon from "front/@block/LevelIcon";
import { useStore } from "front/Game/Store";
import { Room } from "front/Game/box/Room";
import { KKuTu } from "../../../../common/KKuTu";
import { WebSocketMessage } from "../../../../common/WebSocket";

export namespace Game {
  export const GRAPHICS: Record<KKuTu.Game.Graphic, React.FC<{}>> = {
    [KKuTu.Game.Graphic.Normal]: Normal,
    [KKuTu.Game.Graphic.Huge]: Huge,
  };

  export function Normal() {
    const socket = useStore((state) => state.socket);
    const users = useStore((state) => state.users);
    const room = Room.useStore((state) => state.room!);
    const game = room.game!;
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );
    const [round, setRound] = useState(0);

    useEffect(() => {
      socket.messageReceiver.on(
        WebSocketMessage.Type.RoundStart,
        async ({ round }) => {
          setRound(round);
          await AudioContext.instance.playEffect("roundStart");
        }
      );

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.RoundStart);
      };
    }, []);

    return (
      <div className="product-body normal">
        <div className="head">
          <div className="hint"></div>
          <div className="stage">
            <div className="top">
              <div className="rounds">
                {Array(room.round)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className={new ClassName("item")
                        .if(round === index, "current")
                        .toString()}
                    >
                      {game.prompt[index]}
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
          {Object.entries(game.players).map(([id, score], index) => {
            if (room.members[id].isRobot) {
              return (
                <div key={index} className="member">
                  <Robot className="moremi" />
                  <div className="profile">
                    <LevelIcon
                      className="level"
                      level={1}
                      width={18}
                      height={18}
                    />
                    <div className="nickname ellipse">{L.get("robot")}</div>
                  </div>
                  <div className="score">
                    {score.toString().padStart(5, "0")}
                  </div>
                </div>
              );
            }

            const member = users[id];
            const level = getLevel(member.score);

            return (
              <div key={index} className="member">
                <Moremi className="moremi" equipment={member.equipment} />
                <div
                  className="profile"
                  onMouseEnter={createOnMouseEnter(
                    new Tooltip(`${L.get("level")} ${level}`)
                  )}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                >
                  <LevelIcon
                    className="level"
                    level={level}
                    width={18}
                    height={18}
                  />
                  <div className="nickname ellipse">{member.nickname}</div>
                </div>
                <div className="score">{score.toString().padStart(5, "0")}</div>
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
