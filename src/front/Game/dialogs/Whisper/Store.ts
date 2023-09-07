import { create } from "zustand";

import { Whisper } from "front/@global/interfaces/Whisper";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

interface State {
  openWhisper: (targetId: string, dt: DialogTuple) => void;
  closeWhisper: (targetId: string) => void;

  dialogs: Table<DialogTuple | undefined>;

  logs: Table<Whisper[]>;
  appendLog: (whisper: Whisper) => void;
}

export const useWhisperStore = create<State>((setState) => ({
  openWhisper: (targetId, dt) =>
    setState(({ dialogs, logs }) => ({
      dialogs: { ...dialogs, [targetId]: dt },
      logs: { ...logs, [targetId]: [] },
    })),
  closeWhisper: (targetId) =>
    setState(({ dialogs, logs }) => {
      if (dialogs[targetId] === undefined && logs[targetId] === undefined)
        return {};
      const R = { dialogs: { ...dialogs }, logs: { ...logs } };
      delete R.dialogs[targetId];
      delete R.logs[targetId];
      return R;
    }),

  dialogs: {},

  logs: {},
  appendLog: (whisper) =>
    setState(({ logs }) => ({
      logs: { ...logs, [whisper.sender]: [...logs[whisper.sender], whisper] },
    })),
}));
