import React from "react";
import ReactDOM from "react-dom/client";

import { PROPS } from "front/@global/Utility";
import { Nest } from "common/Nest";
import { WebSocketMessage } from "common/WebSocket";

import Footer from "front/@global/Footer";
import Header from "front/@global/Header";
import L from "front/@global/Language";

declare global {
  interface Window {
    adsbygoogle: any;
  }
  interface WebSocket {
    _send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    send<T extends WebSocketMessage.Type>(
      type: T,
      content: WebSocketMessage.Content.Client[T]
    ): void;
  }
}

if (typeof window !== "undefined") {
  window.WebSocket.prototype._send = window.WebSocket.prototype.send;
  window.WebSocket.prototype.send = function <T extends WebSocketMessage.Type>(
    type: T,
    content?: WebSocketMessage.Content.Client[T]
  ): void {
    this._send(
      JSON.stringify({
        type,
        ...content,
      } as WebSocketMessage.Client[T])
    );
  };
}

interface State {
  error?: Error;
}

export default function Bind(TargetClass: any) {
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
        <Header profile={this.props.session.profile} />
        {this.props.children}
        <Footer />
      </>
    );
  }
}
