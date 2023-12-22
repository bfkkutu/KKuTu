import React, { useRef } from "react";
import { create } from "zustand";

export namespace Tooltip {
  interface State {
    visible: boolean;
    x: number;
    y: number;
    content: string;
    createOnMouseEnter: (content: string) => React.MouseEventHandler;
    onMouseMove: React.MouseEventHandler;
    onMouseLeave: React.MouseEventHandler;
  }

  export const useStore = create<State>((setState) => ({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    createOnMouseEnter:
      (content) =>
      ({ clientX, clientY }) =>
        setState({
          visible: true,
          x: clientX,
          y: clientY,
          content,
        }),
    onMouseMove: ({ movementX, movementY }) =>
      setState(({ x, y }) => ({ x: x + movementX, y: y + movementY })),
    onMouseLeave: () => setState({ visible: false }),
  }));

  export function Manager() {
    const [visible, x, y, content] = useStore((state) => [
      state.visible,
      state.x,
      state.y,
      state.content,
    ]);
    const $ = useRef<HTMLDivElement>(null);

    return visible ? (
      <div
        id="tooltip"
        style={
          $.current === null
            ? { top: `${y}px`, left: `${x}px` }
            : {
                top: `${y - $.current.clientHeight - 5}px`,
                left: `${x - $.current.clientWidth / 2}px`,
              }
        }
        ref={$}
      >
        {content}
      </div>
    ) : null;
  }
}
