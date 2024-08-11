import React, { useEffect, useState } from "react";

import L from "front/@global/Language";
import { getLevel } from "front/@global/Utility";
import { Tooltip } from "front/@global/Bayadere/Tooltip";
import { Dialog } from "front/@global/Bayadere/Dialog";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import Icon from "front/@block/Icon";
import { useSocket, useStore } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import { Whisper } from "front/KKuTu/dialogs/Whisper";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class CommunityDialog extends Dialog {
  public static readonly instance = new CommunityDialog();

  protected override head(): React.ReactElement {
    const friends = useStore((state) => state.community.friends);

    return <>{L.render("community_title", friends.length)}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useSocket((state) => state.socket);
    const community = useStore((state) => state.community);
    const onlineUsers = useStore((state) => state.users);
    const [room, updateRoom, leaveRoom] = Room.useStore((state) => [
      state.room,
      state.update,
      state.leave,
    ]);
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );
    const [users, setUsers] = useState({ ...onlineUsers });

    const tooltipAccept = new Tooltip(L.get("accept"));
    const tooltipDecline = new Tooltip(L.get("decline"));

    const tooltipWhisper = new Tooltip(L.get("whisper"));
    const tooltipInvite = new Tooltip(L.get("invite"));
    const tooltipFollow = new Tooltip(L.get("follow"));
    const tooltipRemove = new Tooltip(L.get("remove"));

    useEffect(() => {
      async function loadOfflineUsers() {
        for (const id of [
          ...community.friendRequests.received,
          ...community.friends,
        ]) {
          if (!(id in users)) {
            const user = await socket.queryUser(id);
            if (user === undefined) {
              continue;
            }
            setUsers((users) => ({ ...users, [id]: user }));
          }
        }
      }
      loadOfflineUsers();
    }, [community]);

    async function sendResponse(sender: string, accept: boolean) {
      socket.send(WebSocketMessage.Type.FriendRequestResponse, {
        sender,
        accept,
      });
      await socket.messageReceiver.wait(WebSocketMessage.Type.UpdateCommunity);
    }

    return (
      <div className="dialog-community">
        <ul className="body">
          {community.friendRequests.received.map((id, index) => {
            const user = users[id];
            if (user === undefined) return null;
            return (
              <li key={index} className="item request">
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
                    onMouseEnter={createOnMouseEnter(tooltipAccept)}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={async () => await sendResponse(id, true)}
                  >
                    <Icon type={Icon.Type.NORMAL} name="check" />
                  </div>
                  <div
                    className="decline"
                    onMouseEnter={createOnMouseEnter(tooltipDecline)}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    onClick={async () => await sendResponse(id, false)}
                  >
                    <Icon type={Icon.Type.NORMAL} name="xmark" />
                  </div>
                </div>
              </li>
            );
          })}
          {community.friends.map((id, index) => {
            const friend = users[id];
            if (friend === undefined) return null;
            const isOnline = id in onlineUsers;
            return (
              <li key={index} className="item">
                <div className="left">
                  <Icon
                    className={isOnline ? "online" : "offline"}
                    type={Icon.Type.NORMAL}
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
                        onMouseEnter={createOnMouseEnter(tooltipWhisper)}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                        onClick={() => Whisper.toggle(friend)}
                      >
                        <Icon type={Icon.Type.NORMAL} name="comment" />
                      </div>
                      {room === undefined ||
                      friend.roomId === room.id ? null : (
                        <div
                          onMouseEnter={createOnMouseEnter(tooltipInvite)}
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
                          <Icon type={Icon.Type.NORMAL} name="envelope" />
                        </div>
                      )}
                      {friend.roomId !== undefined &&
                      friend.roomId !== room?.id ? (
                        <div
                          onMouseEnter={createOnMouseEnter(tooltipFollow)}
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
                            ) {
                              return;
                            }
                            if (room !== undefined) {
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
                          <Icon type={Icon.Type.NORMAL} name="arrow-right" />
                        </div>
                      ) : null}
                      <div
                        className="remove"
                        onMouseEnter={createOnMouseEnter(tooltipRemove)}
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
                        <Icon type={Icon.Type.NORMAL} name="xmark" />
                      </div>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

