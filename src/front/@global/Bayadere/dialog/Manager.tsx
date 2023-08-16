import React from "react";

import { useDialogStore } from "front/@global/Bayadere/dialog/Store";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

interface Props extends DialogTuple {
  hide: () => void;
}
interface State {
  x: number;
  y: number;
  isMoving: boolean;
}
class Dialog extends React.PureComponent<Props, State> {
  public state: State = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isMoving: false,
  };
  public componentDidMount(): void {
    window.addEventListener(
      "mousemove",
      (e) =>
        this.state.isMoving &&
        this.setState({
          x: this.state.x + e.movementX,
          y: this.state.y + e.movementY,
        })
    );
    window.addEventListener("mouseup", () =>
      this.setState({ isMoving: false })
    );
  }
  public render(): React.ReactNode {
    return (
      <div
        className="dialog"
        style={{ top: `${this.state.y}px`, left: `${this.state.x}px` }}
      >
        <div
          className="head"
          onMouseDown={() => this.setState({ isMoving: true })}
        >
          <label>{this.props.title}</label>
          <div className="button-close" onClick={() => this.props.hide()} />
        </div>
        <div className="body">{React.createElement(this.props.body)}</div>
        <div className="footer">{React.createElement(this.props.footer)}</div>
      </div>
    );
  }
}

export default function DialogManager() {
  const [dialogs, hide] = useDialogStore((state) => [
    state.dialogs,
    state.hide,
  ]);

  return (
    <div id="dialog">
      {dialogs.map((dialog) => (
        <Dialog {...dialog} hide={() => hide(dialog)} />
      ))}
    </div>
  );
}
