import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import { PROPS } from "front/@global/Utility";
import Footer from "front/@global/Footer";
import Header from "front/@global/Header";
import { Dialog } from "front/@global/bayadere/Dialog";
import { Notification } from "front/@global/bayadere/Notification";
import { Spinner } from "front/@global/bayadere/Spinner";
import { Tooltip } from "front/@global/bayadere/Tooltip";
import LanguageLoader from "front/LanguageLoader";
import { Nest } from "common/Nest";

import AlertDialog from "front/@global/bayadere/dialogs/Alert";
import PromptDialog from "front/@global/bayadere/dialogs/Prompt";
import ConfirmDialog from "front/@global/bayadere/dialogs/Confirm";
import { useLexicon } from "@daldalso/i18n";
import lCommon from "./@global/languages/l.common";

if (typeof window !== "undefined") {
  window.alert = (content: React.ReactNode) => {
    const dialog = new AlertDialog(content);
    Dialog.useStore.getState().show(dialog);
    return dialog.wait;
  };
  // @ts-expect-error
  window.prompt = (
    title: string,
    content: React.ReactNode,
    type: React.HTMLInputTypeAttribute = "text"
  ) => {
    const dialog = new PromptDialog(title, content, type);
    Dialog.useStore.getState().show(dialog);
    return dialog.wait;
  };
  // @ts-expect-error
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

export default function Bind(
  TargetClass: React.FC<any> | typeof React.PureComponent
) {
  const $root = document.getElementById("stage") as HTMLTableSectionElement;

  ReactDOM.createRoot($root).render(
    React.createElement(Root, PROPS, React.createElement(TargetClass, PROPS))
  );
}

interface State {
  error?: Error;
}
export class Root extends React.PureComponent<Nest.Page.Props<any>, State> {
  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }
  public readonly state: State = {};
  public render() {
    if (this.state.error !== undefined) {
      return (
        <LanguageLoader locale={this.props.locale}>
          {this.props.mode === "production" ? (
            <Error.Production />
          ) : (
            <Error.Development error={this.state.error} />
          )}
        </LanguageLoader>
      );
    }

    return (
      <LanguageLoader locale={this.props.locale}>
        <img id="background" />
        <div id="bayadere">
          <Dialog.Manager />
          <Notification.Manager />
          <Spinner.Manager />
          <Tooltip.Manager />
        </div>
        <Header profile={this.props.session.profile} />
        {this.props.children}
        <Footer />
      </LanguageLoader>
    );
  }
}

namespace Error {
  export function Production() {
    const { l } = useLexicon(lCommon);

    useEffect(() => {
      window.setTimeout(() => location.reload(), 3000);
    }, []);

    return (
      <article id="main" className="error-production">
        {l("render_failed")}
      </article>
    );
  }

  interface Props {
    error: Error;
  }
  export function Development(props: Props) {
    return (
      <article id="main" className="error-development">
        {props.error.stack ? (
          <ul>
            {props.error.stack.split(" at ").map((trace, index) => (
              <li key={index}>
                {index !== 0 ? "at " : null}
                {trace}
              </li>
            ))}
          </ul>
        ) : (
          <p>{props.error.message}</p>
        )}
      </article>
    );
  }
}

