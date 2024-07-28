import React, { useCallback, useEffect, useRef, useState } from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";
import { useSocket } from "front/KKuTu/Store";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class DictionaryDialog extends Dialog {
  public static readonly instance = new DictionaryDialog();

  protected override head(): React.ReactElement {
    return <>{L.render("dictionary_title")}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useSocket((state) => state.socket);
    const [input, setInput] = useState("");
    const [result, setResult] = useState<Database.Word | undefined>(undefined);

    const $ = useRef<HTMLInputElement>(null);

    const search = useCallback(async () => {
      socket.send(WebSocketMessage.Type.Dictionary, { content: input });
      try {
        const res = await socket.messageReceiver.wait(
          WebSocketMessage.Type.Dictionary
        );
        setResult(res.word);
      } catch (e) {
        setResult(undefined);
      }
    }, [input]);

    useEffect(() => {
      if ($.current === null) {
        return;
      }

      $.current.onkeydown = (e) => {
        if (e.code === "Enter" || e.code === "NumpadEnter") {
          if (e.isComposing) {
            return;
          }
          e.preventDefault();
          search();
        }
      };

      return () => {
        if ($.current === null) {
          return;
        }

        $.current.onkeydown = null;
      };
    }, [search]);

    return (
      <div className="dialog-dictionary">
        <div className="body">
          <div>
            <h4>{L.get("dictionary_input")}</h4>
            <input
              ref={$}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder={L.get("dictionary_input_placeholder")}
            />
          </div>
          <ul>
            {result === undefined ? (
              <li>{L.get("dictionary_notFound")}</li>
            ) : (
              Object.entries(result.means).map(([theme, means], index) => {
                const display = L.get(`theme_${theme}`);
                return (
                  <li key={index} className="item">
                    {display.length === 0 ? null : (
                      <label className="theme">{display}</label>
                    )}
                    {means.length === 0 ? null : means.length === 1 ? (
                      means[0]
                    ) : (
                      <ol type="1">
                        {means.map((mean, index) => (
                          <li key={index}>{mean}</li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
        <div className="footer buttons">
          <button onClick={() => search()}>{L.get("search")}</button>
        </div>
      </div>
    );
  }
}

