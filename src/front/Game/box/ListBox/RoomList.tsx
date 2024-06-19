import React, { useEffect } from "react";
import sha256 from "sha256";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { CreateRoomDialog } from "front/Game/dialogs/CreateRoom";
import { Icon, IconType } from "front/@block/Icon";
import Mode from "front/@block/Mode";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Room } from "front/Game/box/Room";
import { WebSocketError, WebSocketMessage } from "../../../../common/WebSocket";

export default function RoomListBox() {
  const socket = useStore((state) => state.socket);
  const [rooms, updateRoomList] = useStore((state) => [
    state.rooms,
    state.updateRoomList,
  ]);
  const updateRoom = Room.useStore((state) => state.updateRoom);
  const toggle = Dialog.useStore((state) => state.toggle);

  useEffect(() => {
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateRoomList,
      ({ rooms }) => updateRoomList(rooms)
    );
    return () =>
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoomList);
  }, []);

  return (
    <section id="box-room-list" className="product">
      <h5 className="product-title">
        {L.render("roomListBox_title", rooms.length)}
      </h5>
      <div className="product-body">
        {rooms.length === 0 ? (
          <div className="item create" onClick={() => toggle(CreateRoomDialog)}>
            {L.get("createRoom")}
          </div>
        ) : (
          rooms.map((room) => (
            <div
              className={`item ${room.isGaming ? "gaming" : "waiting"}`}
              onClick={async () => {
                socket.send(WebSocketMessage.Type.JoinRoom, {
                  roomId: room.id,
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
                        roomId: room.id,
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
              <div className="id">{room.id}</div>
              <div className="title ellipse">{room.title}</div>
              <div className="limit">
                {room.members} / {room.limit}
              </div>
              <div className="game-settings">
                <div className="mode">
                  <Mode {...room} />
                </div>
                <div className="round">{L.get("unitRound", room.round)}</div>
                <div className="time">
                  {L.get("unitSecond", room.roundTime)}
                </div>
              </div>
              <div className="lock">
                <Icon
                  type={IconType.NORMAL}
                  name={room.isLocked ? "lock" : "unlock"}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
