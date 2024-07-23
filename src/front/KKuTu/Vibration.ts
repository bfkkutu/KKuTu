import { create } from "zustand";

interface State {
  vibration: number;
  setVibration: (value: number) => void;
}
export const useVibration = create<State>((setState) => ({
  vibration: 0,
  setVibration: (value) => setState({ vibration: value }),
}));
