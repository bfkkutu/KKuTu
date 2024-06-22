import DB from "back/utils/Database";
import WebSocketServer from "back/utils/WebSocketServer";
import { Database } from "../../common/Database";

import User from "back/models/User";

export default class DatabaseWordServer extends WebSocketServer {
  public static instance: DatabaseWordServer;

  constructor(port: number, isSecure: boolean = false) {
    super(port, isSecure);

    this.on("connection", async (socket, req) => {
      if (req.session.profile === undefined) {
        return socket.close();
      }

      const user = await DB.Manager.createQueryBuilder(User, "u")
        .where("u.oid = :oid", {
          oid: req.session.profile.id,
        })
        .getOne();
      if (user === null) {
        return socket.close();
      }
      if (!(user.departures & Database.Departure.DatabaseWord)) {
        return socket.close();
      }
    });
  }
}
