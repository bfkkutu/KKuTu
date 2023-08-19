import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { Logger } from "back/utils/Logger";
import { fillWithDefaults } from "back/utils/Utility";
import { Database } from "../../common/Database";

import User from "back/models/User";
import FriendRequest from "back/models/FriendRequest";

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
      await user.updateCommunity(false);
      socket.on("message", async (raw) => {
        const message: WebSocketMessage.Client[WebSocketMessage.Type] =
          JSON.parse(raw.toString());
        switch (message.type) {
          case WebSocketMessage.Type.UpdateSettings:
            Object.assign(user.settings, message.settings);
            await DB.Manager.save(user);
            socket.send(WebSocketMessage.Type.UpdateSettings, {});
            break;
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
          case WebSocketMessage.Type.FriendRequest:
            {
              const target =
                this.users.get(message.target) ||
                (await DB.Manager.createQueryBuilder(User<false>, "u")
                  .where("u.id = :id", { id: message.target })
                  .getOne());
              if (target === null) return;
              const friendRequest = new FriendRequest();
              friendRequest.sender = user.id;
              friendRequest.target = message.target;
              await DB.Manager.save(friendRequest);
              socket.send(WebSocketMessage.Type.FriendRequest, {});
              await user.updateCommunity();
              await target.updateCommunity();
            }
            break;
          case WebSocketMessage.Type.FriendRequestResponse:
            {
              const friendRequest = await DB.Manager.createQueryBuilder(
                FriendRequest,
                "fr"
              )
                .where("fr.sender = :id", { id: message.sender })
                .getOne();
              if (friendRequest === null || friendRequest.target !== user.id)
                return;
              const sender =
                this.users.get(friendRequest.sender) ||
                (await DB.Manager.createQueryBuilder(User<false>, "u")
                  .where("u.id = :id", { id: friendRequest.sender })
                  .getOne());
              if (sender === null) return;
              await DB.Manager.remove(friendRequest);
              if (message.accept) {
                user.friends.push(sender.id);
                sender.friends.push(user.id);
                await DB.Manager.save([user, sender]);
              }
              await user.updateCommunity();
              await sender.updateCommunity();
            }
            break;
          case WebSocketMessage.Type.QueryUser:
            {
              const target =
                this.users.get(message.userId) ||
                (await DB.Manager.createQueryBuilder(User<false>, "u")
                  .where("u.id = :id", { id: message.userId })
                  .getOne());
              if (target === null)
                return socket.send(WebSocketMessage.Type.QueryUser, {});
              socket.send(WebSocketMessage.Type.QueryUser, {
                user: target.summarize(),
              });
            }
            break;
        }
      });
      socket.on("close", () => {
        this.users.delete(user.id);
        Logger.info(`User #${user.id} left.`).out();
        this.broadcast(WebSocketMessage.Type.Leave, {
          userId: user.id,
        });
      });
      Logger.info(`User #${user.id} joined.`).out();
      socket.send(WebSocketMessage.Type.Initialize, {
        me: user.serialize(),
        community: user.community,
        users: Array.from(this.users.values()).map((user) => user.summarize()),
      });
      this.broadcast(
        WebSocketMessage.Type.Join,
        { user: user.summarize() },
        (client) => client.uid !== user.id
      );
    });
  }

  public getActiveUserCount(): number {
    return this.users.size;
  }
}
