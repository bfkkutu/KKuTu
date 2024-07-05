import React from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import Mode from "front/@block/Mode";
import { Icon, IconType } from "front/@block/Icon";
import { useStore } from "front/Game/Store";
import { Room } from "front/Game/box/Room";
import { KKuTu } from "common/KKuTu";
import {
  WebSocketError,
  WebSocketMessage,
} from "../../../../../common/WebSocket";

interface Props {
  room: KKuTu.Room.Summarized;
}
export default function Item(props: Props) {
  const socket = useStore((state) => state.socket);
  const updateRoom = Room.useStore((state) => state.updateRoom);

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
          updateRoom(res.room);
        } catch (e) {
          const { errorType } =
            e as WebSocketError.Message[WebSocketError.Type];
          switch (errorType) {
            case WebSocketError.Type.NotFound:
              window.alert(L.get("error_roomNotFound"));
              break;
            case WebSocketError.Type.Conflict:
              window.alert(L.get("error_roomFull"));
              break;
            case WebSocketError.Type.BadRequest:
              window.alert(L.get("error_roomNewbie"));
              break;
            case WebSocketError.Type.Unauthorized:
              const password = await window.prompt(
                L.render("prompt_title_roomPassword"),
                L.get("prompt_roomPassword"),
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
                updateRoom(res.room);
              } catch (e) {
                const { errorType } =
                  e as WebSocketError.Message[WebSocketError.Type];
                switch (errorType) {
                  case WebSocketError.Type.NotFound:
                    window.alert(L.get("error_roomNotFound"));
                    break;
                  case WebSocketError.Type.Forbidden:
                    window.alert(L.get("error_passwordMismatch"));
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
        <div className="mode">
          <Mode room={props.room} />
        </div>
        <div className="round">{L.get("unitRound", props.room.round)}</div>
        <div className="time">{L.get("unitSecond", props.room.roundTime)}</div>
      </div>
      <div className="lock">
        <Icon
          type={IconType.NORMAL}
          name={props.room.isLocked ? "lock" : "unlock"}
        />
      </div>
    </div>
  );
}
