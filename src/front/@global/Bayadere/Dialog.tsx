import React, { useState, useRef, useEffect } from "react";
import { create, UseBoundStore, StoreApi } from "zustand";

import { renderComponentOrNode } from "front/@global/Utility";
import { Point } from "front/@global/Point";

export class Dialog {
  public title: React.ComponentOrNode;
  public content: React.FC;
  public usePoint!: UseBoundStore<StoreApi<Point>>;
  public visible = false;
  /**
   * Clean up을 위한 함수.
   */
  public onHide?: Dialog.OnHide;

  constructor(
    title: React.ComponentOrNode,
    content: React.FC,
    onHide?: Dialog.OnHide
  ) {
    this.title = title;
    this.content = content;
    this.onHide = onHide;
    this.initializeState();
  }

  public initializeState() {
    this.usePoint = create<Point>((setState) => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      move: (movementX, movementY) =>
        setState(({ x, y }) => ({
          x: x + movementX,
          y: y + movementY,
        })),
    }));
  }
}

export namespace Dialog {
  export type OnHide = () => void;

  interface State {
    dialogs: Dialog[];
    show: (dialog: Dialog) => void;
    hide: (dialog: Dialog) => void;
    toggle: (dialog: Dialog) => void;
  }
  export const useStore = create<State>((setState) => ({
    dialogs: [],
    show: (dialog) => {
      dialog.initializeState();
      dialog.visible = true;
      setState(({ dialogs }) => ({ dialogs: [...dialogs, dialog] }));
    },
    hide: (dialog) => {
      if (dialog.visible) {
        dialog.onHide?.();
      }
      dialog.visible = false;
      setState(({ dialogs }) => ({
        dialogs: dialogs.filter((v) => v !== dialog),
      }));
    },
    toggle: (dialog) => {
      if (dialog.visible) {
        dialog.onHide?.();
        setState(({ dialogs }) => ({
          dialogs: dialogs.filter((v) => v !== dialog),
        }));
      } else {
        dialog.initializeState();
        setState(({ dialogs }) => ({ dialogs: [...dialogs, dialog] }));
      }
      dialog.visible = !dialog.visible;
    },
  }));

  interface Props {
    instance: Dialog;
  }
  export function Component({ instance }: Props) {
    const hide = useStore((state) => state.hide);
    const [x, y, move] = instance.usePoint((state) => [
      state.x,
      state.y,
      state.move,
    ]);
    const [isMoving, setIsMoving] = useState(false);
    const [animation, setAnimation] = useState("appearing");
    const $ = useRef<HTMLDivElement>(null);
    const mousemove = (e: MouseEvent) =>
      isMoving && move(e.movementX, e.movementY);
    const mouseup = () => setIsMoving(false);

    useEffect(() => {
      // mount 이전에는 dialog의 크기를 알 수 없으므로 mount 직후 업데이트한다.
      if ($.current)
        move(-$.current.clientWidth / 2, -$.current.clientHeight / 2);
      window.setTimeout(() => {
        setAnimation("");
        if ($.current)
          $.current.onkeydown = (e) => {
            if (e.code === "Escape") hide(instance);
          };
      }, 200);
    }, []);

    useEffect(() => {
      // 마우스가 head에서 벗어나도 마우스를 떼기 전까지는 움직이는 상태를 유지하게 하기 위해 전역에 이벤트 리스너를 건다.
      if (isMoving) {
        window.addEventListener("mousemove", mousemove);
        window.addEventListener("mouseup", mouseup);
      }
      return () => {
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
      };
    }, [isMoving]);

    return (
      <div
        className={`dialog ${animation}`}
        ref={$}
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        <div className="head" onMouseDown={() => setIsMoving(true)}>
          <label>{renderComponentOrNode(instance.title)}</label>
          <div
            className="button-close"
            onClick={() => {
              setAnimation("disappearing");
              window.setTimeout(() => hide(instance), 200);
            }}
          />
        </div>
        {React.createElement(instance.content)}
      </div>
    );
  }

  export function Manager() {
    const dialogs = useStore((state) => state.dialogs);

    return (
      <div id="dialog">
        {dialogs.map((dialog, index) => (
          <Component key={index} instance={dialog} />
        ))}
      </div>
    );
  }
}
