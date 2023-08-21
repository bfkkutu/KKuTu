import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { Logger } from "back/utils/Logger";
import { fillWithDefaults } from "back/utils/Utility";
import { Database } from "../../common/Database";
import { Game } from "common/Game";
import SerializableMap from "../../common/SerializableMap";

import User from "back/models/User";
import FriendRequest from "back/models/FriendRequest";

export default class Channel extends WebSocketServer {
  public static instances: Channel[] = [];
  /**
   * 이 채널에 접속 중인 유저 맵.
   */
  private users = new SerializableMap<string, User<true>>();
  /**
   * 이 채널에 만들어진 방 맵.
   */
  private rooms = new SerializableMap<number, Room>();

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
          case WebSocketMessage.Type.Initialize:
            socket.send(WebSocketMessage.Type.UpdateCommunity, {
              community: user.community,
            });
            socket.send(WebSocketMessage.Type.UpdateRoomList, {
              rooms: this.rooms.serialize(),
            });
            break;
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
              room.broadcast(WebSocketMessage.Type.Chat, {
                sender: user.id,
                content: message.content,
              });
            }
            break;
          case WebSocketMessage.Type.CreateRoom:
            {
              let id = 99;
              while (this.rooms.get(++id));
              const room = new Room(id, socket.uid, message.room);
              this.rooms.set(id, room);
              user.roomId = id;
              socket.send(WebSocketMessage.Type.CreateRoom, {
                room: room.serialize(),
              });
              this.broadcast(
                WebSocketMessage.Type.UpdateRoomList,
                {
                  rooms: this.rooms.serialize(),
                },
                (client) => {
                  const user = this.users.get(client.uid);
                  return user !== undefined && user.roomId === undefined;
                }
              );
            }
            break;
          case WebSocketMessage.Type.LeaveRoom:
            {
              if (user.roomId === undefined) return;
              const room = this.rooms.get(user.roomId);
              if (room === undefined) return;
              room.remove(socket);
              if (room.isEmpty) this.rooms.delete(room.id);
              socket.send(WebSocketMessage.Type.LeaveRoom, {});
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
        if (user.roomId !== undefined) {
          const room = this.rooms.get(user.roomId);
          if (room !== undefined) {
            room.remove(socket);
            if (room.isEmpty) this.rooms.delete(room.id);
          }
        }
        this.users.delete(user.id);
        Logger.info(`User #${user.id} left.`).out();
        this.broadcast(WebSocketMessage.Type.Leave, {
          userId: user.id,
        });
      });
      Logger.info(`User #${user.id} joined.`).out();
      socket.send(WebSocketMessage.Type.Initialize, {
        me: user.serialize(),
        users: this.users.valuesAsArray().map((user) => user.summarize()),
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
