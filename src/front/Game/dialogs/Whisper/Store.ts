import { create } from "zustand";

import { Whisper } from "front/@global/interfaces/Whisper";
import DialogData from "front/@global/Bayadere/dialog/DialogData";

interface State {
  openWhisper: (targetId: string, dt: DialogData) => void;
  closeWhisper: (targetId: string) => void;

  dialogs: Table<DialogData | undefined>;

  logs: Table<Whisper[]>;
  appendLog: (userId: string, whisper: Whisper) => number;
}

export const useWhisperStore = create<State>((setState, getState) => ({
  openWhisper: (targetId, dt) =>
    setState(({ dialogs, logs }) => ({
      dialogs: { ...dialogs, [targetId]: dt },
      logs: { ...logs, [targetId]: logs[targetId] || [] },
    })),
  closeWhisper: (targetId) =>
    setState(({ dialogs, logs }) => {
      if (dialogs[targetId] === undefined) return {};
      const R = { ...dialogs };
      delete R[targetId];
      return { dialogs: R, logs: { ...logs, [targetId]: [] } };
    }),

  dialogs: {},

  logs: {},
  appendLog: (userId, whisper) => {
    const { logs } = getState();
    const R = [whisper];
    if (Array.isArray(logs[userId])) R.push(...logs[userId]);
    setState(() => {
      if (R.length > 100) R.pop();
      return {
        logs: { ...logs, [userId]: R },
      };
    });
    return R.length;
  },
}));
