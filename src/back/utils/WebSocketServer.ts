import http from "http";
import https from "https";
import { WebSocketServer as _WebSocketServer } from "ws";
import Express from "express";
import qs from "qs";

import { SECURE_OPTIONS } from "back/utils/Secure";
import WebSocket from "back/utils/WebSocket";
import { redisStore } from "back/utils/ExpressSession";

type IncomingMessage = Omit<typeof http.IncomingMessage, "constructor"> &
  Express.Request & {
    new (socket: NodeJS.Socket): IncomingMessage;
  };

export default class WebSocketServer extends _WebSocketServer<
  typeof WebSocket,
  IncomingMessage
> {
  private app: Express.Application;

  constructor(port: number, isSecure: boolean = false) {
    const app = Express();
    const server = isSecure
      ? https.createServer(SECURE_OPTIONS, app)
      : http.createServer(app);
    super({
      server,
      WebSocket,
    });

    for (const listener of server.listeners("upgrade"))
      server.off("upgrade", listener as any);
    server.on("upgrade", async (req: IncomingMessage, socket, head) => {
      req.query = qs.parse(req.url.slice(2));
      req.session = await redisStore.get(req.query.sid as string);
      this.handleUpgrade(req, socket, head, (ws) =>
        this.emit("connection", ws, req)
      );
    });

    this.app = app;
    server.listen(port);
  }
}
