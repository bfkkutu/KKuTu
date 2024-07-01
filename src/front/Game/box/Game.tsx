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

  enum DisplayType {
    None = "",
    Short = "short",
    Long = "long",
    Error = "error",
    Timeout = "timeout",
  }

  interface Turn {
    speed: number;
    time: number;
    roundTime: number;
    at: number;
    player?: string;
    loss?: number;
  }
  interface Display {
    type: DisplayType;
    content: string;
    isAnimating: boolean;
    submitting?: number;
  }
  interface Chain {
    history: Database.Word[];
    length: number;
  }
  export function Normal() {
    const socket = useStore((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const users = useStore((state) => state.users);
    const setVibration = useStore((state) => state.setVibration);
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
      type: DisplayType.None,
      content: "",
      isAnimating: false,
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
            type: DisplayType.None,
            content: game.prompt[round],
            isAnimating: false,
            submitting: undefined,
          });
          AudioContext.instance.playEffect("roundStart");
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.RoundEnd,
        ({ display, loss }) => {
          cancelAnimationFrame(timer.current);
          setTurn({ ...turn, loss });
          if (display !== undefined) {
            clearTimeout(errorTimeout.current);
            setDisplay({
              type: DisplayType.Timeout,
              content: display,
              isAnimating: false,
              submitting: undefined,
            });
          }
          setChain({ history: [], length: 0 });
          AudioContext.instance.playEffect("timeout");
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.TurnStart,
        ({ display, player, speed, time, roundTime, at }) => {
          setTurn({ ...turn, player, speed, time, roundTime, at });
          setDisplay({
            type: DisplayType.None,
            content: display,
            isAnimating: false,
            submitting: undefined,
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

          setDisplay({
            type: DisplayType.None,
            content: "",
            isAnimating: false,
            submitting: undefined,
          });

          const long = word.data.length > 8;
          const type = long ? DisplayType.Long : DisplayType.Short;
          const tick = turn.time / 12 / (long ? word.data.length : 8);
          if (long) {
            vibrate();
            for (let i = 1; i <= word.data.length; ++i) {
              AudioContext.instance.playEffect("submit_long");
              setDisplay({
                type,
                content: word.data.substring(0, i),
                isAnimating: false,
                submitting: undefined,
              });
              await sleep(tick);
            }

            async function vibrate(level: number = word.data.length) {
              if (level < 1) {
                return;
              }
              setVibration(level);
              await sleep(50);
              setVibration(0);
              await sleep(50);
              vibrate(level * 0.7);
            }
          } else {
            let beat = BEAT[word.data.length];
            let cursor = 0;
            for (let i = 0; i < 8; ++i) {
              if (beat % 0b10) {
                AudioContext.instance.playEffect(`submit_${turn.speed}`);
                setDisplay({
                  type,
                  content: word.data,
                  isAnimating: false,
                  submitting: cursor++,
                });
              }
              beat >>= 1;
              await sleep(tick);
            }
          }

          AudioContext.instance.playEffect(`submitted_${turn.speed}`);
          for (let i = 0; i < 3; ++i) {
            setDisplay({
              type,
              content: word.data,
              isAnimating: true,
              submitting: undefined,
            });
            await sleep(tick);

            setDisplay({
              type,
              content: word.data,
              isAnimating: false,
              submitting: undefined,
            });
            await sleep(tick);
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
            type: DisplayType.Error,
            content: L.get(`turnError_${errorType}`, content),
            isAnimating: false,
            submitting: undefined,
          });
          errorTimeout.current = window.setTimeout(
            () =>
              setDisplay({
                type: DisplayType.None,
                content: display.content,
                isAnimating: false,
                submitting: undefined,
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
              {display.type === DisplayType.Short ? (
                <div className="display ellipse short">
                  {Array.from(display.content).map((character, index) => {
                    if (display.submitting === undefined) {
                      return (
                        <div
                          key={index}
                          className={display.isAnimating ? "submitted" : ""}
                        >
                          {character}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={index}
                        className={new ClassName()
                          .if(index === display.submitting, "submitting")
                          .if(index > display.submitting, "hidden")
                          .toString()}
                      >
                        {character}
                      </div>
                    );
                  })}
                </div>
              ) : display.type === DisplayType.Long ? (
                <div
                  className={new ClassName("display ellipse")
                    .if(display.isAnimating, "submitted")
                    .toString()}
                >
                  {display.content}
                </div>
              ) : (
                <div
                  className={new ClassName("display ellipse")
                    .if(display.type !== DisplayType.None, display.type)
                    .toString()}
                >
                  {display.content}
                </div>
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
