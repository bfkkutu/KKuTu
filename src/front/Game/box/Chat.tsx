import React, { useState, useRef, useEffect, useCallback } from "react";
import { Parser as HTMLParser } from "html-to-react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import AudioContext from "front/@global/AudioContext";
import ProfileDialog from "front/Game/dialogs/Profile";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { filterProfanities } from "front/@global/Utility";
import { Chat as ChatCommon } from "../../../common/Chat";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";

export namespace Chat {
  const htmlParser = HTMLParser();

  export function Box() {
    const socket = useStore((state) => state.socket);
    const [chatLog, appendChat] = useStore((state) => [
      state.chatLog,
      state.appendChat,
    ]);
    const [content, setContent] = useState("");
    const $input = useRef<HTMLTextAreaElement>(null);
    const $list = useRef<HTMLDivElement>(null);

    const send = useCallback(() => {
      if (content.trim() === "") {
        return;
      }
      socket.send(WebSocketMessage.Type.Chat, {
        content,
      });
      setContent("");
      $input.current?.focus();
    }, [socket, content]);

    const audioContext = AudioContext.instance;

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Chat, (chat) => {
        audioContext.playEffect("chat");
        appendChat(chat);
      });
      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Chat);
      };
    }, []);

    useEffect(() => {
      if ($input.current) {
        $input.current.onkeydown = (e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            if (e.isComposing) {
              return;
            }
            if (!e.shiftKey) {
              e.preventDefault();
              send();
            }
          }
        };
      }
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
            {chatLog.map((chat, index) => {
              switch (chat.type) {
                case ChatCommon.Type.Chat:
                  return <Chat key={index} id={index} chat={chat} />;
                case ChatCommon.Type.Notice:
                  return <Notice {...chat} key={index} />;
              }
            })}
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

  interface Props {
    id: number;
    chat: ChatCommon.Chat;
  }
  function Chat(props: Props) {
    const id = useStore((state) => state.me.id);
    const filterEnabled = useStore(
      (state) => state.me.settings.filterProfanities
    );
    const users = useStore((state) => state.users);
    const socket = useStore((state) => state.socket);
    const toggleChatVisibility = useStore(
      (state) => state.toggleChatVisibility
    );
    const [content, setContent] = useState("");
    const toggle = Dialog.useStore((state) => state.toggle);

    useEffect(() => {
      const content = props.chat.content.replaceAll("\n", "<br>");
      setContent(filterEnabled ? filterProfanities(content) : content);
    }, [filterEnabled]);

    return (
      <div className="item chat">
        {/* float: left */}
        <div
          className="head ellipse"
          onClick={async () => {
            const sender =
              props.chat.sender in users
                ? users[props.chat.sender]
                : await socket.queryUser(props.chat.sender);
            if (sender === undefined) {
              window.alert(L.get("error_404"));
              return;
            }
            toggle(new ProfileDialog(sender));
          }}
        >
          {props.chat.nickname}
        </div>
        {props.chat.visible ? (
          <div className="content">{htmlParser.parse(content)}</div>
        ) : (
          <div className="content invisible">
            {L.get("notice_chatInvisible")}
          </div>
        )}

        {/* float: right */}
        <div className="timestamp">
          {new Date(props.chat.createdAt).toLocaleTimeString()}
        </div>
        {props.chat.type === ChatCommon.Type.Chat &&
        props.chat.sender !== id ? (
          <div className="buttons">
            <button
              className="report"
              onClick={async () => {
                if (!(await window.confirm(L.get("confirm_reportMessage")))) {
                  return;
                }
                socket.send(WebSocketMessage.Type.ReportChat, {
                  target: props.chat.id,
                });
                try {
                  await socket.messageReceiver.wait(
                    WebSocketMessage.Type.ReportChat
                  );
                  window.alert(L.get("alert_reportSubmitted"));
                } catch (e) {
                  const { errorType } =
                    e as WebSocketError.Message[WebSocketError.Type];
                  switch (errorType) {
                    case WebSocketError.Type.NotFound:
                      window.alert(L.get("error_404"));
                      break;
                    case WebSocketError.Type.Conflict:
                      window.alert(L.get("error_alreadyReportedMessage"));
                      break;
                  }
                }
              }}
            >
              {L.render("icon_report")}
            </button>
            <button
              className="visible-toggle"
              onClick={() => toggleChatVisibility(props.id)}
            >
              {props.chat.visible
                ? L.render("icon_hide")
                : L.render("icon_show")}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  function Notice(notice: ChatCommon.Notice) {
    return (
      <div className="item notice">
        {/* float: left */}
        <div className="head head-notice ellipse">{L.get("alert")}</div>
        <div className="content">
          {htmlParser.parse(notice.content.replaceAll("\n", "<br>"))}
        </div>

        {/* float: right */}
        <div className="timestamp">{notice.createdAt.toLocaleTimeString()}</div>
      </div>
    );
  }
}
