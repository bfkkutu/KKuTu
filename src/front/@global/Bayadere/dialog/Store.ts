import { create } from "zustand";

import DialogData from "front/@global/Bayadere/dialog/DialogData";

interface State {
  dialogs: DialogData[];
  show: (dt: DialogData) => void;
  hide: (dt: DialogData) => void;
  toggle: (dt: DialogData) => void;
}
export const useDialogStore = create<State>((setState) => ({
  dialogs: [],
  show: (dt) => {
    dt.initializeState();
    dt.visible = true;
    setState(({ dialogs }) => ({ dialogs: [...dialogs, dt] }));
  },
  hide: (dt) => {
    if (dt.visible) dt.onHide?.();
    dt.visible = false;
    setState(({ dialogs }) => ({
      dialogs: dialogs.filter((dialog) => dialog !== dt),
    }));
  },
  toggle: (dt) => {
    if (dt.visible) {
      dt.onHide?.();
      setState(({ dialogs }) => ({
        dialogs: dialogs.filter((dialog) => dialog !== dt),
      }));
    } else {
      dt.initializeState();
      setState(({ dialogs }) => ({ dialogs: [...dialogs, dt] }));
    }
    dt.visible = !dt.visible;
  },
}));
