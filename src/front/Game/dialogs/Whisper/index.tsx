import React, { useState, useEffect, useRef, useCallback } from "react";

import L from "front/@global/Language";
import DialogData from "front/@global/Bayadere/dialog/DialogData";
import { useStore } from "front/Game/Store";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../../../common/WebSocket";
import { useWhisperStore } from "front/Game/dialogs/Whisper/Store";
import ClassName from "front/@global/ClassName";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { EventListener } from "front/@global/WebSocket";

export const showWhisperDialog = (user: Database.SummarizedUser) => {
  const { openWhisper: open } = useWhisperStore.getState();
  const { show } = useDialogStore.getState();

  hideWhisperDialog(user);
  const dt = createWhisperDialog(user);
  open(user.id, dt);
  show(dt);
};
export const hideWhisperDialog = (user: Database.SummarizedUser) => {
  const { dialogs, closeWhisper: close } = useWhisperStore.getState();
  const { hide } = useDialogStore.getState();

  const dt = dialogs[user.id];
  if (dt !== undefined) {
    hide(dt);
    close(user.id);
  }
};
export const toggleWhisperDialog = (user: Database.SummarizedUser) => {
  const { dialogs } = useWhisperStore.getState();

  const dt = dialogs[user.id];
  if (dt === undefined) showWhisperDialog(user);
  else hideWhisperDialog(user);
};

export const createWhisperDialog = (user: Database.SummarizedUser) =>
  new DialogData(
    () => <>{L.render("whisper_title", user.nickname)}</>,
    () => {
      const socket = useStore((state) => state.socket);
      const [logs, appendLog] = useWhisperStore((state) => [
        state.logs[user.id],
        state.appendLog,
      ]);
      const [content, setContent] = useState("");
      const $input = useRef<HTMLInputElement>(null);

      const send = useCallback(() => {
        if (content === "") return;
        socket.send(WebSocketMessage.Type.Whisper, {
          target: user.id,
          content,
        });
        setContent("");
        $input.current?.focus();
      }, [content]);

      useEffect(() => {
        const listener: EventListener<WebSocketMessage.Type.Whisper> = ({
          sender,
          content,
        }) => {
          appendLog(user.id, { sender, content });
        };
        socket.messageReceiver.on(WebSocketMessage.Type.Whisper, listener);
        return () => {
          socket.messageReceiver.off(WebSocketMessage.Type.Whisper, listener);
        };
      }, []);

      useEffect(() => {
        if ($input.current)
          $input.current.onkeydown = (e) => {
            if (e.code === "Enter" || e.code === "NumpadEnter") send();
          };
        return () => {
          if ($input.current) $input.current.onkeydown = null;
        };
      }, [content]);

      return (
        <div className="dialog-whisper">
          <ul className="body">
            {logs.map((v) => {
              const className = new ClassName("item");
              const fromOpposite = v.sender === user.id;
              className.push(fromOpposite ? "left" : "right");
              return (
                <li className={className.toString()}>
                  {fromOpposite ? (
                    <p className="sender">{user.nickname}</p>
                  ) : null}
                  <div className="content">{v.content}</div>
                </li>
              );
            })}
          </ul>
          <div className="footer">
            <input
              className="input-whisper"
              maxLength={200}
              value={content}
              ref={$input}
              onChange={(e) => setContent(e.currentTarget.value)}
            />
            <button type="button" className="button-send" onClick={send}>
              {L.get("send")}
            </button>
          </div>
        </div>
      );
    }
  );
