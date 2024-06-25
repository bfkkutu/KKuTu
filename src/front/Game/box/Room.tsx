import React, { useEffect } from "react";
import { create } from "zustand";

import L from "front/@global/Language";
import AudioContext from "front/@global/AudioContext";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { getLevel } from "front/@global/Utility";
import Moremi from "front/@block/Moremi";
import LevelIcon from "front/@block/LevelIcon";
import Mode from "front/@block/Mode";
import { useStore as useGlobalStore } from "front/Game/Store";
import { Game } from "front/Game/box/Game";
import ProfileDialog from "front/Game/dialogs/Profile";
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

    useEffect(() => {
      socket.messageReceiver.on(
        WebSocketMessage.Type.JoinRoom,
        ({ member }) => {
          notice(L.get("notice_joinRoom", users[member.id].nickname));
          addMember(member);
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.UpdateRoom,
        ({ room: data }) => {
          if (room === undefined || room.id !== data.id) return;
          if (room.master !== data.master)
            notice(L.get("notice_handover", users[data.master].nickname));
          updateRoom(data);
        }
      );
      socket.messageReceiver.on(
        WebSocketMessage.Type.LeaveRoom,
        ({ memberId }) => {
          notice(L.get("notice_leaveRoom", users[memberId].nickname));
          removeMember(memberId);
        }
      );

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.JoinRoom);
        socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom);
        socket.messageReceiver.off(WebSocketMessage.Type.LeaveRoom);
      };
    }, [users]);

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Spectate, ({ member }) =>
        updateMember(member)
      );
      socket.messageReceiver.on(WebSocketMessage.Type.Ready, ({ member }) =>
        updateMember(member)
      );
      socket.messageReceiver.on(WebSocketMessage.Type.Start, ({ game }) => {
        const audioContext = AudioContext.instance;
        audioContext.stopAll();
        audioContext.playEffect("gameStart");
        updateRoom({ ...room, game });
      });
      const unload = () => socket.send(WebSocketMessage.Type.LeaveRoom, {});
      window.addEventListener("beforeunload", unload);

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Spectate);
        socket.messageReceiver.off(WebSocketMessage.Type.Ready);
        socket.messageReceiver.off(WebSocketMessage.Type.Start);
        window.removeEventListener("beforeunload", unload);
      };
    }, []);

    return (
      <section
        id="box-room"
        className={`product ${room.game === undefined ? "room" : "game"}`}
      >
        <div className="product-title">
          <h5 className="id">[{room.id}]</h5>
          <h5 className="title">{room.title}</h5>
          <h5 className="mode">
            <Mode room={room} />
          </h5>
          <h5 className="limit">
            {L.get(
              "stat_roomLimit",
              Object.keys(room.members).length,
              room.limit
            )}
          </h5>
          <h5 className="round">{L.get("unitRound", room.round)}</h5>
          <h5 className="roundTime">{L.get("unitSecond", room.roundTime)}</h5>
        </div>
        {room.game === undefined ? (
          <div className="product-body">
            <div className="user-list">
              {Object.values(room.members).map((member, index) => (
                <Member {...member} key={index} />
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

  export function Member(member: KKuTu.Room.Member) {
    const users = useGlobalStore((state) => state.users);
    const room = useStore((state) => state.room);

    if (room === undefined) {
      return null;
    }

    const user = users[member.id];
    const toggle = Dialog.useStore((state) => state.toggle);

    const dialog = new ProfileDialog(user);
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
