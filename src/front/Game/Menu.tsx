import React from "react";

import { Icon, IconType } from "front/@block/Icon";
import L from "front/@global/Language";
import { useStore } from "front/Game/Store";

function MenuButton(
  type: MenuType,
  isTiny: boolean = false,
  children?: React.ReactNode
) {
  const classNames = [`menu-${type}`];
  if (isTiny) classNames.push("tiny-menu");
  return (
    <button type="button" className={classNames.join(" ")}>
      {children}
    </button>
  );
}

enum MenuType {
  Help = "help",
  Settings = "settings",
  Community = "community",
  Leaderboard = "leader",
  Spectate = "spectate",
  RoomSettings = "roomSettings",
  CreateRoom = "createRoom",
  Quick = "quick",
  Shop = "shop",
  Dictionary = "dict",
  Invite = "invite",
  Practice = "practice",
  Ready = "ready",
  Start = "start",
  Exit = "exit",
  Replay = "replay",
}
interface MenuItem {
  element: React.JSX.Element;
  forLobby: boolean;
  forRoom: boolean;
  forMaster: boolean;
  forGaming: boolean;
}

const buttons: MenuItem[] = [
  {
    element: MenuButton(
      MenuType.Help,
      true,
      <Icon type={IconType.NORMAL} name="question-circle" />
    ),
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    element: MenuButton(
      MenuType.Settings,
      true,
      <Icon type={IconType.NORMAL} name="wrench" />
    ),
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    element: MenuButton(
      MenuType.Community,
      true,
      <Icon type={IconType.NORMAL} name="comments" />
    ),
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    element: MenuButton(
      MenuType.Leaderboard,
      true,
      <Icon type={IconType.NORMAL} name="trophy" />
    ),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Spectate, false, L.get("menu_spectate")),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    element: MenuButton(
      MenuType.RoomSettings,
      false,
      L.get("menu_roomSettings")
    ),
    forLobby: false,
    forRoom: false,
    forMaster: true,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.CreateRoom, false, L.get("menu_createRoom")),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Quick, false, L.get("menu_quick")),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Shop, false, L.get("menu_shop")),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Dictionary, false, L.get("menu_dict")),
    forLobby: true,
    forRoom: true,
    forMaster: true,
    forGaming: true,
  },
  {
    element: MenuButton(MenuType.Invite, false, L.get("menu_invite")),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Practice, false, L.get("menu_practice")),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Ready, false, L.get("menu_ready")),
    forLobby: false,
    forRoom: true,
    forMaster: false,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Start, false, L.get("menu_start")),
    forLobby: false,
    forRoom: false,
    forMaster: true,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Exit, false, L.get("menu_exit")),
    forLobby: false,
    forRoom: true,
    forMaster: true,
    forGaming: false,
  },
  {
    element: MenuButton(MenuType.Replay, false, L.get("menu_replay")),
    forLobby: true,
    forRoom: false,
    forMaster: false,
    forGaming: false,
  },
];

export function Menu() {
  const room = useStore((state) => state.room);
  let property: keyof MenuItem = "forLobby";

  if (room === undefined) property = "forLobby";
  return (
    <section className="top-menu">
      {buttons
        .filter((config) => config[property])
        .map((config) => config.element)}
    </section>
  );
}
