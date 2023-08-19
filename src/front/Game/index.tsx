import React, { useEffect, useRef } from "react";

import Bind from "front/ReactBootstrap";
import { Nest } from "common/Nest";
import { WebSocketMessage } from "../../common/WebSocket";
import L from "front/@global/Language";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import AudioContext from "front/@global/AudioContext";
import { Menu } from "front/Game/Menu";
import { useStore } from "front/Game/Store";
import { getRequiredScore } from "front/@global/Utility";

import UserListBox from "front/Game/box/UserList";
import ProfileBox from "front/Game/box/Profile";
import ChatBox from "front/Game/box/Chat";
import RoomListBox from "front/Game/box/RoomList";

CLIENT_SETTINGS.expTable.push(getRequiredScore(1));
for (let i = 2; i < CLIENT_SETTINGS.maxLevel; i++)
  CLIENT_SETTINGS.expTable.push(
    CLIENT_SETTINGS.expTable[i - 2] + getRequiredScore(i)
  );
CLIENT_SETTINGS.expTable[CLIENT_SETTINGS.maxLevel - 1] = Infinity;
CLIENT_SETTINGS.expTable.push(Infinity);

function Game(props: Nest.Page.Props<"Game">) {
  const initializeSocket = useStore((state) => state.initializeSocket);
  const [me, updateMe] = useStore((state) => [state.me, state.updateMe]);
  const updateCommunity = useStore((state) => state.updateCommunity);
  const appendChat = useStore((state) => state.appendChat);
  const [initializeUsers, appendUser, removeUser] = useStore((state) => [
    state.initializeUsers,
    state.appendUser,
    state.removeUser,
  ]);
  const server = parseInt(props.path.match(/\/game\/(.*)/)![1]);
  const audioContext = AudioContext.instance;

  const $intro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = initializeSocket(props.data.wsUrl);
    socket.on("open", () => {});
    socket.on("message", async (raw) => {
      const message: WebSocketMessage.Server[WebSocketMessage.Type] =
        JSON.parse(raw.data);
      console.log(message);

      switch (message.type) {
        case WebSocketMessage.Type.Initialize:
          for (const [id, src] of Object.entries(CLIENT_SETTINGS.sound))
            if (!(await audioContext.register(id, `/media/sound${src}`)))
              alert(L.get("error_soundNotFound", id));
          audioContext.volume = message.me.settings.bgmVolume;
          audioContext.play(`lobby_${message.me.settings.lobbyMusic}`, true);
          updateMe(message.me);
          updateCommunity(message.community);
          initializeUsers(message.users);
          const intro = $intro.current!;
          intro.style.opacity = "0";
          window.setTimeout(() => intro.remove(), 2000);
          break;
        case WebSocketMessage.Type.UpdateCommunity:
          updateCommunity(message.community);
          break;
        case WebSocketMessage.Type.Join:
          appendUser(message.user);
          break;
        case WebSocketMessage.Type.Leave:
          removeUser(message.userId);
          break;
        case WebSocketMessage.Type.Chat:
          audioContext.playEffect("chat");
          appendChat({
            sender: message.sender,
            content: message.content,
            receivedAt: new Date(),
          });
          break;
        case WebSocketMessage.Type.Error:
          alert(L.get(`error_${message.errorType}`));
          break;
      }
    });
    socket.on("close", (e) => {
      alert(L.get("error_closed", e.code));
    });
  }, []);

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
            <div id="box-grid" className="lobby">
              <UserListBox server={server} />
              <RoomListBox />
              <ProfileBox />
              <ChatBox />
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}
Bind(Game);
