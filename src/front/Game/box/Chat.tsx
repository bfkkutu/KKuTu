import React, { useState, useRef, useEffect, useCallback } from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { WebSocketMessage } from "../../../common/WebSocket";
import AudioContext from "front/@global/AudioContext";
import { ChatType } from "front/@global/enums/ChatType";
import { Chat } from "front/@global/interfaces/Chat";

export default function ChatBox() {
  const socket = useStore((state) => state.socket);
  const [chatLog, appendChat] = useStore((state) => [
    state.chatLog,
    state.appendChat,
  ]);
  const [content, setContent] = useState("");
  const $chatInput = useRef<HTMLInputElement>(null);
  const $list = useRef<HTMLDivElement>(null);
  const send = useCallback(() => {
    if (content === "") return;
    socket.send(WebSocketMessage.Type.Chat, {
      content,
    });
    setContent("");
    $chatInput.current?.focus();
  }, [socket, content]);
  const audioContext = AudioContext.instance;

  useEffect(() => {
    socket.messageReceiver.on(WebSocketMessage.Type.Chat, (message) => {
      audioContext.playEffect("chat");
      appendChat(message.sender, message.content);
    });
    return () => {
      socket.messageReceiver.off(WebSocketMessage.Type.Chat);
    };
  }, []);

  useEffect(() => {
    if ($chatInput.current)
      $chatInput.current.onkeydown = (e) => {
        if (e.code === "Enter" || e.code === "NumpadEnter") send();
      };
    return () => {
      if ($chatInput.current) $chatInput.current.onkeydown = null;
    };
  }, [$chatInput.current, send]);

  useEffect(() => {
    if ($list.current) $list.current.scrollTop = $list.current.scrollHeight;
  }, [chatLog]);

  return (
    <section id="box-chat" className="product">
      <h5 className="product-title">{L.render("chatBox_title")}</h5>
      <div className="product-body">
        <div className="list" ref={$list}>
          {chatLog.map((chat) => (
            <div className={`item ${chat.type}`}>
              <ChatHead {...chat} />
              <div className="content">{chat.content}</div>
              <div className="timestamp">
                {chat.receivedAt.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
        <input
          className="input-chat"
          maxLength={200}
          value={content}
          ref={$chatInput}
          onChange={(e) => setContent(e.currentTarget.value)}
        />
        <button type="button" className="button-send" onClick={send}>
          {L.get("send")}
        </button>
      </div>
    </section>
  );
}

function ChatHead(chat: Chat) {
  const users = useStore((state) => state.users);

  switch (chat.type) {
    case ChatType.Chat:
      return <div className="head ellipse">{users[chat.sender].nickname}</div>;
    case ChatType.Notice:
      return <div className="head head-notice ellipse">{L.get("alert")}</div>;
  }
}
