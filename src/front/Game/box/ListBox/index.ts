import React from "react";

import { useListBox } from "front/Game/box/ListBox/Store";
import { ListBoxType } from "front/@global/enums/ListBoxType";

import RoomListBox from "front/Game/box/ListBox/RoomList";
import SearchRoom from "front/Game/box/ListBox/SearchRoom";

const TABLE: Record<ListBoxType, React.FC> = {
  [ListBoxType.RoomList]: RoomListBox,
  [ListBoxType.SearchRoom]: SearchRoom,
  [ListBoxType.Shop]: () => null,
};

export default function ListBox() {
  return React.createElement(TABLE[useListBox((state) => state.current)]);
}
