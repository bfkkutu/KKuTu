import { create } from "zustand";

import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

interface State {
  dialogs: DialogTuple[];
  show: (dt: DialogTuple) => void;
  hide: (dt: DialogTuple) => void;
  toggle: (dt: DialogTuple) => void;
}
export const useDialogStore = create<State>((setState) => ({
  dialogs: [],
  show: (dt) => {
    setState(({ dialogs }) => ({ dialogs: [...dialogs, dt] }));
  },
  hide: (dt) =>
    setState(({ dialogs }) => ({
      dialogs: dialogs.filter((dialog) => dialog !== dt),
    })),
  toggle: (dt) =>
    setState((state) => ({
      dialogs: state.dialogs.find((dialog) => dialog === dt)
        ? state.dialogs.filter((dialog) => dialog !== dt)
        : [...state.dialogs, dt],
    })),
}));
