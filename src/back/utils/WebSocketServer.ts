import http from "http";
import https from "https";
import { WebSocketServer as SocketServer } from "ws";
import Express from "express";
import qs from "qs";

import { createSecureOptions } from "back/utils/Secure";
import WebSocket from "back/utils/WebSocket";
import { redisStore } from "back/utils/ExpressSession";
import { WebSocketMessage } from "common/WebSocket";
import ObjectMap from "common/ObjectMap";

type IncomingMessage = Omit<typeof http.IncomingMessage, "constructor"> &
  Express.Request & {
    new (socket: NodeJS.Socket): IncomingMessage;
  };

export default class WebSocketServer extends SocketServer<
  typeof WebSocket,
  IncomingMessage
> {
  private readonly app: Express.Application;

  constructor(port: number, isSecure: boolean = false) {
    const app = Express();
    const server = isSecure
      ? https.createServer(createSecureOptions(), app)
      : http.createServer(app);
    super({
      server,
      WebSocket,
    });

    for (const listener of server.listeners("upgrade")) {
      server.off("upgrade", listener as any);
    }
    server.on("upgrade", async (req: IncomingMessage, socket, head) => {
      req.query = qs.parse(req.url.slice(2));
      const sid = req.query.sid as string;
      req.session = await redisStore.get(sid);
      req.session.save = ((callback?: (err: any) => void) => {
        if (callback !== undefined) {
          redisStore.set(sid, req.session);
          return req.session;
        }
        return new Promise<void>((resolve, reject) =>
          redisStore.set(sid, req.session, (e) => (e ? reject(e) : resolve()))
        );
      }) as any;
      this.handleUpgrade(req, socket, head, (ws) =>
        this.emit("connection", ws, req)
      );
    });

    this.app = app;
    server.listen(port);
  }

  public broadcast<T extends WebSocketMessage.Type>(
    type: T,
    content: WebSocketMessage.Content.Server[T],
    filter?: (client: WebSocket) => boolean
  ) {
    for (const client of this.clients)
      if (filter === undefined || filter(client)) client.send(type, content);
  }
}
