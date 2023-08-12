import React from "react";

import Bind from "front/ReactBootstrap";
import { Nest } from "common/Nest";
import { WebSocketMessage } from "../../common/WebSocket";
import L from "front/@global/Language";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import { Database } from "../../common/Database";

interface State {
  socketStatus: string;
  socketResponse: string;

  users: Record<number, Database.User>;
}

export default class Game extends React.PureComponent<
  Nest.Page.Props<"Game">,
  State
> {
  private socket!: WebSocket;
  private audioContext = new AudioContext();
  private gainNode = this.audioContext.createGain();
  private audioSources: Table<AudioBufferSourceNode> = {};
  public state: State = {
    socketStatus: "closed",
    socketResponse: "",

    users: {},
  };
  public componentDidMount(): void {
    this.socket = new WebSocket(this.props.data.wsUrl);
    this.socket.onopen = () => {
      this.setState({ socketStatus: "opened" });
    };
    this.socket.onmessage = async (raw) => {
      const message: WebSocketMessage.Server[WebSocketMessage.Type] =
        JSON.parse(raw.data);
      this.setState({
        socketResponse: JSON.stringify(message),
      });

      switch (message.type) {
        case WebSocketMessage.Type.Initialize:
          for (const user of message.users) {
            const users: Record<number, Database.User> = {};
            users[user.id] = user;
            this.setState({ users });
          }
          for (const [id, src] of Object.entries(CLIENT_SETTINGS.sound)) {
            this.audioSources[id] = this.audioContext.createBufferSource();
            this.audioSources[id].buffer =
              await this.audioContext.decodeAudioData(
                await (await fetch(`/media/sound${src}`)).arrayBuffer()
              );
          }
          this.gainNode.gain.value =
            this.state.users[this.props.data.id].settings.volume;
          const lobbyMusic =
            this.audioSources[
              `lobby_${
                this.state.users[this.props.data.id].settings.lobbyMusic
              }`
            ];
          lobbyMusic.connect(this.audioContext.destination);
          lobbyMusic.start();
          break;
        case WebSocketMessage.Type.Error:
          alert(L.get(`error_${message.errorType}`));
          break;
      }
    };
    this.socket.onclose = () => {
      this.setState({
        socketStatus: "closed",
      });
    };
  }
  public componentWillUnmount(): void {
    this.socket.close();
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
