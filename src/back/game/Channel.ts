import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { Logger } from "back/utils/Logger";

import User from "back/models/User";

export default class Channel extends WebSocketServer {
  public static instances: Channel[] = [];
  /**
   * 이 채널에 접속 중인 유저 맵.
   */
  private users = new Map<string, User<true>>();
  /**
   * 이 채널에 만들어진 방 맵.
   */
  private rooms = new Map<number, Room>();

  constructor(port: number, isSecure: boolean = false) {
    super(port, isSecure);

    this.on("connection", async (socket, req) => {
      if (req.session.profile === undefined) {
        socket.sendError(WebSocketError.Type.Unauthorized, {});
        socket.close();
        return;
      }
      const user = await DB.Manager.createQueryBuilder(User<true>, "u")
        .where("u.oid = :oid", {
          oid: req.session.profile.id,
        })
        .getOne();
      if (user === null) return socket.close();
      this.users.set(user.id, user);
      user.socket = socket;
      socket.on("message", (raw) => {
        const message: WebSocketMessage.Client[WebSocketMessage.Type] =
          JSON.parse(raw.toString());
        switch (message.type) {
        }
      });
      socket.on("close", () => {
        this.users.delete(user.id);
        Logger.info(`User #${user.id} left.`).out();
      });
      Logger.info(`New user #${user.id}.`).out();
      socket.send(WebSocketMessage.Type.Initialize, {
        me: user.serialize(),
        users: Array.from(this.users.values())
          .filter((u) => u.id !== user.id)
          .map((user) => user.summarize()),
      });
    });
  }

  public getActiveUserCount(): number {
    return this.users.size;
  }
}
