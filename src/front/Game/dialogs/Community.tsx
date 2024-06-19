import React, { useEffect, useState } from "react";

import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { getLevel } from "front/@global/Utility";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { Icon, IconType } from "front/@block/Icon";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { WhisperDialog } from "front/Game/dialogs/Whisper";
import { Room } from "front/Game/box/Room";
import { WebSocketMessage } from "../../../common/WebSocket";

export const CommunityDialog = new Dialog(
  () => {
    const friends = useStore((state) => state.community.friends);

    return <>{L.render("community_title", friends.length)}</>;
  },
  () => {
    const socket = useStore((state) => state.socket);
    const community = useStore((state) => state.community);
    const onlineUsers = useStore((state) => state.users);
    const [room, updateRoom, leaveRoom] = Room.useStore((state) => [
      state.room,
      state.updateRoom,
      state.leaveRoom,
    ]);
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );
    const [users, setUsers] = useState({ ...onlineUsers });

    useEffect(() => {
      async function loadOfflineUsers() {
        for (const id of [
          ...community.friendRequests.received,
          ...community.friends,
        ])
          if (!(id in users)) {
            const user = await socket.queryUser(id);
            if (user === undefined) {
              continue;
            }
            setUsers((users) => ({ ...users, [id]: user }));
          }
      }
      loadOfflineUsers();
    }, [community]);

    function sendResponse(sender: string, accept: boolean) {
      socket.send(WebSocketMessage.Type.FriendRequestResponse, {
        sender,
        accept,
      });
      socket.messageReceiver.wait(WebSocketMessage.Type.UpdateCommunity);
    }

    return (
      <div className="dialog-community">
        <ul className="body">
          {community.friendRequests.received.map((id) => {
            const user = users[id];
            if (user === undefined) return null;
            return (
              <li className="item request">
                <div className="left">
                  <ProfileImage src={user.image} width={20} height={20} />
                  <LevelIcon
                    className="image"
                    level={getLevel(user.score)}
                    width={20}
                    height={20}
                  />
                  <div className="name ellipse">{user.nickname}</div>
                </div>
                <div className="right">
                  <div
                    className="accept"
                    onMouseEnter={createOnMouseEnter(L.get("accept"))}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={() => sendResponse(id, true)}
                  >
                    <Icon type={IconType.NORMAL} name="check" />
                  </div>
                  <div
                    className="decline"
                    onMouseEnter={createOnMouseEnter(L.get("decline"))}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={() => sendResponse(id, false)}
                  >
                    <Icon type={IconType.NORMAL} name="xmark" />
                  </div>
                </div>
              </li>
            );
          })}
          {community.friends.map((id) => {
            const friend = users[id];
            if (friend === undefined) return null;
            const isOnline = id in onlineUsers;
            return (
              <li className="item">
                <div className="left">
                  <Icon
                    className={isOnline ? "online" : "offline"}
                    type={IconType.NORMAL}
                    name="circle"
                  />
                  <ProfileImage src={friend.image} width={20} height={20} />
                  <LevelIcon
                    className="image"
                    level={getLevel(friend.score)}
                    width={20}
                    height={20}
                  />
                  <div className="name ellipse">{friend.nickname}</div>
                </div>
                <div className="right">
                  {isOnline ? (
                    <>
                      <div
                        onMouseEnter={createOnMouseEnter(L.get("whisper"))}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                        onClick={() => WhisperDialog.toggle(friend)}
                      >
                        <Icon type={IconType.NORMAL} name="comment" />
                      </div>
                      {room === undefined ||
                      friend.roomId === room.id ? null : (
                        <div
                          onMouseEnter={createOnMouseEnter(L.get("invite"))}
                          onMouseMove={onMouseMove}
                          onMouseLeave={onMouseLeave}
                          onClick={async () => {
                            if (
                              !(await window.confirm(
                                L.get("confirm_invite", friend.nickname)
                              ))
                            )
                              return;
                            socket.send(WebSocketMessage.Type.Invite, {
                              target: friend.id,
                            });
                            window.alert(
                              L.get("alert_invite", friend.nickname)
                            );
                          }}
                        >
                          <Icon type={IconType.NORMAL} name="envelope" />
                        </div>
                      )}
                      {friend.roomId !== undefined &&
                      friend.roomId !== room?.id ? (
                        <div
                          onMouseEnter={createOnMouseEnter(L.get("follow"))}
                          onMouseMove={onMouseMove}
                          onMouseLeave={onMouseLeave}
                          onClick={async () => {
                            if (
                              friend.roomId === undefined ||
                              !(await window.confirm(
                                L.get(
                                  "confirm_follow",
                                  friend.nickname,
                                  friend.roomId
                                )
                              ))
                            )
                              return;
                            if (room === undefined) {
                              socket.send(WebSocketMessage.Type.LeaveRoom, {});
                              await socket.messageReceiver.wait(
                                WebSocketMessage.Type.LeaveRoom
                              );
                              leaveRoom();
                            }
                            socket.send(WebSocketMessage.Type.JoinRoom, {
                              target: friend.roomId,
                            });
                            const res = await socket.messageReceiver.wait(
                              WebSocketMessage.Type.InitializeRoom
                            );
                            updateRoom(res.room);
                          }}
                        >
                          <Icon type={IconType.NORMAL} name="arrow-right" />
                        </div>
                      ) : null}
                      <div
                        className="remove"
                        onMouseEnter={createOnMouseEnter(L.get("remove"))}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                        onClick={async () => {
                          if (
                            !(await window.confirm(
                              L.get("confirm_friendRemove", friend.nickname)
                            ))
                          )
                            return;
                          socket.send(WebSocketMessage.Type.FriendRemove, {
                            target: friend.id,
                          });
                          await socket.messageReceiver.wait(
                            WebSocketMessage.Type.UpdateCommunity
                          );
                          window.alert(
                            L.get("alert_friendRemove", friend.nickname)
                          );
                        }}
                      >
                        <Icon type={IconType.NORMAL} name="xmark" />
                      </div>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="footer"></div>
      </div>
    );
  }
);
