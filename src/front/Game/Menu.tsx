import React from "react";

import { Icon, IconType } from "front/@block/Icon";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { MenuType } from "front/@global/enums/MenuType";
import { WebSocketError, WebSocketMessage } from "../../common/WebSocket";
import { useRoomStore } from "front/Game/box/Room/Store";
import ClassName from "front/@global/ClassName";
import { useListBox } from "front/Game/box/ListBox/Store";
import { ListBoxType } from "front/@global/enums/ListBoxType";

import { SettingsDialog } from "front/Game/dialogs/Settings";
import { CommunityDialog } from "front/Game/dialogs/Community";
import { CreateRoomDialog } from "front/Game/dialogs/CreateRoom";
import { createRoomSettingsDialog } from "front/Game/dialogs/RoomSettings";
import { InviteDialog } from "front/Game/dialogs/Invite";
import { BlackListDialog } from "front/Game/dialogs/BlackList";

interface MenuItem {
  type: MenuType;
  isTiny: boolean;
  label: React.ReactNode;
  badge?: () => number;
  forLobby: boolean;
  forRoom: boolean;
  forMaster: boolean;
  forGaming: boolean;
}

const buttons: MenuItem[] = [
  {
    type: MenuType.Help,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="question-circle" />,
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.Settings,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="wrench" />,
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.Community,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="comments" />,
    badge: () => useStore.getState().community.friendRequests.received.length,
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.BlackList,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="ban" />,
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.Leaderboard,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="trophy" />,
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    type: MenuType.Spectate,
    isTiny: false,
    label: L.get("menu_spectate"),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    type: MenuType.RoomSettings,
    isTiny: false,
    label: L.get("menu_roomSettings"),
    forLobby: false,
    forRoom: false,
    forMaster: true,
    forGaming: false,
  },
  {
    type: MenuType.CreateRoom,
    isTiny: false,
    label: L.get("createRoom"),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    type: MenuType.SearchRoom,
    isTiny: false,
    label: L.get("menu_searchRoom"),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    type: MenuType.Shop,
    isTiny: false,
    label: L.get("menu_shop"),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    type: MenuType.Dictionary,
    isTiny: false,
    label: L.get("menu_dict"),
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.Invite,
    isTiny: false,
    label: L.get("menu_invite"),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    type: MenuType.Practice,
    isTiny: false,
    label: L.get("menu_practice"),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    type: MenuType.Ready,
    isTiny: false,
    label: L.get("menu_ready"),
    forLobby: false,
    forRoom: true,
    forMaster: false,
    forGaming: false,
  },
  {
    type: MenuType.Start,
    isTiny: false,
    label: L.get("menu_start"),
    forLobby: false,
    forRoom: false,
    forMaster: true,
    forGaming: false,
  },
  {
    type: MenuType.Leave,
    isTiny: false,
    label: L.get("menu_leave"),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    type: MenuType.Replay,
    isTiny: false,
    label: L.get("menu_replay"),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
];

export function Menu() {
  const socket = useStore((state) => state.socket);
  const me = useStore((state) => state.me);
  const [room, leaveRoom] = useRoomStore((state) => [
    state.room,
    state.leaveRoom,
  ]);
  const toggle = useDialogStore((state) => state.toggle);
  const [currentListBox, changeListBox] = useListBox((state) => [
    state.current,
    state.change,
  ]);

  const RoomSettingsDialog =
    room && createRoomSettingsDialog({ ...room, password: "\0".repeat(20) });
  let property: keyof MenuItem = "forLobby";

  if (room === undefined) property = "forLobby";
  else if (room.master === me.id) property = "forMaster";
  else property = "forRoom";

  return (
    <section className="top-menu">
      {buttons
        .filter((config) => config[property])
        .map((config) => {
          const className = new ClassName(`menu-${config.type}`);
          if (config.isTiny) className.push("tiny-menu");
          const props: React.DetailedHTMLProps<
            React.ButtonHTMLAttributes<HTMLButtonElement>,
            HTMLButtonElement
          > = {};
          switch (config.type) {
            case MenuType.Settings:
              props.onClick = () => toggle(SettingsDialog);
              break;
            case MenuType.Community:
              props.onClick = () => toggle(CommunityDialog);
              break;
            case MenuType.BlackList:
              props.onClick = () => toggle(BlackListDialog);
              break;
            case MenuType.CreateRoom:
              props.onClick = () => toggle(CreateRoomDialog);
              break;
            case MenuType.RoomSettings:
              props.onClick = () =>
                RoomSettingsDialog && toggle(RoomSettingsDialog);
              break;
            case MenuType.SearchRoom:
              if (currentListBox === ListBoxType.SearchRoom)
                className.push("menu-toggled");
              props.onClick = () =>
                currentListBox === ListBoxType.SearchRoom
                  ? changeListBox(ListBoxType.RoomList)
                  : changeListBox(ListBoxType.SearchRoom);
              break;
            case MenuType.Invite:
              props.onClick = () => toggle(InviteDialog);
              break;
            case MenuType.Spectate:
              if (
                room &&
                me.id in room.members &&
                room.members[me.id].isSpectator
              )
                className.push("menu-toggled");
              props.onClick = () =>
                socket.send(WebSocketMessage.Type.Spectate, {});
              break;
            case MenuType.Ready:
              if (room && me.id in room.members && room.members[me.id].isReady)
                className.push("menu-toggled");
              props.onClick = () =>
                socket.send(WebSocketMessage.Type.Ready, {});
              break;
            case MenuType.Start:
              props.onClick = async () => {
                socket.send(WebSocketMessage.Type.Start, {});
                try {
                  await socket.messageReceiver.wait(
                    WebSocketMessage.Type.Start
                  );
                } catch (e) {
                  const message =
                    e as WebSocketError.Message[WebSocketError.Type];
                  switch (message.errorType) {
                    case WebSocketError.Type.BadRequest:
                      alert(L.get("error_400"));
                      break;
                    case WebSocketError.Type.Forbidden:
                      alert(L.get("error_403"));
                      break;
                    case WebSocketError.Type.Conflict:
                      alert(L.get("error_startNotReady"));
                      break;
                    default:
                      alert(L.get("error_unknown"));
                      break;
                  }
                }
              };
              break;
            case MenuType.Leave:
              props.onClick = () => {
                socket.send(WebSocketMessage.Type.LeaveRoom, {});
                socket.messageReceiver
                  .wait(WebSocketMessage.Type.LeaveRoom)
                  .then(() => leaveRoom());
              };
              break;
          }
          const badge = config.badge && config.badge();
          return (
            <button type="button" {...props} className={className.toString()}>
              {badge ? <span className="badge">{badge}</span> : null}
              {config.label}
            </button>
          );
        })}
    </section>
  );
}
