import React from "react";

import Bind from "front/ReactBootstrap";
import WebSocketClient from "front/@global/WebSocketClient";
import { Nest } from "common/Nest";
import { WebSocketMessage } from "../../common/WebSocket";
import L from "front/@global/Language";

interface State {
  socketStatus: string;
  socketResponse: string;
}

export default class Game extends React.PureComponent<
  Nest.Page.Props<"Game">,
  State
> {
  private socket!: WebSocketClient;
  public state: State = {
    socketStatus: "closed",
    socketResponse: "",
  };
  public componentDidMount(): void {
    this.socket = new WebSocketClient(this.props.data.wsUrl);
    this.socket.onopen = () => {
      this.setState({ socketStatus: "opened" });
    };
    this.socket.onmessage = (raw) => {
      const message: WebSocketMessage.Server[WebSocketMessage.Type] =
        JSON.parse(raw.data);
      this.setState({
        socketResponse: JSON.stringify(message),
      });

      switch (message.type) {
        case WebSocketMessage.Type.Error:
          alert(L.get(`error_${message.errorType}`));
      }
    };
    this.socket.onclose = () => {
      this.setState({
        socketStatus: "closed",
      });
    };
  }
  public render(): React.ReactNode {
    return (
      <div>
        {this.state.socketStatus}
        <br />
        {this.state.socketResponse}
      </div>
    );
  }
}
Bind(Game);
