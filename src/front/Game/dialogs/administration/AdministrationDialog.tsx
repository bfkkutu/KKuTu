import React, { useEffect, useState } from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";
import WebSocket from "front/@global/WebSocket";

export default abstract class AdministrationDialog extends Dialog {
  private url: string;
  protected socket?: WebSocket;

  constructor(url: string) {
    super(() => {
      if (this.socket === undefined) {
        return;
      }
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
    });

    this.url = url;
  }

  public override head(): React.ReactElement {
    return <>{L.render("administration_title")}</>;
  }
  public override body(): React.ReactElement {
    const [socket, setSocket] = useState<WebSocket>();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
      const socket = new WebSocket(this.url);
      socket.on("open", () => setConnected(true));
      socket.on("close", () => setConnected(false));
      this.socket = socket;
      setSocket(socket);
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }, []);

    if (socket === undefined || !connected) {
      return <p>{L.get("administration_connecting")}</p>;
    }
    if (!connected) {
      return <p>{L.get("administration_closed")}</p>;
    }

    return <></>;
  }
}
