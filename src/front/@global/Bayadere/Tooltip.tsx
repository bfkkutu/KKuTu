import React, { useRef } from "react";
import { create } from "zustand";

export class Tooltip {
  public content: string;

  constructor(content: string) {
    this.content = content;
  }
}
export namespace Tooltip {
  interface State {
    x: number;
    y: number;
    instance?: Tooltip;
    createOnMouseEnter: (instance: Tooltip) => React.MouseEventHandler;
    onMouseMove: React.MouseEventHandler;
    onMouseLeave: React.MouseEventHandler;
    hide: () => void;
  }

  export const useStore = create<State>((setState) => {
    const hide = () => setState({ instance: undefined });

    return {
      x: 0,
      y: 0,
      instance: undefined,
      createOnMouseEnter:
        (instance) =>
        ({ clientX, clientY }) =>
          setState({
            x: clientX,
            y: clientY,
            instance,
          }),
      onMouseMove: ({ movementX, movementY }) =>
        setState(({ x, y }) => ({ x: x + movementX, y: y + movementY })),
      onMouseLeave: hide,
      hide,
    };
  });

  export function Manager() {
    const [x, y, instance] = useStore((state) => [
      state.x,
      state.y,
      state.instance,
    ]);
    const $ = useRef<HTMLDivElement>(null);

    return instance === undefined ? null : (
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
        {instance.content}
      </div>
    );
  }
}
