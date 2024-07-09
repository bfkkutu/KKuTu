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
import { useStore } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import { Display } from "front/KKuTu/box/Game/Display";
import { WebSocketMessage } from "../../../../../common/WebSocket";
import { Database } from "common/Database";

namespace Relay {
  export interface Turn {
    hint?: string;
    player: number;
    speed: number;
    time: number;
    roundTime: number;
    at: number;
  }
  export interface Chain {
    readonly history: Database.Word[];
    length: number;
  }
}
export default function Relay() {
  const socket = useStore((state) => state.socket);
  const id = useStore((state) => state.me.id);
  const users = useStore((state) => state.users);
  const setVibration = useStore((state) => state.setVibration);
  const [room, game, updateGame] = Room.useStore((state) => {
    const room = state.room!;
    return [room, room.game!, state.updateGame];
  });
  const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
    (state) => [state.createOnMouseEnter, state.onMouseMove, state.onMouseLeave]
  );
  const [now, setNow] = useState(0);
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState<Relay.Turn>({
    player: 0,
    speed: 0,
    time: 0,
    roundTime: 0,
    at: 0,
  });
  const [chain, setChain] = useState<Relay.Chain>({
    history: [],
    length: 0,
  });
  const [display, setDisplay] = useState<Display>({
    type: Display.Type.None,
    content: "",
    isAnimating: false,
  });
  const [displacement, setDisplacement] = useState<number | undefined>(
    undefined
  );

  const timer = useRef<DOMHighResTimeStamp>(0);
  const errorTimeout = useRef<number>();

  function tick() {
    setNow(new Date().getTime());
    timer.current = window.requestAnimationFrame(tick);
  }

  useEffect(() => {
    socket.messageReceiver.on(WebSocketMessage.Type.RoundStart, ({ round }) => {
      setRound(round);
      setDisplay({
        type: Display.Type.None,
        content: game.prompt[round],
        isAnimating: false,
        submitting: undefined,
      });
      AudioContext.instance.playEffect("roundStart");
    });
    socket.messageReceiver.on(
      WebSocketMessage.Type.TurnStart,
      ({ display, hint, player, speed, time, roundTime, at }) => {
        window.cancelAnimationFrame(timer.current);
        setTurn({
          hint,
          player,
          speed,
          time,
          roundTime,
          at,
        });
        setDisplay({
          type: Display.Type.None,
          content: display,
          isAnimating: false,
          submitting: undefined,
        });
        timer.current = window.requestAnimationFrame(tick);
        AudioContext.instance.play(`turn_${speed}`);
      }
    );

    return () => {
      window.cancelAnimationFrame(timer.current);
      socket.messageReceiver.off(WebSocketMessage.Type.RoundStart);
      socket.messageReceiver.off(WebSocketMessage.Type.TurnStart);
    };
  }, []);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.TurnError,
      ({ errorType, display: content }) => {
        clearTimeout(errorTimeout.current);
        AudioContext.instance.playEffect("fail");
        setDisplay({
          type: Display.Type.Error,
          content: L.get(`turnError_${errorType}`, content),
          isAnimating: false,
          submitting: undefined,
        });
        errorTimeout.current = window.setTimeout(
          () =>
            setDisplay({
              type: Display.Type.None,
              content: display.content,
              isAnimating: false,
              submitting: undefined,
            }),
          1800
        );
      }
    );

    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.TurnError);
    };
  }, [display.content]);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.RoundEnd,
      ({ display, loss }) => {
        window.cancelAnimationFrame(timer.current);
        const id = game.players[turn.player];
        updateGame({
          ...game,
          scores: {
            ...game.scores,
            [id]: game.scores[id] - loss,
          },
        });
        setDisplacement(-loss);
        window.setTimeout(() => setDisplacement(undefined), 2000);

        if (display !== undefined) {
          window.clearTimeout(errorTimeout.current);
          setDisplay({
            type: Display.Type.Timeout,
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
      WebSocketMessage.Type.TurnEnd,
      async ({ word, gain }) => {
        window.cancelAnimationFrame(timer.current);
        window.clearTimeout(errorTimeout.current);
        AudioContext.instance.stopAll();

        const id = game.players[turn.player];
        updateGame({
          ...game,
          scores: {
            ...game.scores,
            [id]: game.scores[id] + gain,
          },
        });
        setDisplacement(gain);
        window.setTimeout(() => setDisplacement(undefined), 2000);
        setDisplay({
          type: Display.Type.None,
          content: "",
          isAnimating: false,
          submitting: undefined,
        });

        const long = word.data.length > 8;
        const type = long ? Display.Type.Long : Display.Type.Short;
        const tick = turn.time / 96;
        if (long) {
          vibrate();

          const tick = turn.time / 12 / word.data.length;
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
          let beat = Display.BEAT[word.data.length];
          let cursor = 0;
          for (let i = 0; i < 8; ++i) {
            if (beat % 0b10) {
              AudioContext.instance.playEffect(`submit_${turn.speed}`);
              if (word.data[cursor] === turn.hint) {
                AudioContext.instance.playEffect(`submit_mission`);
              }
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

    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.RoundEnd);
      socket.messageReceiver.off(WebSocketMessage.Type.TurnEnd);
    };
  }, [turn, game]);

  return (
    <div className="product-body normal">
      <div className="head">
        <div className="left">
          {turn.hint === undefined ? null : (
            <div className="hint">{turn.hint}</div>
          )}
        </div>
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
            {display.type === Display.Type.Short ? (
              <div className="display ellipse short">
                {Array.from(display.content).map((character, index) => (
                  <div
                    key={index}
                    className={new ClassName()
                      .if(turn.hint === character, "mission")
                      .if(
                        display.submitting === undefined && display.isAnimating,
                        "submitted"
                      )
                      .elif(
                        // index는 undefined일 수 없음.
                        index === display.submitting,
                        "submitting"
                      )
                      .elif(
                        display.submitting !== undefined &&
                          index > display.submitting,
                        "hidden"
                      )
                      .toString()}
                  >
                    {character}
                  </div>
                ))}
              </div>
            ) : display.type === Display.Type.Long ? (
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
                  .if(display.type !== Display.Type.None, display.type)
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
        <div className="right">
          {chain.length === 0 ? null : (
            <div className="chain">{chain.length}</div>
          )}
        </div>
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
        {game.players[turn.player] === id ? (
          <input
            className="input"
            placeholder={L.get("game_input_placeholder")}
          />
        ) : null}
      </div>
      <div className="body">
        {game.players.map((id, index) => {
          const nickname = room.members[id].isRobot
            ? L.get("robot")
            : users[id].nickname;
          const level = getLevel(
            room.members[id].isRobot ? 0 : users[id].score
          );
          const myTurn = game.players[turn.player] === id;

          return (
            <div
              key={index}
              className={new ClassName("member")
                .if(
                  myTurn,
                  new ClassName()
                    .if(display.type === Display.Type.Timeout, "timeout")
                    .else("current")
                )
                .toString()}
            >
              {room.members[id].isRobot ? (
                <Robot className="moremi" />
              ) : (
                <Moremi className="moremi" equipment={users[id].equipment} />
              )}
              <div
                className="profile"
                onMouseEnter={createOnMouseEnter(
                  new Tooltip(L.get("level", level))
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
                <div className="nickname ellipse">{nickname}</div>
              </div>
              <div className="score">
                {game.scores[id].toString().padStart(5, "0")}
                {myTurn && displacement !== undefined ? (
                  <div
                    className={new ClassName("displacement")
                      .if(displacement < 0, "loss")
                      .else("gain")
                      .toString()}
                  >
                    {displacement}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
