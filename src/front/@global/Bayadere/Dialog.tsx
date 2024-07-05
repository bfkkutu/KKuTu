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
  public id = Dialog.id++;
  public usePoint: UseBoundStore<StoreApi<Point>>;
  public visible = false;
  private _hide?: () => void;

  public HeadComponent = React.memo(this.head.bind(this));
  public BodyComponent = React.memo(this.body.bind(this));

  constructor() {
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

  protected abstract head(): React.ReactElement;
  protected abstract body(): React.ReactElement;

  /**
   * Clean up을 위한 함수.
   * 하위 클래스에서 override한다.
   */
  public onHide(): void {}

  protected hide() {
    this._hide?.();
  }

  /**
   * Dialog를 초기화한다.
   * Dialog가 DOM에 표시되기 직전에 호출된다.
   */
  public initialize(): void {
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
  public bind(hide: Dialog.State["hide"]): void {
    this._hide = () => hide(this);
  }
  public unbind(): void {
    this._hide = undefined;
  }
}

export namespace Dialog {
  type Resolve<T> = (object: T | PromiseLike<T>) => void;
  type Reject = (reason: any) => void;
  export abstract class Asynchronous<T> extends Dialog {
    protected resolve: Resolve<T> = () => {};
    protected reject: Reject = () => {};
    public wait = new Promise<T>((resolve, reject) => {
      this.resolve = (value) => {
        this.hide();
        resolve(value);
      };
      this.reject = reject;
    });
  }

  export const hideActive = new ChainedFunction<[KeyboardEvent]>(
    (e) => e.code === "Escape"
  );

  export interface State {
    dialogs: Dialog[];
    show: (dialog: Dialog) => void;
    hide: (dialog: Dialog) => void;
    toggle: (dialog: Dialog) => void;
  }
  export const useStore = create<State>((setState) => ({
    dialogs: [],
    show: (dialog) => {
      hideActive.push(createChain(dialog));
      dialog.initialize();
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
        dialog.initialize();
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

    useEffect(() => {
      instance.bind(hide);

      return () => {
        instance.unbind();
      };
    }, [hide]);

    return (
      <div
        className={`dialog ${animation}`}
        ref={$}
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        <div className="head" onMouseDown={() => setIsMoving(true)}>
          <label>
            <instance.HeadComponent />
          </label>
          <div
            className="button-close"
            onClick={() => {
              setAnimation("disappearing");
              window.setTimeout(() => hide(instance), 200);
            }}
          />
        </div>
        <instance.BodyComponent />
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

