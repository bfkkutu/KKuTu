import React from "react";
import { Oval } from "react-loader-spinner";
import { create } from "zustand";

export namespace Spinner {
  interface State {
    visible: boolean;
    show: () => void;
    hide: () => void;
    toggle: () => void;
  }
  export const useStore = create<State>((setState) => ({
    visible: false,
    show: () => setState({ visible: true }),
    hide: () => setState({ visible: false }),
    toggle: () => setState(({ visible }) => ({ visible: !visible })),
  }));

  export function Manager() {
    const visible = useStore((state) => state.visible);

    if (!visible) return null;
    return (
      <Oval
        height={80}
        width={80}
        color="#fff"
        ariaLabel="oval-loading"
        secondaryColor="#000"
        strokeWidth={3}
        strokeWidthSecondary={3}
        wrapperClass="spinner-wrapper"
        visible
      />
    );
  }
}
