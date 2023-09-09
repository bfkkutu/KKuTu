import React, { useRef } from "react";

import { useTooltipStore } from "front/@global/Bayadere/tooltip/Store";

export default function TooltipManager() {
  const [visible, x, y, content] = useTooltipStore((state) => [
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
