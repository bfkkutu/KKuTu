import React from "react";

import { Icon, IconType } from "front/@block/Icon";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";
import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import { MenuType } from "front/@global/Types";
import { Dialogs } from "front/@global/Bayadere/dialog/templates";

enum Action {
  Dialog,
  Tab,
}
interface MenuItem {
  type: MenuType;
  isTiny: boolean;
  label: React.ReactNode;
  action?: Action;
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
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    type: MenuType.Community,
    isTiny: true,
    label: <Icon type={IconType.NORMAL} name="comments" />,
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
    label: L.get("menu_createRoom"),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    type: MenuType.Quick,
    isTiny: false,
    label: L.get("menu_quick"),
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
            onClick: undefined,
          };
          switch (config.action) {
            case Action.Dialog:
              props.onClick = () => toggle(Dialogs[config.type]);
          }
          return (
            <button type="button" {...props}>
              {config.label}
            </button>
          );
        })}
    </section>
  );
}
