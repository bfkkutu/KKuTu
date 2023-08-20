import React from "react";

import { Icon, IconType } from "front/@block/Icon";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { MenuType } from "front/@global/enums/MenuType";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

import { SettingsDialog } from "front/@global/Bayadere/dialog/templates/Settings";
import { CommunityDialog } from "front/@global/Bayadere/dialog/templates/Community";
import { CreateRoomDialog } from "front/@global/Bayadere/dialog/templates/CreateRoom";

enum Action {
  Dialog,
  Tab,
}
interface MenuItem {
  type: MenuType;
  isTiny: boolean;
  label: React.ReactNode;
  badge?: () => number;
  action?: Action;
  dialog?: DialogTuple;
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
    action: Action.Dialog,
    dialog: SettingsDialog,
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
    action: Action.Dialog,
    dialog: CommunityDialog,
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.Leaderboard,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="trophy" />,
    action: Action.Dialog,
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
    action: Action.Dialog,
    dialog: CreateRoomDialog,
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
    type: MenuType.Exit,
    isTiny: false,
    label: L.get("menu_exit"),
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
  const room = useStore((state) => state.room);
  const toggle = useDialogStore((state) => state.toggle);
  let property: keyof MenuItem = "forLobby";

  if (room === undefined) property = "forLobby";
  return (
    <section className="top-menu">
      {buttons
        .filter((config) => config[property])
        .map((config) => {
          const classNames = [`menu-${config.type}`];
          if (config.isTiny) classNames.push("tiny-menu");
          const props: React.DetailedHTMLProps<
            React.ButtonHTMLAttributes<HTMLButtonElement>,
            HTMLButtonElement
          > = {
            className: classNames.join(" "),
          };
          switch (config.action) {
            case Action.Dialog:
              props.onClick = () => toggle(config.dialog!);
              break;
          }
          const badge = config.badge && config.badge();
          return (
            <button type="button" {...props}>
              {badge ? <span className="badge">{badge}</span> : null}
              {config.label}
            </button>
          );
        })}
    </section>
  );
}
