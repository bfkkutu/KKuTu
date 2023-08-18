import React from "react";

import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { useStore } from "front/Game/Store";

export const CommunityDialog = new DialogTuple(
  () => {
    const friends = useStore((state) => state.me.friends);

    return <>{L.get("community_title", friends.length)}</>;
  },
  () => {
    const me = useStore((state) => state.me);
    const users = useStore((state) => state.users);

    return (
      <>
        <div className="body dialog-community">
          {me.friends.map((id) => {
            const friend = users[id];
            return <div>{friend.nickname}</div>;
          })}
        </div>
        <div className="footer"></div>
      </>
    );
  }
);
