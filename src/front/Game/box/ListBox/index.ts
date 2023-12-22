import React from "react";
import { create } from "zustand";

import { ListBoxType } from "front/@global/enums/ListBoxType";

import RoomListBox from "front/Game/box/ListBox/RoomList";
import SearchRoom from "front/Game/box/ListBox/SearchRoom";

export namespace List {
  const TABLE: Record<ListBoxType, React.FC> = {
    [ListBoxType.RoomList]: RoomListBox,
    [ListBoxType.SearchRoom]: SearchRoom,
    [ListBoxType.Shop]: () => null,
  };

  export function Box() {
    return React.createElement(TABLE[useStore((state) => state.current)]);
  }

  interface State {
    current: ListBoxType;
    change: (type: ListBoxType) => void;
  }

  export const useStore = create<State>((setState) => ({
    current: ListBoxType.RoomList,
    change: (type) => setState({ current: type }),
  }));
}
