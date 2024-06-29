import React from "react";
import ReactDOM from "react-dom/client";

import { PROPS } from "front/@global/Utility";
import L from "front/@global/Language";
import { Nest } from "common/Nest";

import Footer from "front/@global/Footer";
import Header from "front/@global/Header";

import { Dialog } from "front/@global/Bayadere/Dialog";
import { Notification } from "front/@global/Bayadere/Notification";
import { Spinner } from "front/@global/Bayadere/Spinner";
import { Tooltip } from "front/@global/Bayadere/Tooltip";

import AlertDialog from "front/Game/dialogs/Alert";
import PromptDialog from "front/Game/dialogs/Prompt";
import ConfirmDialog from "front/Game/dialogs/Confirm";

if (typeof window !== "undefined") {
  window.alert = (content: React.ReactNode) => {
    const dialog = new AlertDialog(content);
    Dialog.useStore.getState().show(dialog);
    return dialog.wait;
  };
  // @ts-ignore
  window.prompt = (
    title: string,
    content: React.ReactNode,
    type: React.HTMLInputTypeAttribute = "text"
  ) => {
    const dialog = new PromptDialog(title, content, type);
    Dialog.useStore.getState().show(dialog);
    return dialog.wait;
  };
  // @ts-ignore
  window.confirm = (content: React.ReactNode) => {
    const dialog = new ConfirmDialog(content);
    Dialog.useStore.getState().show(dialog);
    return dialog.wait;
  };
  window.addEventListener("keydown", (e) => {
    Dialog.hideActive.call(e);
    Tooltip.useStore.getState().hide();
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
    if (this.state.error !== undefined) {
      if (this.props.mode === "production") {
        window.setTimeout(() => location.reload(), 3000);
        return (
          <article id="main" className="error-production">
            {L.render("error_production")}
          </article>
        );
      }
      return (
        <article id="main" className="error-development">
          {this.state.error.stack ? (
            <ul>
              {this.state.error.stack.split(" at ").map((trace, index) => (
                <li key={index}>
                  {index !== 0 ? "at " : null}
                  {trace}
                </li>
              ))}
            </ul>
          ) : (
            <p>{this.state.error.message}</p>
          )}
        </article>
      );
    }

    return (
      <>
        <img id="background" className="jt-image" />
        <div id="bayadere">
          <Dialog.Manager />
          <Notification.Manager />
          <Spinner.Manager />
          <Tooltip.Manager />
        </div>
        <Header profile={this.props.session.profile} />
        {this.props.children}
        <Footer />
      </>
    );
  }
}
