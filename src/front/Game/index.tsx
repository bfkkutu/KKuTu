import React, { useEffect, useRef } from "react";

import Bind from "front/ReactBootstrap";
import L from "front/@global/Language";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import { Menu } from "front/Game/Menu";
import { useStore } from "front/Game/Store";
import { getRequiredScore } from "front/@global/Utility";
import AudioContext from "front/@global/AudioContext";
import { createWhisperNotification } from "front/Game/notifications/Whisper";
import { EventListener } from "front/@global/WebSocket";
import { createInviteNotification } from "front/Game/notifications/Invite";
import { Notification } from "front/@global/Bayadere/Notification";
import { WhisperDialog } from "front/Game/dialogs/Whisper";
import { Nest } from "../../common/Nest";
import { WebSocketMessage } from "../../common/WebSocket";

import { Room } from "front/Game/box/Room";
import { List } from "front/Game/box/ListBox";
import { UserList } from "front/Game/box/UserList";
import { Game } from "front/Game/box/Game";
import { Profile } from "front/Game/box/Profile";
import { Chat } from "front/Game/box/Chat";

CLIENT_SETTINGS.expTable.push(getRequiredScore(1));
for (let i = 2; i < CLIENT_SETTINGS.maxLevel; i++)
  CLIENT_SETTINGS.expTable.push(
    CLIENT_SETTINGS.expTable[i - 2] + getRequiredScore(i)
  );
CLIENT_SETTINGS.expTable[CLIENT_SETTINGS.maxLevel - 1] = Infinity;
CLIENT_SETTINGS.expTable.push(Infinity);

function Component(props: Nest.Page.Props<"Game">) {
  const [socket, initializeSocket] = useStore((state) => [
    state.socket,
    state.initializeSocket,
  ]);
  const [me, updateMe] = useStore((state) => [state.me, state.updateMe]);
  const updateCommunity = useStore((state) => state.updateCommunity);
  const [users, initializeUsers, appendUser, setUser, removeUser] = useStore(
    (state) => [
      state.users,
      state.initializeUsers,
      state.appendUser,
      state.setUser,
      state.removeUser,
    ]
  );
  const room = Room.useStore((state) => state.room);
  const showNotification = Notification.useStore((state) => state.show);
  const [whisperDialogs, whisperLogs, appendWhisperLog] =
    WhisperDialog.useStore((state) => [
      state.dialogs,
      state.logs,
      state.appendLog,
    ]);
  const server = parseInt(props.path.match(/\/game\/(.*)/)![1]);
  const audioContext = AudioContext.instance;

  const $intro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSocket(props.data.wsUrl);
  }, []);

  useEffect(() => {
    if (socket === undefined) return;
    socket.on("open", async () => {
      const { me, users } = await socket.messageReceiver.wait(
        WebSocketMessage.Type.Initialize
      );
      updateMe(me);
      initializeUsers(users);
      for (const [id, src] of Object.entries(CLIENT_SETTINGS.sound))
        if (!(await audioContext.register(id, `/media/sound${src}`)))
          alert(L.get("error_soundNotFound", id));
      audioContext.volume = me.settings.bgmVolume;
      audioContext.play(`lobby_${me.settings.lobbyMusic}`, true);
      const intro = $intro.current!;
      intro.style.opacity = "0";
      socket.send(WebSocketMessage.Type.Initialize, {});
      window.setTimeout(() => intro.remove(), 2000);
    });
    socket.messageReceiver.on(
      WebSocketMessage.Type.UpdateCommunity,
      ({ community }) => updateCommunity(community)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.Join, ({ user }) =>
      appendUser(user)
    );
    socket.messageReceiver.on(WebSocketMessage.Type.Leave, ({ userId }) =>
      removeUser(userId)
    );
    socket.on("close", (e) => {
      alert(L.get("error_closed", e.code));
    });
  }, [socket]);

  useEffect(() => {
    if (socket === undefined) return;
    socket.messageReceiver.on(WebSocketMessage.Type.UpdateUser, ({ user }) =>
      setUser(user.id, { ...user, roomId: user.roomId || undefined })
    );
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.UpdateUser);
    };
  }, [socket, users]);

  useEffect(() => {
    if (socket === undefined) return;
    const inviteListener: EventListener<WebSocketMessage.Type.Invite> = async ({
      userId,
      roomId,
    }) =>
      showNotification(
        createInviteNotification(roomId, users[userId].nickname)
      );
    socket.messageReceiver.on(WebSocketMessage.Type.Invite, inviteListener);
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Invite, inviteListener);
    };
  }, [socket, users, showNotification]);

  useEffect(() => {
    if (socket === undefined) return;
    const listener: EventListener<WebSocketMessage.Type.Whisper> = ({
      sender,
      content,
    }) => {
      if (sender !== me.id && whisperDialogs[sender] === undefined)
        showNotification(
          createWhisperNotification(
            users[sender],
            appendWhisperLog(sender, { sender, content })
          )
        );
    };
    socket.messageReceiver.on(WebSocketMessage.Type.Whisper, listener);
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Whisper, listener);
    };
  }, [socket, users, whisperDialogs, whisperLogs, showNotification]);

  return (
    <article id="main">
      <div id="game">
        <div id="intro" ref={$intro}>
          <img className="image" src="/media/img/kkutu/intro.png" />
          <div className="version">{props.version}</div>
          <div className="text">{L.get("welcome")}</div>
        </div>
        {me ? (
          <>
            <Menu />
            <div id="box-grid">
              {room === undefined ? (
                <div className="lobby">
                  <UserList.Box server={server} />
                  <List.Box />
                </div>
              ) : room.isGaming ? (
                <div className="game">
                  <Game.Box />
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
    </article>
  );
}
Bind(Component);
