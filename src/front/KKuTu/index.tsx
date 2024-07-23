import React, { useEffect } from "react";

import Bind from "front/ReactBootstrap";
import WebSocket from "front/@global/WebSocket";
import { Notification } from "front/@global/Bayadere/Notification";
import KakaoAdvertisement from "front/@block/KakaoAdvertisement";
import { Menu } from "front/KKuTu/Menu";
import Intro from "front/KKuTu/Intro";
import { useSocket, useStore } from "front/KKuTu/Store";
import { useVibration } from "front/KKuTu/Vibration";
import { Whisper } from "front/KKuTu/dialogs/Whisper";
import { Nest } from "common/Nest";
import { WebSocketMessage } from "../../common/WebSocket";

import InviteNotification from "front/KKuTu/notifications/Invite";
import WhisperNotification from "front/KKuTu/notifications/Whisper";

import { Room } from "front/KKuTu/box/Room";
import ListBox from "front/KKuTu/box/RoomList";
import { UserList } from "front/KKuTu/box/UserList";
import { Profile } from "front/KKuTu/box/Profile";
import { Chat } from "front/KKuTu/box/Chat";

function Component(props: Nest.Page.Props<"KKuTu">) {
  const socket = useSocket((state) => state.socket);
  const [me, updateMe] = useStore((state) => [state.me, state.updateMe]);
  const updateCommunity = useStore((state) => state.updateCommunity);
  const [users, updateUser, updateUsers, removeUser] = useStore((state) => [
    state.users,
    state.updateUser,
    state.updateUsers,
    state.removeUser,
  ]);
  const vibration = useVibration((state) => state.vibration);
  const room = Room.useStore((state) => state.room);
  const [notifications, showNotification, hideNotification] =
    Notification.useStore((state) => [
      state.notifications,
      state.show,
      state.hide,
    ]);
  const [whisperDialogs, appendWhisper] = Whisper.useStore((state) => [
    state.dialogs,
    state.append,
  ]);

  const server = parseInt(props.path.match(/\/game\/(.*)/)![1]);

  useEffect(() => {
    if (socket === undefined) {
      return;
    }

    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateCommunity,
      ({ community }) => updateCommunity(community)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.Join, ({ user }) =>
      updateUser(user)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.Leave, ({ user }) =>
      removeUser(user)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.UpdateMe, ({ me }) =>
      updateMe(me)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.UpdateUser, ({ user }) =>
      updateUser(user)
    );
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateUserList,
      ({ users }) => updateUsers(users)
    );

    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Join);
      socket.messageReceiver.off(WebSocketMessage.Type.Leave);
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateMe);
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateUser);
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateUserList);
    };
  }, [socket]);

  useEffect(() => {
    if (socket === undefined) {
      return;
    }

    const inviteListener: WebSocket.EventListener<
      WebSocketMessage.Type.Invite
    > = async ({ user, room }) =>
      showNotification(new InviteNotification(room, users[user].nickname));
    socket.messageReceiver.on(WebSocketMessage.Type.Invite, inviteListener);

    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Invite, inviteListener);
    };
  }, [socket, users]);

  useEffect(() => {
    if (socket === undefined) {
      return;
    }

    const listener: WebSocket.EventListener<WebSocketMessage.Type.Whisper> = ({
      whisper,
    }) => {
      if (
        whisper.sender !== me.id &&
        whisperDialogs[whisper.sender] === undefined
      ) {
        for (const notification of notifications) {
          if (
            notification instanceof WhisperNotification &&
            notification.sender.id === whisper.sender
          ) {
            hideNotification(notification);
          }
        }
        showNotification(
          new WhisperNotification(
            users[whisper.sender],
            appendWhisper(whisper.sender, whisper)
          )
        );
      }
    };
    socket.messageReceiver.on(WebSocketMessage.Type.Whisper, listener);

    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Whisper, listener);
    };
  }, [socket, users, whisperDialogs]);

  return (
    <article id="main" style={{ paddingTop: vibration }}>
      <div id="game">
        <Intro url={props.data.ws} version={props.version} />
        {me ? (
          <>
            <Menu.Component />
            <div id="box-grid">
              {room === undefined ? (
                <div className="lobby">
                  <UserList.Box server={server} />
                  <ListBox.Box />
                </div>
              ) : (
                <div className="room">
                  <Room.Box />
                </div>
              )}
              <div className="lobby">
                <Profile.Box />
                <Chat.Box />
              </div>
            </div>
          </>
        ) : null}
      </div>
      {props.mode === "production" ? (
        <KakaoAdvertisement unit={props.metadata!.ad.kakao.unit} />
      ) : null}
    </article>
  );
}
Bind(Component);

