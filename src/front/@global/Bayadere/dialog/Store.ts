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
    dt.initializeState();
    dt.visible = true;
    setState(({ dialogs }) => ({ dialogs: [...dialogs, dt] }));
  },
  hide: (dt) => {
    dt.visible = false;
    setState(({ dialogs }) => ({
      dialogs: dialogs.filter((dialog) => dialog !== dt),
    }));
  },
  toggle: (dt) => {
    if (dt.visible)
      setState(({ dialogs }) => ({
        dialogs: dialogs.filter((dialog) => dialog !== dt),
      }));
    else {
      dt.initializeState();
      setState(({ dialogs }) => ({ dialogs: [...dialogs, dt] }));
    }
    dt.visible = !dt.visible;
  },
}));
