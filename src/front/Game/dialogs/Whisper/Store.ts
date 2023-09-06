import { create } from "zustand";

import { Whisper } from "front/@global/interfaces/Whisper";

interface State {
  log: Table<Whisper[]>;
}

export const useWhisperStore = create<State>((setState) => ({
  log: {},
}));
