import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";

import User from "back/models/User";

export default class Channel extends WebSocketServer {
  public static instances: Channel[] = [];
  /**
   * 이 채널에 접속 중인 유저 맵.
   */
  private users = new Map<number, User<true>>();
  /**
   * 이 채널에 만들어진 방 맵.
   */
  private rooms = new Map<number, Room>();

  constructor(port: number, isSecure: boolean = false) {
    super(port, isSecure);

    this.on("connection", async (socket, req) => {
      if (req.session.profile === undefined) {
        socket.sendError(WebSocketError.Type.Unauthenticated, {});
        socket.close();
        return;
      }
      const user =
        (await DB.Manager.createQueryBuilder(User<true>, "u")
          .where("u.auth.id == :id:", { id: req.session.profile.id })
          .getOne()) || new User<true>();
      const isFirstConnection = user.nickname === null;
      this.users.set(user.id, user);
      user.socket = socket;
      if (isFirstConnection) {
        user.auth = {
          type: req.session.profile.authType,
          id: req.session.profile.id,
        };
        socket.send(WebSocketMessage.Type.Agreement, {
          nickname: req.session.profile.name,
          exordial: req.session.profile.exordial,
        });
        await DB.Manager.save(user);
      }
      console.log(user);
    });
  }

  public getActiveUserCount(): number {
    return this.users.size;
  }
}
