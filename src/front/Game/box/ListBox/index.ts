import React from "react";

import { useListBox } from "front/Game/box/ListBox/Store";
import { ListBoxType } from "front/@global/enums/ListBoxType";
import RoomListBox from "./RoomList";
import SearchRoom from "./SearchRoom";

const TABLE: Record<ListBoxType, React.FC> = {
  [ListBoxType.RoomList]: RoomListBox,
  [ListBoxType.SearchRoom]: SearchRoom,
  [ListBoxType.Shop]: () => null,
};

export default function ListBox() {
  return React.createElement(TABLE[useListBox((state) => state.current)]);
}
