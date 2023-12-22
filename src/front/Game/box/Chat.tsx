import React, { useState, useRef, useEffect, useCallback } from "react";
import { Parser as HTMLParser } from "html-to-react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import AudioContext from "front/@global/AudioContext";
import { ChatType } from "front/@global/enums/ChatType";
import { createProfileDialog } from "front/Game/dialogs/Profile";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Chat as ChatData } from "../../../common/interfaces/Chat";
import { WebSocketMessage } from "../../../common/WebSocket";

export namespace Chat {
  const htmlParser = HTMLParser();

  export function Box() {
    const socket = useStore((state) => state.socket);
    const blackList = useStore((state) => state.community.blackList);
    const [chatLog, appendChat] = useStore((state) => [
      state.chatLog,
      state.appendChat,
    ]);
    const [content, setContent] = useState("");
    const $input = useRef<HTMLTextAreaElement>(null);
    const $list = useRef<HTMLDivElement>(null);

    const send = useCallback(() => {
      if (content.trim() === "") return;
      socket.send(WebSocketMessage.Type.Chat, {
        content,
      });
      setContent("");
      $input.current?.focus();
    }, [socket, content]);
    const audioContext = AudioContext.instance;

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Chat, (message) => {
        if (blackList.includes(message.sender)) return;
        audioContext.playEffect("chat");
        appendChat(message.sender, message.content);
      });
      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Chat);
      };
    }, [blackList]);

    useEffect(() => {
      if ($input.current)
        $input.current.onkeydown = (e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter")
            if (!e.shiftKey) {
              e.preventDefault();
              send();
            }
        };
      return () => {
        if ($input.current) $input.current.onkeydown = null;
      };
    }, [send]);

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
                <Head {...chat} />
                <div className="content">
                  {htmlParser.parse(chat.content.replaceAll("\n", "<br>"))}
                </div>
                <div className="timestamp">
                  {chat.receivedAt.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <textarea
            className="input-chat"
            maxLength={200}
            value={content}
            ref={$input}
            onChange={(e) => setContent(e.currentTarget.value)}
          />
          <button type="button" className="button-send" onClick={send}>
            {L.get("send")}
          </button>
        </div>
      </section>
    );
  }

  function Head(chat: ChatData) {
    const users = useStore((state) => state.users);

    switch (chat.type) {
      case ChatType.Chat: {
        const ProfileDialog = createProfileDialog(users[chat.sender]);
        const toggle = Dialog.useStore((state) => state.toggle);

        return (
          <div className="head ellipse" onClick={() => toggle(ProfileDialog)}>
            {users[chat.sender].nickname}
          </div>
        );
      }
      case ChatType.Notice:
        return <div className="head head-notice ellipse">{L.get("alert")}</div>;
    }
  }
}
