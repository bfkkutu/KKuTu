import React, { useEffect, useState } from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";
import { getLevel, getOfflineUser } from "front/@global/Utility";
import ProfileImage from "front/@block/ProfileImage";
import LevelIcon from "front/@block/LevelIcon";
import { Icon, IconType } from "front/@block/Icon";
import { WebSocketMessage } from "../../../../../common/WebSocket";

export const CommunityDialog = new DialogTuple(
  () => {
    const friends = useStore((state) => state.community.friends);

    return <>{L.get("community_title", friends.length)}</>;
  },
  () => {
    const socket = useStore((state) => state.socket);
    const community = useStore((state) => state.community);
    const [users, setUsers] = useState({ ...useStore((state) => state.users) });

    useEffect(() => {
      async function loadOfflineUsers() {
        for (const id of [
          ...community.friendRequests.received,
          ...community.friends,
        ])
          if (!(id in users)) {
            const user = await getOfflineUser(socket, id);
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
      <>
        <div className="body dialog-community">
          {community.friendRequests.received.map((id) => {
            const user = users[id];
            if (user === undefined) return null;
            return (
              <div className="item request">
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
                    onClick={() => sendResponse(id, true)}
                  >
                    <Icon type={IconType.NORMAL} name="check" />
                  </div>
                  <div
                    className="decline"
                    onClick={() => sendResponse(id, false)}
                  >
                    <Icon type={IconType.NORMAL} name="xmark" />
                  </div>
                </div>
              </div>
            );
          })}
          {community.friends.map((id) => {
            const friend = users[id];
            if (friend === undefined) return null;
            return (
              <div className="item">
                <div className="left">
                  <ProfileImage src={friend.image} width={20} height={20} />
                  <LevelIcon
                    className="image"
                    level={getLevel(friend.score)}
                    width={20}
                    height={20}
                  />
                  <div className="name ellipse">{friend.nickname}</div>
                </div>
                <div className="right"></div>
              </div>
            );
          })}
        </div>
        <div className="footer"></div>
      </>
    );
  }
);
