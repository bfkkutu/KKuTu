import { create } from "zustand";

interface State {
  visible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}
export const useSpinnerStore = create<State>((setState) => ({
  visible: false,
  show: () => setState({ visible: true }),
  hide: () => setState({ visible: false }),
  toggle: () => setState(({ visible }) => ({ visible: !visible })),
}));
