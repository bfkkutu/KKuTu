import React, { useState, useRef, useEffect, useCallback } from "react";
import { Parser as HTMLParser } from "html-to-react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import AudioContext from "front/@global/AudioContext";
import { createProfileDialog } from "front/Game/dialogs/Profile";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Chat as ChatCommon } from "../../../common/Chat";
import { WebSocketMessage } from "../../../common/WebSocket";

export namespace Chat {
  const htmlParser = HTMLParser();

  export function Box() {
    const socket = useStore((state) => state.socket);
    const id = useStore((state) => state.me.id);
    const [chatLog, appendChat, toggleChatVisibility] = useStore((state) => [
      state.chatLog,
      state.appendChat,
      state.toggleChatVisibility,
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
        audioContext.playEffect("chat");
        appendChat(message.sender, message.content);
      });
      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Chat);
      };
    }, []);

    useEffect(() => {
      if ($input.current)
        $input.current.onkeydown = (e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            if (!e.shiftKey) {
              e.preventDefault();
              send();
            }
          }
        };
      return () => {
        if ($input.current) {
          $input.current.onkeydown = null;
        }
      };
    }, [send]);

    useEffect(() => {
      if ($list.current) {
        $list.current.scrollTop = $list.current.scrollHeight;
      }
    }, [chatLog]);

    return (
      <section id="box-chat" className="product">
        <h5 className="product-title">{L.render("chatBox_title")}</h5>
        <div className="product-body">
          <div className="list" ref={$list}>
            {chatLog.map((chat, index) => (
              <div key={index} className={`item ${chat.type}`}>
                {/* float: left */}
                <Head {...chat} />
                <Body {...chat} />

                {/* float: right */}
                <div className="timestamp">
                  {chat.receivedAt.toLocaleTimeString()}
                </div>
                {chat.type === ChatCommon.Type.Chat && chat.sender !== id ? (
                  <>
                    <button className="report" onClick={() => {}}>
                      {L.render("icon_report")}
                    </button>
                    <button
                      className="visible-toggle"
                      onClick={() => toggleChatVisibility(index)}
                    >
                      {chat.visible
                        ? L.render("icon_hide")
                        : L.render("icon_show")}
                    </button>
                  </>
                ) : null}
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

  function Head(chat: ChatCommon.Item) {
    switch (chat.type) {
      case ChatCommon.Type.Chat: {
        const users = useStore((state) => state.users);
        const socket = useStore((state) => state.socket);
        const toggle = Dialog.useStore((state) => state.toggle);

        return (
          <div
            className="head ellipse"
            onClick={async () => {
              const sender =
                chat.sender in users
                  ? users[chat.sender]
                  : await socket.queryUser(chat.sender);
              if (sender === undefined) {
                window.alert(L.get("error_404"));
                return;
              }
              toggle(createProfileDialog(sender));
            }}
          >
            {chat.nickname}
          </div>
        );
      }
      case ChatCommon.Type.Notice:
        return <div className="head head-notice ellipse">{L.get("alert")}</div>;
    }
  }
  function Body(chat: ChatCommon.Item) {
    switch (chat.type) {
      case ChatCommon.Type.Chat:
        if (!chat.visible) {
          return (
            <div className="content invisible">
              {L.get("notice_chatInvisible")}
            </div>
          );
        }
        break;
    }
    return (
      <div className="content">
        {htmlParser.parse(chat.content.replaceAll("\n", "<br>"))}
      </div>
    );
  }
}
