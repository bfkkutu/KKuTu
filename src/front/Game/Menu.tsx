import React from "react";

import { Icon, IconType } from "front/@block/Icon";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import ClassName from "front/@global/ClassName";
import { ListBoxType } from "front/@global/enums/ListBoxType";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { Room } from "front/Game/box/Room";
import { List } from "front/Game/box/ListBox";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";

import SettingsDialog from "front/Game/dialogs/Settings";
import CommunityDialog from "front/Game/dialogs/Community";
import CreateRoomDialog from "front/Game/dialogs/CreateRoom";
import RoomSettingsDialog from "front/Game/dialogs/RoomSettings";
import InviteDialog from "front/Game/dialogs/Invite";
import BlackListDialog from "front/Game/dialogs/BlackList";

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
    label: React.ReactNode;
    badge?: () => number;
    contexts: Context[];
  }

  const buttons: Item[] = [
    {
      type: Type.Help,
      isTiny: true,
      label: <Icon type={IconType.NORMAL} name="question-circle" />,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Settings,
      isTiny: true,
      label: <Icon type={IconType.NORMAL} name="wrench" />,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Community,
      isTiny: true,
      label: <Icon type={IconType.NORMAL} name="comments" />,
      badge: () => useStore.getState().community.friendRequests.received.length,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.BlackList,
      isTiny: true,
      label: <Icon type={IconType.NORMAL} name="ban" />,
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Leaderboard,
      isTiny: true,
      label: <Icon type={IconType.NORMAL} name="trophy" />,
      contexts: [Context.Lobby],
    },
    {
      type: Type.Spectate,
      isTiny: false,
      label: L.get("menu_spectate"),
      contexts: [Context.Room, Context.Master],
    },
    {
      type: Type.RoomSettings,
      isTiny: false,
      label: L.get("menu_roomSettings"),
      contexts: [Context.Master],
    },
    {
      type: Type.CreateRoom,
      isTiny: false,
      label: L.get("createRoom"),
      contexts: [Context.Lobby],
    },
    {
      type: Type.SearchRoom,
      isTiny: false,
      label: L.get("menu_searchRoom"),
      contexts: [Context.Lobby],
    },
    {
      type: Type.Shop,
      isTiny: false,
      label: L.get("menu_shop"),
      contexts: [Context.Lobby],
    },
    {
      type: Type.Dictionary,
      isTiny: false,
      label: L.get("menu_dict"),
      contexts: [Context.Lobby, Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Invite,
      isTiny: false,
      label: L.get("menu_invite"),
      contexts: [Context.Room, Context.Master],
    },
    {
      type: Type.Practice,
      isTiny: false,
      label: L.get("menu_practice"),
      contexts: [Context.Room, Context.Master],
    },
    {
      type: Type.Ready,
      isTiny: false,
      label: L.get("menu_ready"),
      contexts: [Context.Room],
    },
    {
      type: Type.Start,
      isTiny: false,
      label: L.get("menu_start"),
      contexts: [Context.Master],
    },
    {
      type: Type.Leave,
      isTiny: false,
      label: L.get("menu_leave"),
      contexts: [Context.Room, Context.Master, Context.Gaming],
    },
    {
      type: Type.Replay,
      isTiny: false,
      label: L.get("menu_replay"),
      contexts: [Context.Lobby],
    },
  ];

  export function Component() {
    const socket = useStore((state) => state.socket);
    const me = useStore((state) => state.me);
    const [room, leaveRoom] = Room.useStore((state) => [
      state.room,
      state.leaveRoom,
    ]);
    const toggle = Dialog.useStore((state) => state.toggle);
    const [currentListBox, changeListBox] = List.useStore((state) => [
      state.current,
      state.change,
    ]);

    const roomSettingsDialog =
      room && new RoomSettingsDialog({ ...room, password: "" });
    let contexts = [];

    if (room === undefined) {
      contexts.push(Context.Lobby);
    } else {
      contexts.push(room.master === me.id ? Context.Master : Context.Room);
      if (room.game !== undefined) {
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
                props.onClick = () => toggle(SettingsDialog.instance);
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
                props.onClick = () =>
                  roomSettingsDialog && toggle(roomSettingsDialog);
                break;
              case Type.SearchRoom:
                if (currentListBox === ListBoxType.SearchRoom)
                  className.push("menu-toggled");
                props.onClick = () =>
                  currentListBox === ListBoxType.SearchRoom
                    ? changeListBox(ListBoxType.RoomList)
                    : changeListBox(ListBoxType.SearchRoom);
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
                        window.alert(L.get("error_400"));
                        break;
                      case WebSocketError.Type.Forbidden:
                        window.alert(L.get("error_403"));
                        break;
                      case WebSocketError.Type.Conflict:
                        window.alert(
                          L.get(
                            Object.keys(room.members).length === 1
                              ? "error_startAlone"
                              : "error_startNotReady"
                          )
                        );
                        break;
                      default:
                        window.alert(L.get("error_unknown"));
                        break;
                    }
                  }
                };
                break;
              case Type.Leave:
                props.onClick = () => {
                  if (room === undefined) {
                    return;
                  }
                  socket.send(WebSocketMessage.Type.LeaveRoom, {});
                  socket.messageReceiver
                    .wait(WebSocketMessage.Type.LeaveRoom)
                    .then(() => leaveRoom());
                };
                break;
            }
            const badge = config.badge && config.badge();
            return (
              <button
                key={index}
                type="button"
                {...props}
                className={className.toString()}
              >
                {badge ? <span className="badge">{badge}</span> : null}
                {config.label}
              </button>
            );
          })}
      </section>
    );
  }
}
