import React, { useEffect } from "react";
import { create } from "zustand";
import { useLexicon } from "@daldalso/i18n";
import sha256 from "sha256";

import WebSocket from "front/@global/WebSocket";
import { Tooltip } from "front/@global/bayadere/Tooltip";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import Mode from "front/@block/Mode";
import Icon from "front/@block/Icon";
import { useSocket } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import Game from "front/KKuTu/box/Game";
import RoomListBox from "front/KKuTu/box/RoomList/RoomList";
import SearchRoom from "front/KKuTu/box/RoomList/SearchRoom";
import { KKuTu } from "../../../../common/KKuTu";
import { WebSocketError, WebSocketMessage } from "../../../../common/WebSocket";

namespace ListBox {
  export enum Type {
    RoomList,
    SearchRoom,
    Shop,
  }

  const TABLE: Record<Type, React.FC> = {
    [Type.RoomList]: RoomListBox,
    [Type.SearchRoom]: SearchRoom,
    [Type.Shop]: () => null,
  };

  export function Box() {
    return React.createElement(TABLE[useStore((state) => state.current)]);
  }

  interface Props {
    room: KKuTu.Room.Summarized;
  }
  export function Item(props: Props) {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const update = Room.useStore((state) => state.update);
    const initialize = Game.useStore((state) => state.initialize);
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );

    useEffect(() => {
      const onUpdate: WebSocket.EventListener<
        WebSocketMessage.Type.UpdateGame
      > = ({ game }) => initialize(game); // 게임 중 참여
      socket.messageReceiver.on(WebSocketMessage.Type.UpdateGame, onUpdate);

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.UpdateGame, onUpdate);
      };
    }, []);

    return (
      <div
        className={`item ${props.room.isGaming ? "gaming" : "waiting"}`}
        onClick={async () => {
          socket.send(WebSocketMessage.Type.JoinRoom, {
            target: props.room.id,
          });
          try {
            const res = await socket.messageReceiver.wait(
              WebSocketMessage.Type.InitializeRoom
            );
            update(res.room);
          } catch (e) {
            const { errorType } =
              e as WebSocketError.Message[WebSocketError.Type];
            switch (errorType) {
              case WebSocketError.Type.NotFound:
                window.alert(l("error_roomNotFound"));
                break;
              case WebSocketError.Type.Conflict:
                window.alert(l("error_roomFull"));
                break;
              case WebSocketError.Type.BadRequest:
                window.alert(l("error_roomNewbie"));
                break;
              case WebSocketError.Type.Unauthorized:
                const password = await window.prompt(
                  l("prompt_title_roomPassword"),
                  l("prompt_roomPassword"),
                  "password"
                );

                if (password === null) {
                  return;
                }

                socket.send(WebSocketMessage.Type.JoinRoom, {
                  target: props.room.id,
                  password: sha256(password),
                });
                try {
                  const res = await socket.messageReceiver.wait(
                    WebSocketMessage.Type.InitializeRoom
                  );
                  update(res.room);
                } catch (e) {
                  const { errorType } =
                    e as WebSocketError.Message[WebSocketError.Type];
                  switch (errorType) {
                    case WebSocketError.Type.NotFound:
                      window.alert(l("error_roomNotFound"));
                      break;
                    case WebSocketError.Type.Forbidden:
                      window.alert(l("error_passwordMismatch"));
                      break;
                  }
                }
                break;
            }
          }
        }}
      >
        <div className="id">{props.room.id}</div>
        <div className="title ellipse">{props.room.title}</div>
        <div className="limit">
          {props.room.members} / {props.room.limit}
        </div>
        <div className="game-settings">
          {KKuTu.Game.MODES[props.room.mode].themeSelect ? (
            <div
              className="mode"
              onMouseEnter={createOnMouseEnter(
                new Tooltip(
                  props.room.themes
                    .map((theme) => l("theme", theme))
                    .join(" / ")
                )
              )}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
            >
              <Mode room={props.room} />
            </div>
          ) : (
            <div className="mode">
              <Mode room={props.room} />
            </div>
          )}
          <div className="round">{l("unitRound", props.room.round)}</div>
          <div className="time">{l("unitSecond", props.room.roundTime)}</div>
        </div>
        <div className="lock">
          <Icon
            type={Icon.Type.NORMAL}
            name={props.room.isLocked ? "lock" : "unlock"}
          />
        </div>
      </div>
    );
  }

  interface State {
    current: Type;
    change: (type: Type) => void;
  }
  export const useStore = create<State>((setState) => ({
    current: Type.RoomList,
    change: (type) => setState({ current: type }),
  }));
}

export default ListBox;

