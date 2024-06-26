import React, { useEffect, useState } from "react";
import { create } from "zustand";

import L from "front/@global/Language";
import AudioContext from "front/@global/AudioContext";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { getLevel } from "front/@global/Utility";
import ClassName from "front/@global/ClassName";
import { EventListener } from "front/@global/WebSocket";
import Moremi from "front/@block/Moremi";
import Robot from "front/@block/Robot";
import LevelIcon from "front/@block/LevelIcon";
import Mode from "front/@block/Mode";
import { useStore as useGlobalStore } from "front/Game/Store";
import { Game } from "front/Game/box/Game";
import ProfileDialog from "front/Game/dialogs/Profile";
import RobotProfileDialog from "front/Game/dialogs/RobotProfile";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";

export namespace Room {
  export function Box() {
    const socket = useGlobalStore((state) => state.socket);
    const users = useGlobalStore((state) => state.users);
    const notice = useGlobalStore((state) => state.notice);
    const [room, updateRoom, addMember, updateMember, removeMember] = useStore(
      (state) => [
        state.room!,
        state.updateRoom,
        state.addMember,
        state.updateMember,
        state.removeMember,
      ]
    );
    const [modified, setModified] = useState<string[]>([]);

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Spectate, ({ member }) =>
        updateMember(member)
      );
      socket.messageReceiver.on(WebSocketMessage.Type.Ready, ({ member }) =>
        updateMember(member)
      );
      const onUpdate: EventListener<WebSocketMessage.Type.UpdateRoom> = ({
        room: data,
      }) => {
        if (room.id !== data.id) {
          return;
        }
        updateRoom(data);
      };
      socket.messageReceiver.on(WebSocketMessage.Type.UpdateRoom, onUpdate);

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Spectate);
        socket.messageReceiver.off(WebSocketMessage.Type.Ready);
        socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom, onUpdate);
      };
    }, []);

    useEffect(() => {
      socket.messageReceiver.on(
        WebSocketMessage.Type.JoinRoom,
        ({ member }) => {
          notice(L.get("notice_joinRoom", users[member.id].nickname));
          addMember(member);
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.LeaveRoom,
        ({ member }) => {
          notice(L.get("notice_leaveRoom", users[member].nickname));
          removeMember(member);
        }
      );

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.JoinRoom);
        socket.messageReceiver.off(WebSocketMessage.Type.LeaveRoom);
      };
    }, [users]);

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Start, ({ game }) => {
        const audioContext = AudioContext.instance;
        audioContext.stopAll();
        audioContext.playEffect("gameStart");
        updateRoom({ ...room, game });
      });
      const updateAnimation: EventListener<
        WebSocketMessage.Type.UpdateRoom
      > = ({ room: data }) => {
        if (room.id !== data.id) {
          return;
        }
        const modified = [];
        for (const key of [
          "title",
          "mode",
          "limit",
          "round",
          "roundTime",
        ] satisfies (keyof KKuTu.Room.Detailed)[]) {
          if (room[key] !== data[key]) {
            modified.push(key);
          }
        }
        if (modified.length !== 0) {
          setModified(modified);
          window.setTimeout(() => setModified([]), 1000);
        }
      };
      socket.messageReceiver.on(
        WebSocketMessage.Type.UpdateRoom,
        updateAnimation
      );

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Start);
        socket.messageReceiver.off(
          WebSocketMessage.Type.UpdateRoom,
          updateAnimation
        );
      };
    }, [room]);

    useEffect(() => {
      const onHandover: EventListener<WebSocketMessage.Type.UpdateRoom> = ({
        room: data,
      }) => {
        if (room.id !== data.id) {
          return;
        }
        if (room.master !== data.master) {
          notice(L.get("notice_handover", users[data.master].nickname));
        }
      };
      socket.messageReceiver.on(WebSocketMessage.Type.UpdateRoom, onHandover);

      return () => {
        socket.messageReceiver.off(
          WebSocketMessage.Type.UpdateRoom,
          onHandover
        );
      };
    }, [users, room]);

    return (
      <section
        id="box-room"
        className={`product ${room.game === undefined ? "room" : "game"}`}
      >
        <div className="product-title">
          <h5 className="id">[{room.id}]</h5>
          <h5
            className={new ClassName("title")
              .if(modified.includes("title"), "modified")
              .toString()}
          >
            {room.title}
          </h5>
          <h5
            className={new ClassName("mode")
              .if(modified.includes("mode"), "modified")
              .toString()}
          >
            <Mode room={room} />
          </h5>
          <h5
            className={new ClassName("limit")
              .if(modified.includes("limit"), "modified")
              .toString()}
          >
            {L.get(
              "stat_roomLimit",
              Object.keys(room.members).length,
              room.limit
            )}
          </h5>
          <h5
            className={new ClassName("round")
              .if(modified.includes("round"), "modified")
              .toString()}
          >
            {L.get("unitRound", room.round)}
          </h5>
          <h5
            className={new ClassName("roundTime")
              .if(modified.includes("roundTime"), "modified")
              .toString()}
          >
            {L.get("unitSecond", room.roundTime)}
          </h5>
        </div>
        {room.game === undefined ? (
          <div className="product-body">
            <div className="user-list">
              {Object.values(room.members).map((member, index) => (
                <Member key={index} member={member} />
              ))}
            </div>
          </div>
        ) : (
          React.createElement(
            Game.GRAPHICS[KKuTu.Game.modes[room.mode].graphic]
          )
        )}
      </section>
    );
  }

  interface Props {
    member: KKuTu.Room.Member;
  }
  export function Member({ member }: Props) {
    const room = useStore((state) => state.room!);
    const toggle = Dialog.useStore((state) => state.toggle);

    const stats: React.ReactNode[] = [];

    if (room.master === member.id) {
      stats.push(
        <div key={stats.length} className="master">
          {L.get("master")}
        </div>
      );
    } else if (member.isReady) {
      stats.push(
        <div key={stats.length} className="ready">
          {L.get("ready")}
        </div>
      );
    }
    if (member.isSpectator) {
      stats.push(
        <div key={stats.length} className="spectator">
          {L.get("spectator")}
        </div>
      );
    }

    if (member.isRobot) {
      const dialog = new RobotProfileDialog(member.id);

      return (
        <div className="user" onClick={() => toggle(dialog)}>
          <Robot className="moremi image" />
          <div className="stat">{stats}</div>
          <div className="title">
            <LevelIcon className="level" level={1} />
            <div className="nickname">{L.get("robot")}</div>
          </div>
        </div>
      );
    }

    const users = useGlobalStore((state) => state.users);

    const user = users[member.id];
    const dialog = new ProfileDialog(user);

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

  interface State {
    room?: KKuTu.Room.Detailed;
    updateRoom: (room: KKuTu.Room.Detailed) => void;
    addMember: (member: KKuTu.Room.Member) => void;
    updateMember: (member: Partial<KKuTu.Room.Member>) => void;
    removeMember: (id: string) => void;
    leaveRoom: () => void;
  }
  export const useStore = create<State>((setState) => ({
    room: undefined,
    updateRoom: (room) => setState({ room }),
    addMember: (member) =>
      setState(({ room }) => {
        if (room === undefined) return {};
        return {
          room: { ...room, members: { ...room.members, [member.id]: member } },
        };
      }),
    updateMember: (member) =>
      setState(({ room }) => {
        if (member.id === undefined || room === undefined) return {};
        return {
          room: {
            ...room,
            members: {
              ...room.members,
              [member.id]: {
                ...room.members[member.id],
                ...member,
              },
            },
          },
        };
      }),
    removeMember: (id) =>
      setState(({ room }) => {
        if (room === undefined) return {};
        const members = { ...room.members };
        delete members[id];
        return {
          room: {
            ...room,
            members,
          },
        };
      }),
    leaveRoom: () => setState({ room: undefined }),
  }));
}
