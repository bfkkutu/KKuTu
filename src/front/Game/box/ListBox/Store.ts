import { create } from "zustand";

import { ListBoxType } from "front/@global/enums/ListBoxType";

interface State {
  current: ListBoxType;
  change: (type: ListBoxType) => void;
}

export const useListBox = create<State>((setState) => ({
  current: ListBoxType.RoomList,
  change: (type) => setState({ current: type }),
}));
