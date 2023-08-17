import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { Logger } from "back/utils/Logger";
import { fillWithDefaults } from "back/utils/Utility";
import { Database } from "../../common/Database";

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
      if (req.session.profile === undefined) return socket.close();
      const user = await DB.Manager.createQueryBuilder(User<true>, "u")
        .where("u.oid = :oid", {
          oid: req.session.profile.id,
        })
        .getOne();
      if (user === null) return socket.close();
      socket.uid = user.id;
      fillWithDefaults(user.settings, Database.JSON.Defaults.User.settings); // 옵션이 나중에 추가될 경우 오류 방지.
      this.users.set(user.id, user);
      user.socket = socket;
      socket.on("message", async (raw) => {
        const message: WebSocketMessage.Client[WebSocketMessage.Type] =
          JSON.parse(raw.toString());
        switch (message.type) {
          case WebSocketMessage.Type.Chat:
            if (user.roomId === undefined)
              this.broadcast(
                WebSocketMessage.Type.Chat,
                {
                  sender: user.id,
                  content: message.content,
                },
                (client) => this.users.get(client.uid)?.roomId === undefined
              );
            else {
              const room = this.rooms.get(user.roomId);
              if (room === undefined) return;
              // broadcast to room
            }
            break;
          case WebSocketMessage.Type.UpdateSettings:
            Object.assign(user.settings, message.settings);
            await DB.Manager.save(user);
            socket.send(WebSocketMessage.Type.UpdateSettings, {});
            break;
        }
      });
      socket.on("close", () => {
        this.users.delete(user.id);
        Logger.info(`User #${user.id} left.`).out();
      });
      Logger.info(`New user #${user.id}.`).out();
      socket.send(WebSocketMessage.Type.Initialize, {
        me: user.serialize(),
        users: Array.from(this.users.values()).map((user) => user.summarize()),
      });
    });
  }

  public getActiveUserCount(): number {
    return this.users.size;
  }
}
