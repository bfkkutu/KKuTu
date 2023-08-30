import React from "react";

import { Game } from "common/Game";
import { useStore } from "front/Game/Store";
import { createProfileDialog } from "front/@global/Bayadere/dialog/templates/Profile";
import { useRoomStore } from "./Store";
import L from "front/@global/Language";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import Moremi from "front/@block/Moremi";
import { getLevel } from "front/@global/Utility";
import LevelIcon from "front/@block/LevelIcon";

export default function Member(member: Game.RoomMember) {
  const users = useStore((state) => state.users);
  const room = useRoomStore((state) => state.room);

  if (room === undefined) return null;

  const user = users[member.id];
  const toggle = useDialogStore((state) => state.toggle);
  const dialog = createProfileDialog(user);

  const stats: React.ReactNode[] = [];

  if (room.master === member.id)
    stats.push(<div className="master">{L.get("master")}</div>);
  else if (member.isReady)
    stats.push(<div className="ready">{L.get("ready")}</div>);

  return (
    <div className="user" onClick={() => toggle(dialog)}>
      <Moremi className="moremi image" equipment={user.equipment} />
      <div className="stat">{stats}</div>
      <div className="title">
        <LevelIcon className="level" level={getLevel(user.score)} />
        <div className="nickname">{user.nickname}</div>
      </div>
    </div>
  );
}
