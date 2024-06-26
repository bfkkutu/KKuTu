import marked from "marked";
import sanitize from "sanitize-html";

import WebSocketServer from "back/utils/WebSocketServer";
import DB from "back/utils/Database";
import Room from "back/game/Room";
import Robot from "back/game/Robot";
import { Logger } from "back/utils/Logger";
import { fillWithDefaults } from "back/utils/Utility";
import WebSocket from "back/utils/WebSocket";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { Database } from "../../common/Database";
import ImprovedMap from "../../common/ImprovedMap";

import User from "back/models/User";
import Whisper from "back/models/Whisper";
import Chat from "back/models/Chat";
import Report from "back/models/Report";

export default class Channel extends WebSocketServer {
  private static roomIdCount = 99;
  public static readonly instances: Channel[] = [];

  /**
   * 이 채널에 접속 중인 유저 맵.
   */
  private readonly users = new ImprovedMap<string, WebSocket>();
  /**
   * 이 채널에 만들어진 방 맵.
   */
  private readonly rooms = new ImprovedMap<number, Room>();

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

      socket.user = user;
      fillWithDefaults(user.settings, Database.JSON.Defaults.User.settings); // 옵션이 나중에 추가될 경우 오류 방지.
      fillWithDefaults(user.community, Database.JSON.Defaults.User.community);
      this.users.set(user.id, socket);
      socket.on("message", async (raw) => {
        const message: WebSocketMessage.Client[WebSocketMessage.Type] =
          JSON.parse(raw.toString());
        switch (message.type) {
          case WebSocketMessage.Type.Initialize:
            socket.send(WebSocketMessage.Type.UpdateCommunity, {
              community: user.community,
            });
            socket.send(WebSocketMessage.Type.UpdateRoomList, {
              rooms: this.rooms.evaluate(Room.prototype.summarize),
            });
            break;
          case WebSocketMessage.Type.UpdateSettings:
            if (req.session.profile === undefined)
              return socket.sendError(WebSocketError.Type.Conflict, {
                isFatal: true,
              });

            Object.assign(user.settings, message.settings);
            await DB.Manager.save(user);
            req.session.profile.locale = user.settings.locale;
            await req.session.save();
            socket.send(WebSocketMessage.Type.UpdateSettings, {});
            break;
          case WebSocketMessage.Type.Chat:
            if (message.content === "") {
              return socket.sendError(WebSocketError.Type.BadRequest, {
                isFatal: false,
              });
            }

            message.content = sanitize(
              await marked.parse(sanitize(message.content)),
              {
                allowedTags: ["strong", "em", "del", "code"],
              }
            ).trim();

            if (message.content === "") {
              return;
            }

            const chat = new Chat();
            chat.sender = user;
            chat.content = message.content;

            if (user.roomId === undefined) {
              await DB.Manager.save(chat);
              this.broadcast(
                WebSocketMessage.Type.Chat,
                chat.serialize(),
                (client) =>
                  this.users.get(client.user.id)?.user.roomId === undefined
              );
              Logger.info(`Lobby Chat #${user.id}: ${message.content}`).out();
            } else {
              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                socket.sendError(WebSocketError.Type.NotFound, {
                  isFatal: false,
                });
                return;
              }

              chat.room = room.id;
              await DB.Manager.save(chat);
              room.broadcast(WebSocketMessage.Type.Chat, chat.serialize());
              Logger.info(
                `Room #${room.id} Chat #${user.id}: ${message.content}`
              ).out();
            }
            break;
          case WebSocketMessage.Type.CreateRoom:
            {
              while (this.rooms.get(++Channel.roomIdCount));

              const id = Channel.roomIdCount;
              const room = new Room(this, id, user.id, message.room);
              room.add(socket);
              user.isReady = true;
              this.rooms.set(id, room);
              Logger.info(`Room #${id} created by user #${user.id}.`).out();
              socket.send(WebSocketMessage.Type.CreateRoom, {
                room: room.serialize(),
              });
              this.updateRoomList();
              this.broadcast(WebSocketMessage.Type.UpdateUser, {
                user: user.summarize(),
              });
            }
            break;
          case WebSocketMessage.Type.UpdateRoom:
            {
              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              if (room.master !== user.id) {
                return socket.sendError(WebSocketError.Type.Forbidden, {
                  isFatal: false,
                });
              }

              room.configure(message.room);
              room.update();
              this.updateRoomList();
            }
            break;
          case WebSocketMessage.Type.JoinRoom:
            {
              const room = this.rooms.get(message.target);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.NotFound, {
                  isFatal: false,
                });
              }

              if (room.isFull) {
                return socket.sendError(WebSocketError.Type.Conflict, {
                  isFatal: false,
                });
              }

              if (room.isLocked) {
                if (message.password === undefined) {
                  return socket.sendError(WebSocketError.Type.Unauthorized, {
                    isFatal: false,
                  });
                }
                if (room.password !== message.password) {
                  return socket.sendError(WebSocketError.Type.Forbidden, {
                    isFatal: false,
                  });
                }
              }

              room.add(socket);
              Logger.info(`Room #${room.id}: user #${user.id} joined.`).out();
              socket.send(WebSocketMessage.Type.InitializeRoom, {
                room: room.serialize(),
              });
              room.broadcast(
                WebSocketMessage.Type.JoinRoom,
                {
                  member: user.asRoomMember(),
                },
                (client) => client.user.id !== user.id
              );
              this.broadcast(WebSocketMessage.Type.UpdateUser, {
                user: user.summarize(),
              });
            }
            break;
          case WebSocketMessage.Type.LeaveRoom:
            {
              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              room.broadcast(WebSocketMessage.Type.LeaveRoom, {
                member: user.id,
              });
              room.remove(user.id);
              if (!user.leaveRoom()) {
                // TODO: 오류 처리
              }
              Logger.info(`Room #${room.id}: user #${user.id} left.`).out();
              socket.send(WebSocketMessage.Type.UpdateRoomList, {
                rooms: this.rooms.evaluate(Room.prototype.summarize),
              });
              this.broadcast(WebSocketMessage.Type.UpdateUser, {
                user: user.summarize(),
              });
            }
            break;
          case WebSocketMessage.Type.HandoverRoom:
            {
              if (user.roomId === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });

              const room = this.rooms.get(user.roomId);
              if (room === undefined)
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });

              if (room.master !== user.id)
                return socket.sendError(WebSocketError.Type.Forbidden, {
                  isFatal: false,
                });

              const master = room.get(message.master);
              if (master === undefined || master.user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              room.master = master.user.id;
              user.isReady = false;
              master.user.isReady = true;
              room.update();
              Logger.info(
                `Room #${room.id}: handover #${user.id} → #${master.user.id}`
              ).out();
              socket.send(WebSocketMessage.Type.HandoverRoom, {});
            }
            break;
          case WebSocketMessage.Type.Spectate:
            {
              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              user.isSpectator = !user.isSpectator;
              user.isReady = user.isSpectator;
              room.broadcast(WebSocketMessage.Type.Spectate, {
                member: user.asRoomMember(),
              });
            }
            break;
          case WebSocketMessage.Type.Ready:
            {
              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              if (room.master === user.id) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              if (!user.isSpectator) {
                user.isReady = !user.isReady;
              }
              room.broadcast(WebSocketMessage.Type.Ready, {
                member: user.asRoomMember(),
              });
            }
            break;
          case WebSocketMessage.Type.Start:
            {
              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              if (room.master !== user.id) {
                return socket.sendError(WebSocketError.Type.Forbidden, {
                  isFatal: false,
                });
              }

              if (!room.isReady || room.count === 1) {
                return socket.sendError(WebSocketError.Type.Conflict, {
                  isFatal: false,
                });
              }
              room.start();
              Logger.info(`Room #${room.id}: game started`).out();
            }
            break;
          case WebSocketMessage.Type.FriendRequest:
            {
              const targetClient = this.users.get(message.target);
              const target =
                targetClient === undefined
                  ? await DB.Manager.createQueryBuilder(User, "u")
                      .where("u.id = :id", { id: message.target })
                      .getOne()
                  : targetClient.user;
              if (target === null) {
                return socket.sendError(WebSocketError.Type.NotFound, {
                  isFatal: false,
                });
              }

              if (user.community.blackList.includes(message.target)) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              user.community.friendRequests.sent.push(target.id);
              target.community.friendRequests.received.push(user.id);
              socket.send(WebSocketMessage.Type.FriendRequest, {});
              await DB.Manager.save([user, target]);

              socket.send(WebSocketMessage.Type.UpdateCommunity, {
                community: user.community,
              });
              targetClient?.send(WebSocketMessage.Type.UpdateCommunity, {
                community: target.community,
              });
            }
            break;
          case WebSocketMessage.Type.FriendRequestResponse:
            {
              const senderClient = this.users.get(message.sender);
              const sender =
                senderClient === undefined
                  ? await DB.Manager.createQueryBuilder(User, "u")
                      .where("u.id = :id", { id: message.sender })
                      .getOne()
                  : senderClient.user;
              if (sender === null) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              user.community.friendRequests.received.splice(
                user.community.friendRequests.received.findIndex(
                  (v) => v === sender.id
                ),
                1
              );
              sender.community.friendRequests.sent.splice(
                sender.community.friendRequests.sent.findIndex(
                  (v) => v === user.id
                ),
                1
              );

              if (message.accept) {
                user.community.friends.push(sender.id);
                sender.community.friends.push(user.id);
              }
              await DB.Manager.save([user, sender]);

              socket.send(WebSocketMessage.Type.UpdateCommunity, {
                community: user.community,
              });
              senderClient?.send(WebSocketMessage.Type.UpdateCommunity, {
                community: sender.community,
              });
            }
            break;
          case WebSocketMessage.Type.FriendRemove:
            {
              const friendClient = this.users.get(message.target);
              const friend =
                friendClient === undefined
                  ? await DB.Manager.createQueryBuilder(User, "u")
                      .where("u.id = :id", { id: message.target })
                      .getOne()
                  : friendClient.user;
              if (friend === null) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              user.community.friends.splice(
                user.community.friends.findIndex((v) => v === friend.id),
                1
              );
              friend.community.friends.splice(
                friend.community.friends.findIndex((v) => v === user.id),
                1
              );
              await DB.Manager.save([user, friend]);

              socket.send(WebSocketMessage.Type.UpdateCommunity, {
                community: user.community,
              });
              friendClient?.send(WebSocketMessage.Type.UpdateCommunity, {
                community: friend.community,
              });
            }
            break;
          case WebSocketMessage.Type.BlackListAdd:
            if (
              !(await DB.Manager.createQueryBuilder(User, "u")
                .where("u.id = :id", { id: message.target })
                .getExists())
            ) {
              return socket.sendError(WebSocketError.Type.NotFound, {
                isFatal: false,
              });
            }

            if (user.community.friends.includes(message.target)) {
              return socket.sendError(WebSocketError.Type.BadRequest, {
                isFatal: false,
              });
            }

            user.community.blackList.push(message.target);
            if (
              user.community.friendRequests.received.includes(message.target)
            ) {
              user.community.friendRequests.received.splice(
                user.community.friendRequests.received.findIndex(
                  (v) => v === message.target
                ),
                1
              );
            }
            await DB.Manager.save(user);
            socket.send(WebSocketMessage.Type.UpdateCommunity, {
              community: user.community,
            });
            break;
          case WebSocketMessage.Type.BlackListRemove:
            if (!user.community.blackList.includes(message.target)) {
              return socket.sendError(WebSocketError.Type.BadRequest, {
                isFatal: false,
              });
            }

            user.community.blackList.splice(
              user.community.blackList.findIndex((v) => v === message.target),
              1
            );
            await DB.Manager.save(user);
            socket.send(WebSocketMessage.Type.UpdateCommunity, {
              community: user.community,
            });
            break;
          case WebSocketMessage.Type.Whisper:
            {
              if (message.content === "") {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const target = this.users.get(message.target);
              if (target === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const whisper = new Whisper();
              whisper.sender = user;
              whisper.target = target.user;
              whisper.content = message.content;
              await DB.Manager.save(whisper);
              socket.send(WebSocketMessage.Type.Whisper, whisper.serialize());
              Logger.info(
                `Whisper #${user.id} → #${target.user.id}: ${whisper.content}`
              ).out();

              // black list에 있는 경우 자동 거절
              if (target.user.community.blackList.includes(user.id)) {
                return;
              }
              target.send(WebSocketMessage.Type.Whisper, whisper.serialize());
            }
            break;
          case WebSocketMessage.Type.Report:
            const target = await this.queryUser(message.target);
            if (target === undefined) {
              return socket.sendError(WebSocketError.Type.NotFound, {
                isFatal: false,
              });
            }

            const report = new Report();
            report.submitter = user;
            report.target = target;
            report.reason = message.reason;
            report.comment = message.comment;
            await DB.Manager.save(report);
            socket.send(WebSocketMessage.Type.Report, {});
            break;
          case WebSocketMessage.Type.ReportChat:
            {
              const chat = await DB.Manager.createQueryBuilder(Chat, "c")
                .where("c.id = :id", { id: message.target })
                .getOne();
              if (chat === null) {
                return socket.sendError(WebSocketError.Type.NotFound, {
                  isFatal: false,
                });
              }

              if (chat.reports.includes(user.id)) {
                return socket.sendError(WebSocketError.Type.Conflict, {
                  isFatal: false,
                });
              }

              chat.reports.push(user.id);
              await DB.Manager.save(chat);
              socket.send(WebSocketMessage.Type.ReportChat, {});
            }
            break;
          case WebSocketMessage.Type.ReportWhisper:
            {
              const whisper = await DB.Manager.createQueryBuilder(Whisper, "w")
                .where("w.id = :id", { id: message.target })
                .getOne();
              if (whisper === null) {
                return socket.sendError(WebSocketError.Type.NotFound, {
                  isFatal: false,
                });
              }

              if (whisper.reports.includes(user.id)) {
                return socket.sendError(WebSocketError.Type.Conflict, {
                  isFatal: false,
                });
              }

              whisper.reports.push(user.id);
              await DB.Manager.save(whisper);
              socket.send(WebSocketMessage.Type.ReportWhisper, {});
            }
            break;
          case WebSocketMessage.Type.Invite:
            {
              const target = this.users.get(message.target);
              if (target === undefined) {
                return socket.sendError(WebSocketError.Type.NotFound, {
                  isFatal: false,
                });
              }

              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              // black list에 있는 경우 자동 거절
              if (target.user.community.blackList.includes(user.id)) {
                return;
              }
              target.send(WebSocketMessage.Type.Invite, {
                user: user.id,
                room: user.roomId,
              });
            }
            break;
          case WebSocketMessage.Type.AddRobot:
            {
              if (user.roomId === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              const room = this.rooms.get(user.roomId);
              if (room === undefined) {
                return socket.sendError(WebSocketError.Type.BadRequest, {
                  isFatal: false,
                });
              }

              if (room.isFull) {
                return socket.sendError(WebSocketError.Type.Conflict, {
                  isFatal: false,
                });
              }

              room.addRobot(new Robot());
              socket.send(WebSocketMessage.Type.AddRobot, {});
            }
            break;
          case WebSocketMessage.Type.QueryUser:
            {
              const target = await this.queryUser(message.target);
              if (target === undefined) {
                return socket.send(WebSocketMessage.Type.QueryUser, {});
              }

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
            room.broadcast(WebSocketMessage.Type.LeaveRoom, {
              member: user.id,
            });
            room.remove(user.id);
            if (!user.leaveRoom()) {
              // TODO: 오류 처리
            }
            Logger.info(`Room #${room.id}: user #${user.id} left.`).out();
            this.broadcast(WebSocketMessage.Type.UpdateUser, {
              user: user.summarize(),
            });
          }
        }

        this.users.delete(user.id);
        Logger.info(`User #${user.id} left.`).out();
        this.broadcast(WebSocketMessage.Type.Leave, {
          user: user.id,
        });
      });
      Logger.info(`User #${user.id} joined.`).out();
      socket.send(WebSocketMessage.Type.Initialize, {
        me: user.serialize(),
        users: this.users
          .valuesAsArray()
          .map((client) => client.user.summarize()),
      });
      this.broadcast(
        WebSocketMessage.Type.Join,
        { user: user.summarize() },
        (client) => client.user.id !== user.id
      );
    });
    setInterval(
      () => this.broadcast(WebSocketMessage.Type.Heartbeat, {}),
      95000 // CloudFlare timeout (100 seconds)
    );
  }

  /**
   * 로비에 접속 중인 모든 유저의 방 목록을 갱신한다.
   */
  private updateRoomList(): void {
    this.broadcast(
      WebSocketMessage.Type.UpdateRoomList,
      {
        rooms: this.rooms.evaluate(Room.prototype.summarize),
      },
      (client) => client.user.roomId === undefined
    );
  }
  private async queryUser(id: string): Promise<User | undefined> {
    const client = this.users.get(id);
    if (client !== undefined) {
      return client.user;
    }
    const user = await DB.Manager.createQueryBuilder(User, "u")
      .where("u.id = :id", { id })
      .limit(1)
      .getOne();
    if (user !== null) {
      return user;
    }
    return undefined;
  }
  /**
   * 더 이상 유효하지 않은 방을 메모리에서 제거한다.
   * @param id 방 식별자.
   */
  public unloadRoom(id: number): void {
    if (this.rooms.delete(id)) {
      this.updateRoomList();
    }
  }
  /**
   * 현재 이 채널에 접속 중인 유저 수를 반환한다.
   *
   * @returns 접속 중인 유저 수.
   */
  public getActiveUserCount(): number {
    return this.users.size;
  }
}
