import React, { useState, useEffect, useRef, useCallback } from "react";
import { create as createStoreHook } from "zustand";

import L from "front/@global/Language";
import ClassName from "front/@global/ClassName";
import { EventListener } from "front/@global/WebSocket";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { useStore as useGlobalStore } from "front/Game/Store";
import { Database } from "../../../common/Database";
import { WebSocketMessage } from "../../../common/WebSocket";
import { Whisper as WhisperData } from "common/interfaces/Whisper";

export namespace WhisperDialog {
  interface State {
    openWhisper: (targetId: string, dt: Dialog) => void;
    closeWhisper: (targetId: string) => void;

    dialogs: Table<Dialog | undefined>;

    logs: Table<WhisperData[]>;
    appendLog: (userId: string, whisper: WhisperData) => number;
  }

  export const useStore = createStoreHook<State>((setState, getState) => ({
    openWhisper: (targetId, dt) =>
      setState(({ dialogs, logs }) => ({
        dialogs: { ...dialogs, [targetId]: dt },
        logs: { ...logs, [targetId]: logs[targetId] || [] },
      })),
    closeWhisper: (targetId) =>
      setState(({ dialogs, logs }) => {
        if (dialogs[targetId] === undefined) return {};
        const R = { ...dialogs };
        delete R[targetId];
        return { dialogs: R, logs: { ...logs, [targetId]: [] } };
      }),

    dialogs: {},

    logs: {},
    appendLog: (userId, whisper) => {
      const { logs } = getState();
      const R = [whisper];
      if (Array.isArray(logs[userId])) R.push(...logs[userId]);
      setState(() => {
        if (R.length > 100) R.pop();
        return {
          logs: { ...logs, [userId]: R },
        };
      });
      return R.length;
    },
  }));

  export const show = (user: Database.SummarizedUser) => {
    const { openWhisper: open } = useStore.getState();
    const { show } = Dialog.useStore.getState();

    hide(user);
    const dt = create(user);
    open(user.id, dt);
    show(dt);
  };
  export const hide = (user: Database.SummarizedUser) => {
    const { dialogs, closeWhisper: close } = useStore.getState();
    const { hide } = Dialog.useStore.getState();

    const dt = dialogs[user.id];
    if (dt !== undefined) {
      hide(dt);
      close(user.id);
    }
  };
  export const toggle = (user: Database.SummarizedUser) => {
    const { dialogs } = useStore.getState();

    const dt = dialogs[user.id];
    if (dt === undefined) show(user);
    else hide(user);
  };

  export const create = (user: Database.SummarizedUser) =>
    new Dialog(L.render("whisper_title", user.nickname), () => {
      const socket = useGlobalStore((state) => state.socket);
      const [logs, appendLog] = useStore((state) => [
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
    });
}
