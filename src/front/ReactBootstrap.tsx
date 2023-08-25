import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { PROPS } from "front/@global/Utility";
import { Nest } from "common/Nest";

import Footer from "front/@global/Footer";
import Header from "front/@global/Header";
import L from "front/@global/Language";
import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

import DialogManager from "front/@global/Bayadere/dialog/Manager";
import SpinnerManager from "front/@global/Bayadere/spinner/Manager";

import { useDialogStore } from "front/@global/Bayadere/dialog/Store";

if (typeof window !== "undefined") {
  window.alert = (content: React.ReactNode) =>
    new Promise<void>((resolve) => {
      const dialog = new DialogTuple(L.get("alert"), () => {
        const hide = useDialogStore((state) => state.hide);

        return (
          <>
            <div className="body dialog-alert">{content}</div>
            <div className="footer">
              <button
                type="button"
                onClick={() => {
                  hide(dialog);
                  resolve();
                }}
              >
                {L.get("ok")}
              </button>
            </div>
          </>
        );
      });
      useDialogStore.getState().show(dialog);
    });
  // @ts-ignore
  window.prompt = (title: string, content: React.ReactNode) =>
    new Promise<string | null>((resolve) => {
      const dialog = new DialogTuple(title, () => {
        const hide = useDialogStore((state) => state.hide);
        const [input, setInput] = useState("");

        return (
          <>
            <div className="body dialog-prompt">
              {content}
              <input
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
              />
            </div>
            <div className="footer">
              <button
                type="button"
                onClick={() => {
                  hide(dialog);
                  resolve(input);
                }}
              >
                {L.get("ok")}
              </button>
              <button
                type="button"
                onClick={() => {
                  hide(dialog);
                  resolve(null);
                }}
              >
                {L.get("cancel")}
              </button>
            </div>
          </>
        );
      });
      useDialogStore.getState().show(dialog);
    });
  // @ts-ignore
  window.confirm = (content: React.ReactNode) =>
    new Promise<boolean>((resolve) => {
      const dialog = new DialogTuple(L.get("confirm"), () => {
        const hide = useDialogStore((state) => state.hide);

        return (
          <>
            <div className="body dialog-confirm">{content}</div>
            <div className="footer">
              <button
                type="button"
                onClick={() => {
                  hide(dialog);
                  resolve(true);
                }}
              >
                {L.get("yes")}
              </button>
              <button
                type="button"
                onClick={() => {
                  hide(dialog);
                  resolve(false);
                }}
              >
                {L.get("no")}
              </button>
            </div>
          </>
        );
      });
      useDialogStore.getState().show(dialog);
    });
  window.onselectstart = window.ondragstart = () => false;
}

interface State {
  error?: Error;
}

export default function Bind(
  TargetClass: React.FC<any> | typeof React.PureComponent
) {
  const $root = document.getElementById("stage") as HTMLTableSectionElement;

  ReactDOM.createRoot($root).render(
    React.createElement(Root, PROPS, React.createElement(TargetClass, PROPS))
  );
}
export class Root extends React.PureComponent<Nest.Page.Props<any>, State> {
  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }
  public state: State = {};
  public render() {
    if (this.state.error !== undefined)
      return L.render("ERROR", this.state.error.message);
    return (
      <>
        <img id="background" className="jt-image" />
        <div id="bayadere">
          <DialogManager />
          <SpinnerManager />
        </div>
        <Header profile={this.props.session.profile} />
        {this.props.children}
        <Footer />
      </>
    );
  }
}
