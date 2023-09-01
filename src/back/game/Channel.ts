import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { Logger } from "back/utils/Logger";
import { fillWithDefaults } from "back/utils/Utility";
import { Database } from "../../common/Database";
import ObjectMap from "../../common/ObjectMap";

import User from "back/models/User";
import FriendRequest from "back/models/FriendRequest";

export default class Channel extends WebSocketServer {
  public static instances: Channel[] = [];
  /**
   * 이 채널에 접속 중인 유저 맵.
   */
  private users = new ObjectMap<string, User<true>>();
  /**
   * 이 채널에 만들어진 방 맵.
   */
  private rooms = new ObjectMap<number, Room>();

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
              rooms: this.rooms.evaluate("summarize"),
            });
            break;
          case WebSocketMessage.Type.UpdateSettings:
            Object.assign(user.settings, message.settings);
            await DB.Manager.save(user);
            socket.send(WebSocketMessage.Type.UpdateSettings, {});
            break;
          case WebSocketMessage.Type.Chat:
            if (user.room === undefined)
              this.broadcast(
                WebSocketMessage.Type.Chat,
                {
                  sender: user.id,
                  content: message.content,
                },
                (client) => this.users.get(client.uid)?.room === undefined
              );
            else
              user.room.broadcast(WebSocketMessage.Type.Chat, {
                sender: user.id,
                content: message.content,
              });
            break;
          case WebSocketMessage.Type.CreateRoom:
            {
              let id = 99;
              while (this.rooms.get(++id));
              user.room = new Room(this, id, user.id, message.room);
              user.room.add(socket);
              this.rooms.set(id, user.room);
              Logger.info(`Room #${id} created by user #${user.id}.`).out();
              socket.send(WebSocketMessage.Type.CreateRoom, {
                room: user.room.serialize(),
              });
              this.updateRoomList();
            }
            break;
          case WebSocketMessage.Type.UpdateRoom:
            {
              const room = user.room;
              if (room === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              if (room.master !== user.id)
                return socket.sendError(WebSocketError.Type.Forbidden, {});
              socket.sendError(WebSocketError.Type.BadRequest, {});
              room.configure(message.room);
              room.update();
            }
            break;
          case WebSocketMessage.Type.JoinRoom:
            {
              const room = this.rooms.get(message.roomId);
              if (room === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              user.room = room;
              room.add(socket);
              Logger.info(`Room #${room.id}: user #${user.id} joined.`).out();
              socket.send(WebSocketMessage.Type.InitializeRoom, {
                room: room.serialize(),
              });
              const member = room.getMember(user.id);
              if (member === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              room.broadcast(
                WebSocketMessage.Type.JoinRoom,
                {
                  member,
                },
                (client) => client.uid !== user.id
              );
            }
            break;
          case WebSocketMessage.Type.LeaveRoom:
            {
              const room = user.room;
              if (room === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              room.broadcast(WebSocketMessage.Type.LeaveRoom, {
                memberId: user.id,
              });
              user.leaveRoom();
              Logger.info(`Room #${room.id}: user #${user.id} left.`).out();
              socket.send(WebSocketMessage.Type.UpdateRoomList, {
                rooms: this.rooms.evaluate("summarize"),
              });
            }
            break;
          case WebSocketMessage.Type.HandoverRoom:
            if (user.room === undefined)
              return socket.sendError(WebSocketError.Type.BadRequest, {});
            if (user.room.master !== user.id)
              return socket.sendError(WebSocketError.Type.Forbidden, {});
            user.room.master = message.master;
            user.room.update();
            break;
          case WebSocketMessage.Type.Spectate:
            {
              const room = user.room;
              if (room === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              const member = room.getMember(user.id);
              if (member === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              member.isSpectator = !member.isSpectator;
              member.isReady = member.isSpectator;
              room.broadcast(WebSocketMessage.Type.Spectate, {
                member,
              });
            }
            break;
          case WebSocketMessage.Type.Ready:
            {
              const room = user.room;
              if (room === undefined || room.master === user.id)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              const member = room.getMember(user.id);
              if (member === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              if (!member.isSpectator) member.isReady = !member.isReady;
              room.broadcast(WebSocketMessage.Type.Ready, {
                member,
              });
            }
            break;
          case WebSocketMessage.Type.FriendRequest:
            {
              const target =
                this.users.get(message.target) ||
                (await DB.Manager.createQueryBuilder(User<false>, "u")
                  .where("u.id = :id", { id: message.target })
                  .getOne());
              if (target === null)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
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
                return socket.sendError(WebSocketError.Type.BadRequest, {});
              const sender =
                this.users.get(friendRequest.sender) ||
                (await DB.Manager.createQueryBuilder(User<false>, "u")
                  .where("u.id = :id", { id: friendRequest.sender })
                  .getOne());
              if (sender === null)
                return socket.sendError(WebSocketError.Type.BadRequest, {});
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
        if (user.room !== undefined) user.leaveRoom();
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

  /**
   * 로비에 접속 중인 모든 유저의 방 목록을 갱신한다.
   */
  private updateRoomList(): void {
    this.broadcast(
      WebSocketMessage.Type.UpdateRoomList,
      {
        rooms: this.rooms.evaluate("summarize"),
      },
      (client) => {
        const user = this.users.get(client.uid);
        return user !== undefined && user.room === undefined;
      }
    );
  }
  /**
   * 더 이상 유효하지 않은 방을 메모리에서 제거한다.
   * @param id 방 식별자.
   */
  public unloadRoom(id: number): void {
    if (this.rooms.delete(id)) this.updateRoomList();
  }
  /**
   * 현재 이 채널에 접속 중인 유저 수를 반환한다.
   *
   * @returns 접속 중인 유저 수.
   */
  public getActiveUserCount(): number {
    return this.users.size;
  }
  public getUser(id: string) {
    return this.users.get(id);
  }
}
