import React, { useEffect } from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { CreateRoomDialog } from "front/Game/dialogs/CreateRoom";
import { WebSocketMessage } from "../../../../common/WebSocket";
import { Icon, IconType } from "front/@block/Icon";
import { useRoomStore } from "front/Game/box/Room/Store";
import Mode from "front/@block/Mode";

export default function RoomListBox() {
  const socket = useStore((state) => state.socket);
  const [rooms, updateRoomList] = useStore((state) => [
    state.rooms,
    state.updateRoomList,
  ]);
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const toggle = useDialogStore((state) => state.toggle);

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
                const res = await socket.messageReceiver.wait(
                  WebSocketMessage.Type.InitializeRoom
                );
                updateRoom(res.room);
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
