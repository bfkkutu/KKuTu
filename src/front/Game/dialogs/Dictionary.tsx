import React, { useState } from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class DictionaryDialog extends Dialog {
  public static instance = new DictionaryDialog();

  public override head(): React.ReactElement {
    return <>{L.render("dictionary_title")}</>;
  }
  public override body(): React.ReactElement {
    const socket = useStore((state) => state.socket);
    const [input, setInput] = useState("");
    const [result, setResult] = useState<Database.Word | undefined>(undefined);

    return (
      <div className="dialog-dictionary">
        <div className="body">
          <div>
            <h4>{L.get("dictionary_input")}</h4>
            <input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder={L.get("dictionary_input_placeholder")}
            />
          </div>
          <ul>
            {result === undefined ? (
              <li>{L.get("dictionary_notFound")}</li>
            ) : (
              Object.entries(result.means).map(([theme, mean]) => {
                const display = L.get(`theme_${theme}`);
                if (display.length === 0) {
                  return null;
                }
                return (
                  <li>
                    <strong>{display}</strong>
                    {mean}
                  </li>
                );
              })
            )}
          </ul>
        </div>
        <div className="footer">
          <button
            onClick={async () => {
              socket.send(WebSocketMessage.Type.Dictionary, { content: input });
              try {
                setResult(
                  await socket.messageReceiver.wait(
                    WebSocketMessage.Type.Dictionary
                  )
                );
              } catch (e) {
                setResult(undefined);
              }
            }}
          >
            {L.get("search")}
          </button>
        </div>
      </div>
    );
  }
}
