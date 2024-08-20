import React from "react";
import { useLexicon } from "@daldalso/i18n";
import type { LFunction } from "@daldalso/i18n/dist/types";

import ClassName from "front/@global/ClassName";
import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";
import lKKuTu from "front/@global/languages/l.kkutu";
import Icon from "front/@block/Icon";
import { useSocket, useStore } from "front/KKuTu/Store";
import { Room } from "front/KKuTu/box/Room";
import Game from "front/KKuTu/box/Game";
import ListBox from "front/KKuTu/box/RoomList";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";

import SettingsDialog from "front/KKuTu/dialogs/Settings";
import CommunityDialog from "front/KKuTu/dialogs/Community";
import CreateRoomDialog from "front/KKuTu/dialogs/CreateRoom";
import RoomSettingsDialog from "front/KKuTu/dialogs/RoomSettings";
import DictionaryDialog from "front/KKuTu/dialogs/Dictionary";
import InviteDialog from "front/KKuTu/dialogs/Invite";
import BlackListDialog from "front/KKuTu/dialogs/BlackList";

export namespace Menu {
  export enum Type {
    Help = "help",
    Settings = "settings",
    Community = "community",
    BlackList = "blackList",
    Leaderboard = "leader",
    Spectate = "spectate",
    RoomSettings = "roomSettings",
    CreateRoom = "createRoom",
    SearchRoom = "searchRoom",
    Shop = "shop",
    Dictionary = "dict",
    Invite = "invite",
    Practice = "practice",
    Ready = "ready",
    Start = "start",
    Leave = "leave",
    Replay = "replay",
  }

  enum Context {
    Lobby,
    Room,
    Master,
    Gaming,
  }

  interface Item {
    type: Type;
    isTiny: boolean;
    label: React.FC<{ l: LFunction<[typeof lKKuTu]> }>;
    badge?: React.FC<{}>;
    contexts: Context[];
  }

  const buttons: Item[] = [
    {
      type: Type.Help,
      isTiny: true,
      label: () => <Icon type={Icon.Type.NORMAL} name="question-circle" />,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Settings,
      isTiny: true,
      label: () => <Icon type={Icon.Type.NORMAL} name="wrench" />,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Community,
      isTiny: true,
      label: () => <Icon type={Icon.Type.NORMAL} name="comments" />,
      badge: () => {
        const community = useStore((state) => state.community);

        return community.friendRequests.received.length === 0 ? null : (
          <span className="badge">
            {community.friendRequests.received.length}
          </span>
        );
      },
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.BlackList,
      isTiny: true,
      label: () => <Icon type={Icon.Type.NORMAL} name="ban" />,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Leaderboard,
      isTiny: true,
      label: () => <Icon type={Icon.Type.NORMAL} name="trophy" />,
      contexts: [Context.Lobby],
    },
    {
      type: Type.Spectate,
      isTiny: false,
      label: ({ l }) => <>{l("menu_spectate")}</>,
      contexts: [Context.Room, Context.Master],
    },
    {
      type: Type.RoomSettings,
      isTiny: false,
      label: ({ l }) => <>{l("menu_roomSettings")}</>,
      contexts: [Context.Master],
    },
    {
      type: Type.CreateRoom,
      isTiny: false,
      label: ({ l }) => <>{l("createRoom")}</>,
      contexts: [Context.Lobby],
    },
    {
      type: Type.SearchRoom,
      isTiny: false,
      label: ({ l }) => <>{l("menu_searchRoom")}</>,
      contexts: [Context.Lobby],
    },
    {
      type: Type.Shop,
      isTiny: false,
      label: ({ l }) => <>{l("menu_shop")}</>,
      contexts: [Context.Lobby],
    },
    {
      type: Type.Dictionary,
      isTiny: false,
      label: ({ l }) => <>{l("menu_dict")}</>,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Invite,
      isTiny: false,
      label: ({ l }) => <>{l("menu_invite")}</>,
      contexts: [Context.Room, Context.Master],
    },
    {
      type: Type.Practice,
      isTiny: false,
      label: ({ l }) => <>{l("menu_practice")}</>,
      contexts: [Context.Room, Context.Master],
    },
    {
      type: Type.Ready,
      isTiny: false,
      label: ({ l }) => <>{l("menu_ready")}</>,
      contexts: [Context.Room],
    },
    {
      type: Type.Start,
      isTiny: false,
      label: ({ l }) => <>{l("menu_start")}</>,
      contexts: [Context.Master],
    },
    {
      type: Type.Leave,
      isTiny: false,
      label: ({ l }) => <>{l("menu_leave")}</>,
      contexts: [Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Replay,
      isTiny: false,
      label: ({ l }) => <>{l("menu_replay")}</>,
      contexts: [Context.Lobby],
    },
  ];

  export function Component() {
    const { l } = useLexicon(lCommon, lKKuTu);
    const socket = useSocket((state) => state.socket);
    const me = useStore((state) => state.me);
    const [room, leaveRoom] = Room.useStore((state) => [
      state.room,
      state.leave,
    ]);
    const [isGaming, deinitialize] = Game.useStore((state) => [
      state.game !== undefined,
      state.deinitialize,
    ]);
    const toggle = Dialog.useStore((state) => state.toggle);
    const [currentListBox, changeListBox] = ListBox.useStore((state) => [
      state.current,
      state.change,
    ]);

    const settingsDialog = new SettingsDialog(me.settings);

    let contexts = [];
    if (room === undefined) {
      contexts.push(Context.Lobby);
    } else {
      contexts.push(room.master === me.id ? Context.Master : Context.Room);
      if (isGaming) {
        contexts.push(Context.Gaming);
      }
    }

    return (
      <section className="top-menu">
        {buttons
          .filter((config) => {
            for (const context of contexts) {
              if (!config.contexts.includes(context)) {
                return false;
              }
            }
            return true;
          })
          .map((config, index) => {
            const className = new ClassName(`menu-${config.type}`);
            if (config.isTiny) {
              className.push("tiny-menu");
            }
            const props: React.DetailedHTMLProps<
              React.ButtonHTMLAttributes<HTMLButtonElement>,
              HTMLButtonElement
            > = {};
            switch (config.type) {
              case Type.Settings:
                props.onClick = () => toggle(settingsDialog);
                break;
              case Type.Community:
                props.onClick = () => toggle(CommunityDialog.instance);
                break;
              case Type.BlackList:
                props.onClick = () => toggle(BlackListDialog.instance);
                break;
              case Type.CreateRoom:
                props.onClick = () => toggle(CreateRoomDialog.instance);
                break;
              case Type.RoomSettings:
                props.onClick = () => {
                  if (room === undefined) {
                    return;
                  }
                  toggle(RoomSettingsDialog.instance);
                };
                break;
              case Type.SearchRoom:
                if (currentListBox === ListBox.Type.SearchRoom)
                  className.push("menu-toggled");
                props.onClick = () =>
                  currentListBox === ListBox.Type.SearchRoom
                    ? changeListBox(ListBox.Type.RoomList)
                    : changeListBox(ListBox.Type.SearchRoom);
                break;
              case Type.Dictionary:
                props.onClick = () => toggle(DictionaryDialog.instance);
                break;
              case Type.Invite:
                props.onClick = () => toggle(InviteDialog.instance);
                break;
              case Type.Spectate:
                if (
                  room &&
                  me.id in room.members &&
                  room.members[me.id].isSpectator
                )
                  className.push("menu-toggled");
                props.onClick = () =>
                  socket.send(WebSocketMessage.Type.Spectate, {});
                break;
              case Type.Ready:
                if (
                  room &&
                  me.id in room.members &&
                  room.members[me.id].isReady
                )
                  className.push("menu-toggled");
                props.onClick = () =>
                  room !== undefined &&
                  socket.send(WebSocketMessage.Type.Ready, {});
                break;
              case Type.Start:
                props.onClick = async () => {
                  if (room === undefined) {
                    return;
                  }
                  socket.send(WebSocketMessage.Type.Start, {});
                  try {
                    await socket.messageReceiver.wait(
                      WebSocketMessage.Type.Start
                    );
                  } catch (e) {
                    const { errorType } =
                      e as WebSocketError.Message[WebSocketError.Type];
                    switch (errorType) {
                      case WebSocketError.Type.BadRequest:
                        window.alert(l("error", 400));
                        break;
                      case WebSocketError.Type.Forbidden:
                        window.alert(l("error", 403));
                        break;
                      case WebSocketError.Type.Conflict:
                        window.alert(
                          l(
                            Object.keys(room.members).length === 1
                              ? "error_startAlone"
                              : "error_startNotReady"
                          )
                        );
                        break;
                      default:
                        window.alert(l("error_unknown"));
                        break;
                    }
                  }
                };
                break;
              case Type.Leave:
                props.onClick = async () => {
                  if (room === undefined) {
                    return;
                  }
                  if (!isGaming || (await window.confirm(l("confirm_leave")))) {
                    socket.send(WebSocketMessage.Type.LeaveRoom, {});
                    await socket.messageReceiver.wait(
                      WebSocketMessage.Type.LeaveRoom
                    );
                    deinitialize();
                    leaveRoom();
                  }
                };
                break;
            }
            return (
              <button
                key={index}
                type="button"
                {...props}
                className={className.toString()}
              >
                {config.badge === undefined ? null : <config.badge />}
                <config.label l={l} />
              </button>
            );
          })}
      </section>
    );
  }
}

