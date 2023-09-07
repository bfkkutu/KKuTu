import React, { useState, useEffect } from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../../../common/WebSocket";
import { useWhisperStore } from "front/Game/dialogs/Whisper/Store";
import ClassName from "front/@global/ClassName";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";

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
  new DialogTuple(
    () => <>{L.render("whisper_title", user.nickname)}</>,
    () => {
      const socket = useStore((state) => state.socket);
      const [logs, appendLog] = useWhisperStore((state) => [
        state.logs,
        state.appendLog,
      ]);
      const [content, setContent] = useState("");

      useEffect(() => {
        socket.messageReceiver.on(WebSocketMessage.Type.Whisper, () => {});
        return () => {
          socket.messageReceiver.off(WebSocketMessage.Type.Whisper);
        };
      }, []);

      return (
        <div className="dialog-whisper">
          <div className="body">
            <ul className="log">
              {logs[user.id].map((v) => {
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
          </div>
          <div className="footer">
            <input
              className="input-whisper"
              maxLength={200}
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
            />
            <button type="button" className="button-send" onClick={() => {}}>
              {L.get("send")}
            </button>
          </div>
        </div>
      );
    }
  );
