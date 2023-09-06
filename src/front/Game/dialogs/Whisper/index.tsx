import React, { useState, useEffect } from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { Database } from "common/Database";
import { WebSocketMessage } from "../../../../common/WebSocket";

export const createWhisperDialog = (user: Database.SummarizedUser) =>
  new DialogTuple(
    () => <>{L.render("whisper_title", user.nickname)}</>,
    () => {
      const socket = useStore((state) => state.socket);
      const id = useStore((state) => state.me.id);
      const [content, setContent] = useState("");

      return (
        <div className="dialog-whisper">
          <div className="body">
            <ul className="log">
              <li className="item">STYLE TEST</li>
              <li className="item">TEST ITEM</li>
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
