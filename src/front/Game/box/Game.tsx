import React, { useEffect, useRef, useState } from "react";

import L from "front/@global/Language";
import ClassName from "front/@global/ClassName";
import { getLevel } from "front/@global/Utility";
import AudioContext from "front/@global/AudioContext";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import Moremi from "front/@block/Moremi";
import Robot from "front/@block/Robot";
import LevelIcon from "front/@block/LevelIcon";
import TimeGauge from "front/@block/TimeGauge";
import { useStore } from "front/Game/Store";
import { Room } from "front/Game/box/Room";
import { KKuTu } from "../../../common/KKuTu";
import { WebSocketMessage } from "../../../common/WebSocket";
import { Database } from "common/Database";

export namespace Game {
  export const GRAPHICS: Record<KKuTu.Game.Graphic, React.FC<{}>> = {
    [KKuTu.Game.Graphic.Normal]: Normal,
    [KKuTu.Game.Graphic.Huge]: Huge,
  };
  const BEAT: Record<number, number> = {
    [1]: 0b0000_0001,
    [2]: 0b0001_0001,
    [3]: 0b0100_1001,
    [4]: 0b0101_1001,
    [5]: 0b0101_1011,
    [6]: 0b0111_1011,
    [7]: 0b1111_1011,
    [8]: 0b1111_1111,
  };

  interface Turn {
    speed: number;
    time: number;
    roundTime: number;
    at: number;
    player?: string;
    loss?: number;
  }
  interface Display {
    content: string;
    error?: string;
    submitting?: number;
    submitted: boolean;
  }
  interface Chain {
    history: Database.Word[];
    length: number;
  }
  export function Normal() {
    const socket = useStore((state) => state.socket);
    const id = useStore((state) => state.me.id);
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
    const [now, setNow] = useState(0);
    const [round, setRound] = useState(0);
    const [turn, setTurn] = useState<Turn>({
      speed: 0,
      time: 0,
      roundTime: 0,
      at: 0,
    });
    const [display, setDisplay] = useState<Display>({
      content: "",
      submitted: false,
    });
    const [chain, setChain] = useState<Chain>({
      history: [],
      length: 0,
    });

    const timer = useRef<DOMHighResTimeStamp>(0);
    const errorTimeout = useRef<number>();

    function tick() {
      setNow(new Date().getTime());
      timer.current = requestAnimationFrame(tick);
    }

    useEffect(() => {
      () => {
        cancelAnimationFrame(timer.current);
      };
    }, []);

    useEffect(() => {
      socket.messageReceiver.on(
        WebSocketMessage.Type.RoundStart,
        ({ round }) => {
          setRound(round);
          setTurn({
            ...turn,
            loss: undefined,
          });
          setDisplay({
            content: game.prompt[round],
            submitting: undefined,
            submitted: false,
          });
          AudioContext.instance.playEffect("roundStart");
        }
      );
      socket.messageReceiver.on(WebSocketMessage.Type.RoundEnd, ({ loss }) => {
        cancelAnimationFrame(timer.current);
        setTurn({ ...turn, loss });
        AudioContext.instance.playEffect("timeout");
      });
      socket.messageReceiver.on(
        WebSocketMessage.Type.TurnStart,
        ({ display, player, speed, time, roundTime, at }) => {
          setTurn({ ...turn, player, speed, time, roundTime, at });
          setDisplay({
            content: display,
            submitting: undefined,
            submitted: false,
          });
          timer.current = requestAnimationFrame(tick);
          AudioContext.instance.play(`turn_${speed}`);
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.TurnEnd,
        async ({ word }) => {
          cancelAnimationFrame(timer.current);
          clearTimeout(errorTimeout.current);
          AudioContext.instance.stopAll();

          const display = { content: word.data };
          setDisplay({
            ...display,
            submitting: undefined,
            submitted: false,
          });

          const tick = turn.time / 96;
          if (word.data.length < 9) {
            let beat = BEAT[word.data.length];
            let cursor = 0;
            for (let i = 0; i < 8; ++i) {
              if (beat % 0b10) {
                AudioContext.instance.playEffect(`submit_${turn.speed}`);
                setDisplay({
                  ...display,
                  submitting: cursor++,
                  submitted: false,
                });
              }
              beat >>= 1;
              await sleep(tick);
            }
            AudioContext.instance.playEffect(`submitted_${turn.speed}`);
            for (let i = 0; i < 3; ++i) {
              setDisplay({
                ...display,
                submitting: undefined,
                submitted: true,
              });
              await sleep(tick);
              setDisplay({
                ...display,
                submitting: undefined,
                submitted: false,
              });
              await sleep(tick);
            }
          }
          const history = [word, ...chain.history];
          if (history.length > 6) {
            history.pop();
          }
          setChain({
            history,
            length: chain.length + 1,
          });

          function sleep(ms: number): Promise<void> {
            return new Promise((resolve) => window.setTimeout(resolve, ms));
          }
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.TurnError,
        ({ errorType, display: content }) => {
          clearTimeout(errorTimeout.current);
          AudioContext.instance.playEffect("fail");
          setDisplay({
            ...display,
            error: L.get(`turnError_${errorType}`, content),
          });
          errorTimeout.current = window.setTimeout(
            () =>
              setDisplay({
                ...display,
                error: undefined,
              }),
            1800
          );
        }
      );

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.RoundStart);
        socket.messageReceiver.off(WebSocketMessage.Type.RoundEnd);
        socket.messageReceiver.off(WebSocketMessage.Type.TurnStart);
        socket.messageReceiver.off(WebSocketMessage.Type.TurnEnd);
        socket.messageReceiver.off(WebSocketMessage.Type.TurnError);
      };
    }, [turn]);

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
              {display.error === undefined ? (
                <div className="display ellipse">
                  {Array.from(display.content).map((character, index) => (
                    <div
                      key={index}
                      className={
                        display.submitting === undefined
                          ? display.submitted
                            ? "submitted"
                            : ""
                          : new ClassName()
                              .if(index === display.submitting, "submitting")
                              .if(index > display.submitting, "hidden")
                              .toString()
                      }
                    >
                      {character}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="display error ellipse">{display.error}</div>
              )}
              <TimeGauge
                className="gauge turn-time"
                max={turn.time}
                value={turn.time - now + turn.at}
                width={484}
                height={20}
              />
              <TimeGauge
                className="gauge round-time"
                max={room.roundTime * 1000}
                value={turn.roundTime - now + turn.at}
                width={484}
                height={20}
              />
            </div>
          </div>
          <div className="chain">{chain.length}</div>
        </div>
        <div className="neck">
          <div className="history">
            {chain.history.map((word) => (
              <div key={word.id} className="item">
                <label className="word ellipse">{word.data}</label>
                <div className="means ellipse">
                  {Object.entries(word.means).map(([theme, mean], index) => {
                    const display = L.get(`theme_${theme}`);
                    return (
                      <React.Fragment key={index}>
                        {display.length === 0 ? null : (
                          <label className="theme">{display}</label>
                        )}
                        {mean.length === 0 ? null : mean}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {turn.player === id ? (
            <input
              className="input"
              placeholder={L.get("game_input_placeholder")}
            />
          ) : null}
        </div>
        <div className="body">
          {Object.entries(game.players).map(([id, score], index) => {
            if (room.members[id].isRobot) {
              return (
                <div
                  key={index}
                  className={new ClassName("member")
                    .if(
                      id === turn.player,
                      turn.loss === undefined ? "current" : "timeout"
                    )
                    .toString()}
                >
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
              <div
                key={index}
                className={new ClassName("member")
                  .if(
                    id === turn.player,
                    turn.loss === undefined ? "current" : "timeout"
                  )
                  .toString()}
              >
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
