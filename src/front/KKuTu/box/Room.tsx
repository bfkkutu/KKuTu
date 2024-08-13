import React, { useEffect, useState } from "react";
import { create } from "zustand";
import { useLexicon } from "@daldalso/i18n";

import AudioContext from "front/@global/AudioContext";
import { getLevel } from "front/@global/Utility";
import ClassName from "front/@global/ClassName";
import WebSocket from "front/@global/WebSocket";
import { Dialog } from "front/@global/bayadere/Dialog";
import { Tooltip } from "front/@global/bayadere/Tooltip";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import Moremi from "front/@block/Moremi";
import Robot from "front/@block/Robot";
import LevelIcon from "front/@block/LevelIcon";
import Mode from "front/@block/Mode";
import { useStore as useGlobalStore, useSocket } from "front/KKuTu/Store";
import Game from "front/KKuTu/box/Game";
import ProfileDialog from "front/KKuTu/dialogs/Profile";
import RobotProfileDialog from "front/KKuTu/dialogs/RobotProfile";
import ResultDialog from "front/KKuTu/dialogs/Result";
import { WebSocketMessage } from "../../../common/WebSocket";
import { KKuTu } from "../../../common/KKuTu";

export namespace Room {
  export function Box() {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const users = useGlobalStore((state) => state.users);
    const notice = useGlobalStore((state) => state.notice);
    const show = Dialog.useStore((state) => state.show);
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );
    const [room, update, updateMember, leave] = useStore((state) => [
      state.room!,
      state.update,
      state.updateMember,
      state.leave,
    ]);
    const [isGaming, initialize, deinitialize] = Game.useStore((state) => [
      state.game !== undefined,
      state.initialize,
      state.deinitialize,
    ]);
    const [modified, setModified] = useState<string[]>([]);

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Kick, () => {
        window.alert(l("alert_kicked"));
        leave();
      });
      socket.messageReceiver.on(WebSocketMessage.Type.Spectate, ({ member }) =>
        updateMember(member)
      );
      socket.messageReceiver.on(WebSocketMessage.Type.Ready, ({ member }) =>
        updateMember(member)
      );
      const onUpdate: WebSocket.EventListener<
        WebSocketMessage.Type.UpdateRoom
      > = ({ room: data }) => {
        if (room.id !== data.id) {
          return;
        }
        update(data);
      };
      socket.messageReceiver.on(WebSocketMessage.Type.UpdateRoom, onUpdate);
      socket.messageReceiver.on(WebSocketMessage.Type.End, ({ result }) => {
        deinitialize();
        show(new ResultDialog(result));
      });
      const onUpdateGame: WebSocket.EventListener<
        WebSocketMessage.Type.UpdateGame
      > = ({ game }) => {
        if (!isGaming) {
          initialize(game);
        }
      };
      socket.messageReceiver.on(WebSocketMessage.Type.UpdateGame, onUpdateGame);

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.Spectate);
        socket.messageReceiver.off(WebSocketMessage.Type.Ready);
        socket.messageReceiver.off(WebSocketMessage.Type.UpdateRoom, onUpdate);
        socket.messageReceiver.off(WebSocketMessage.Type.End);
        socket.messageReceiver.off(
          WebSocketMessage.Type.UpdateGame,
          onUpdateGame
        );
      };
    }, []);

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.JoinRoom, ({ member }) =>
        notice(l("notice_joinRoom", users[member.id].nickname))
      );
      socket.messageReceiver.on(WebSocketMessage.Type.LeaveRoom, ({ member }) =>
        notice(l("notice_leaveRoom", users[member].nickname))
      );

      return () => {
        socket.messageReceiver.off(WebSocketMessage.Type.JoinRoom);
        socket.messageReceiver.off(WebSocketMessage.Type.LeaveRoom);
      };
    }, [users]);

    useEffect(() => {
      socket.messageReceiver.on(WebSocketMessage.Type.Start, () => {
        AudioContext.instance.stopAll();
        AudioContext.instance.playEffect("gameStart");
      });
      const updateAnimation: WebSocket.EventListener<
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
      const onHandover: WebSocket.EventListener<
        WebSocketMessage.Type.UpdateRoom
      > = ({ room: data }) => {
        if (room.id !== data.id) {
          return;
        }
        if (room.master !== data.master) {
          notice(l("notice_handover", users[data.master].nickname));
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
        className={`product ${isGaming ? "game" : "room"}`}
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
          {KKuTu.Game.MODES[room.mode].themeSelect ? (
            <h5
              className={new ClassName("mode")
                .if(modified.includes("mode"), "modified")
                .toString()}
              onMouseEnter={createOnMouseEnter(
                new Tooltip(
                  room.themes.map((theme) => l("theme", theme)).join(" / ")
                )
              )}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
            >
              <Mode room={room} />
            </h5>
          ) : (
            <h5
              className={new ClassName("mode")
                .if(modified.includes("mode"), "modified")
                .toString()}
            >
              <Mode room={room} />
            </h5>
          )}
          <h5
            className={new ClassName("limit")
              .if(modified.includes("limit"), "modified")
              .toString()}
          >
            {l("stat_roomLimit", Object.keys(room.members).length, room.limit)}
          </h5>
          <h5
            className={new ClassName("round")
              .if(modified.includes("round"), "modified")
              .toString()}
          >
            {l("unitRound", room.round)}
          </h5>
          <h5
            className={new ClassName("roundTime")
              .if(modified.includes("roundTime"), "modified")
              .toString()}
          >
            {l("unitSecond", room.roundTime)}
          </h5>
        </div>
        {isGaming ? (
          React.createElement(
            Game.INTERFACES[KKuTu.Game.MODES[room.mode].interface],
            { mode: room.mode }
          )
        ) : (
          <div className="product-body">
            <div className="user-list">
              {Object.values(room.members).map((member, index) => (
                <Member key={index} member={member} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  interface Props {
    member: KKuTu.Room.Member;
  }
  export function Member({ member }: Props) {
    const { l } = useLexicon(lKKuTu);
    const room = useStore((state) => state.room!);
    const users = useGlobalStore((state) => state.users);
    const toggle = Dialog.useStore((state) => state.toggle);

    const stats: React.ReactNode[] = [];

    if (room.master === member.id) {
      stats.push(
        <div key={stats.length} className="master">
          {l("master")}
        </div>
      );
    } else if (member.isReady) {
      stats.push(
        <div key={stats.length} className="ready">
          {l("ready")}
        </div>
      );
    }
    if (member.isSpectator) {
      stats.push(
        <div key={stats.length} className="spectator">
          {l("spectator")}
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
            <div className="nickname">{l("robot")}</div>
          </div>
        </div>
      );
    }

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

    update: (room: KKuTu.Room.Detailed) => void;
    updateMember: (member: Partial<KKuTu.Room.Member>) => void;
    leave: () => void;
  }
  export const useStore = create<State>((setState) => ({
    room: undefined,

    update: (room) => setState({ room }),
    updateMember: (member) =>
      setState(({ room }) => {
        if (member.id === undefined || room === undefined) {
          return {};
        }
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
    leave: () => setState({ room: undefined }),
  }));
}

