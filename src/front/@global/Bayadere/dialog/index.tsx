import React, { useState, useRef, useEffect } from "react";

import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import DialogData from "front/@global/Bayadere/dialog/DialogData";

interface Props {
  instance: DialogData;
}
function Dialog({ instance }: Props) {
  const hide = useDialogStore((state) => state.hide);
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
        <label>
          {typeof instance.title === "string"
            ? instance.title
            : React.createElement(instance.title)}
        </label>
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

export default function DialogManager() {
  const dialogs = useDialogStore((state) => state.dialogs);

  return (
    <div id="dialog">
      {dialogs.map((dialog) => (
        <Dialog instance={dialog} />
      ))}
    </div>
  );
}
