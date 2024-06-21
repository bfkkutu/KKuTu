import React, { useState, useEffect, useRef, useCallback } from "react";
import { create as createStoreHook } from "zustand";

import L from "front/@global/Language";
import ClassName from "front/@global/ClassName";
import { EventListener } from "front/@global/WebSocket";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { useStore as useGlobalStore } from "front/Game/Store";
import { Database } from "common/Database";
import { WebSocketError, WebSocketMessage } from "../../../common/WebSocket";
import { filterProfanities } from "front/@global/Utility";

export default class WhisperDialog extends Dialog {
  private user: Database.User.Summarized;

  constructor(user: Database.User.Summarized) {
    super(() => Whisper.useStore.getState().close(user.id));

    this.user = user;
  }

  public override head(): React.ReactElement {
    return <>{L.render("whisper_title", this.user.nickname)}</>;
  }
  public override body(): React.ReactElement {
    const socket = useGlobalStore((state) => state.socket);
    const censorshipEnabled = useGlobalStore(
      (state) => state.me.settings.chatCensorship
    );
    const [logs, append] = Whisper.useStore((state) => [
      state.logs[this.user.id],
      state.append,
    ]);
    const [content, setContent] = useState("");
    const $input = useRef<HTMLInputElement>(null);

    const send = useCallback(() => {
      if (content === "") {
        return;
      }
      socket.send(WebSocketMessage.Type.Whisper, {
        target: this.user.id,
        content,
      });
      setContent("");
      $input.current?.focus();
    }, [content]);

    useEffect(() => {
      const listener: EventListener<WebSocketMessage.Type.Whisper> = (
        whisper
      ) => {
        append(this.user.id, whisper);
      };
      socket.messageReceiver.on(WebSocketMessage.Type.Whisper, listener);
      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Whisper, listener);
      };
    }, []);

    useEffect(() => {
      if ($input.current) {
        $input.current.onkeydown = (e) => {
          if (e.code === "Enter" || e.code === "NumpadEnter") {
            if (e.isComposing) {
              return;
            }
            send();
          }
        };
      }
      return () => {
        if ($input.current) {
          $input.current.onkeydown = null;
        }
      };
    }, [send]);

    return (
      <div className="dialog-whisper">
        <ul className="body">
          {logs.map((v, index) => {
            const className = new ClassName("item");
            const fromOpposite = v.sender === this.user.id;
            className.push(fromOpposite ? "left" : "right");
            return (
              <li key={index} className={className.toString()}>
                {fromOpposite ? (
                  <p className="sender">{this.user.nickname}</p>
                ) : null}
                <div className="content-wrapper">
                  <div className="content">
                    {censorshipEnabled
                      ? filterProfanities(v.content)
                      : v.content}
                  </div>
                  {fromOpposite ? (
                    <button
                      className="report"
                      onClick={async () => {
                        if (
                          !(await window.confirm(
                            L.get("confirm_reportMessage")
                          ))
                        ) {
                          return;
                        }
                        socket.send(WebSocketMessage.Type.ReportWhisper, {
                          target: v.id,
                        });
                        try {
                          await socket.messageReceiver.wait(
                            WebSocketMessage.Type.ReportWhisper
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
                              window.alert(
                                L.get("error_alreadyReportedMessage")
                              );
                              break;
                          }
                        }
                      }}
                    >
                      {L.render("icon_report")}
                    </button>
                  ) : null}
                </div>
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
}

export namespace Whisper {
  interface State {
    open: (targetId: string, dt: Dialog) => void;
    close: (targetId: string) => void;

    dialogs: Table<Dialog | undefined>;

    logs: Table<Database.Whisper[]>;
    append: (userId: string, whisper: Database.Whisper) => number;
  }

  export const useStore = createStoreHook<State>((setState, getState) => ({
    open: (targetId, dt) =>
      setState(({ dialogs, logs }) => ({
        dialogs: { ...dialogs, [targetId]: dt },
        logs: { ...logs, [targetId]: logs[targetId] || [] },
      })),
    close: (targetId) =>
      setState(({ dialogs, logs }) => {
        if (dialogs[targetId] === undefined) return {};
        const R = { ...dialogs };
        delete R[targetId];
        return { dialogs: R, logs: { ...logs, [targetId]: [] } };
      }),

    dialogs: {},

    logs: {},
    append: (userId, whisper) => {
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

  export const show = (user: Database.User.Summarized) => {
    const { open } = useStore.getState();
    const { show } = Dialog.useStore.getState();

    hide(user);
    const dt = new WhisperDialog(user);
    open(user.id, dt);
    show(dt);
  };
  export const hide = (user: Database.User.Summarized) => {
    const { dialogs, close } = useStore.getState();
    const { hide } = Dialog.useStore.getState();

    const dt = dialogs[user.id];
    if (dt !== undefined) {
      hide(dt);
      close(user.id);
    }
  };
  export const toggle = (user: Database.User.Summarized) => {
    const { dialogs } = useStore.getState();

    const dt = dialogs[user.id];
    if (dt === undefined) show(user);
    else hide(user);
  };
}
