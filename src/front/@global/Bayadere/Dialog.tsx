import React, { useState, useRef, useEffect } from "react";
import { create, UseBoundStore, StoreApi } from "zustand";

import { Point } from "front/@global/Point";
import { Chain, ChainedFunction } from "front/@global/Utility";

export abstract class Dialog {
  private static id = 0;
  /**
   * Dialog는 생성 순서의 역순으로
   * 소멸한다는 보장이 없다.
   * 따라서 Dialog마다 고유값을 부여한다.
   */
  public id: number;
  public mHead: React.FC<{}>;
  public mBody: React.FC<{}>;
  public usePoint: UseBoundStore<StoreApi<Point>>;
  public visible = false;
  /**
   * Clean up을 위한 함수.
   */
  public onHide?: Dialog.OnHide;

  constructor(onHide?: Dialog.OnHide) {
    this.id = Dialog.id++;
    this.mHead = React.memo(this.head.bind(this));
    this.mBody = React.memo(this.body.bind(this));
    this.onHide = onHide;
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

  public abstract head(): React.ReactElement;
  public abstract body(): React.ReactElement;

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
  type Resolve<T> = (object: T | PromiseLike<T>) => void;
  type Reject = (reason: any) => void;
  export abstract class Asynchronous<T> extends Dialog {
    protected resolve: Resolve<T> = () => {};
    protected reject: Reject = () => {};
    public wait = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  export const hideActive = new ChainedFunction<[KeyboardEvent]>(
    (e) => e.code === "Escape"
  );
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
      hideActive.push(createChain(dialog));
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
        hideActive.push(createChain(dialog));
        dialog.initializeState();
        setState(({ dialogs }) => ({ dialogs: [...dialogs, dialog] }));
      }
      dialog.visible = !dialog.visible;
    },
  }));
  function createChain(dialog: Dialog): Chain {
    return (pass) => {
      if (dialog.visible) {
        Dialog.useStore.getState().hide(dialog);
        return;
      }
      return pass();
    };
  }

  interface Props {
    instance: Dialog;
  }
  function Component({ instance }: Props) {
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
      if ($.current) {
        move(-$.current.clientWidth / 2, -$.current.clientHeight / 2);
      }
      window.setTimeout(() => setAnimation(""), 200);
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
          <label>
            <instance.mHead />
          </label>
          <div
            className="button-close"
            onClick={() => {
              setAnimation("disappearing");
              window.setTimeout(() => hide(instance), 200);
            }}
          />
        </div>
        <instance.mBody />
      </div>
    );
  }

  export function Manager() {
    const dialogs = useStore((state) => state.dialogs);

    return (
      <div id="dialog">
        {dialogs.map((dialog) => (
          <Component key={dialog.id} instance={dialog} />
        ))}
      </div>
    );
  }
}
