import React from "react";
import { create } from "zustand";

interface State {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  createOnMouseEnter: (content: string) => React.MouseEventHandler;
  onMouseMove: React.MouseEventHandler;
  onMouseLeave: React.MouseEventHandler;
}

export const useTooltipStore = create<State>((setState) => ({
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
