import React from "react";

import Bind from "front/ReactBootstrap";
import { Nest } from "common/Nest";
import { WebSocketMessage } from "../../common/WebSocket";
import L from "front/@global/Language";
import { CLIENT_SETTINGS } from "back/utils/Utility";
import { Database } from "../../common/Database";
import Audio from "front/Game/Audio";

import UserListBox from "front/Game/box/UserList";
import ProfileBox from "./box/Profile";
import ChatBox from "./box/Chat";
import RoomListBox from "./box/RoomList";
import { getRequiredScore } from "front/@global/Utility";

interface State {
  loading: boolean;

  me?: Database.DetailedUser;
  users: Table<Database.SummarizedUser>;
}

export default class Game extends React.PureComponent<
  Nest.Page.Props<"Game">,
  State
> {
  private server: number = parseInt(this.props.path.match(/\/game\/(.*)/)![1]);
  private socket!: WebSocket;
  private audioContext = new Audio();
  private $intro = React.createRef<HTMLDivElement>();
  public state: State = {
    loading: false,

    users: {},
  };
  public componentDidMount(): void {
    CLIENT_SETTINGS.expTable.push(getRequiredScore(1));
    for (let i = 2; i < CLIENT_SETTINGS.maxLevel; i++)
      CLIENT_SETTINGS.expTable.push(
        CLIENT_SETTINGS.expTable[i - 2] + getRequiredScore(i)
      );
    CLIENT_SETTINGS.expTable[CLIENT_SETTINGS.maxLevel - 1] = Infinity;
    CLIENT_SETTINGS.expTable.push(Infinity);

    this.socket = new WebSocket(this.props.data.wsUrl);
    this.socket.onopen = () => {};
    this.socket.onmessage = async (raw) => {
      const message: WebSocketMessage.Server[WebSocketMessage.Type] =
        JSON.parse(raw.data);
      console.log(message);

      switch (message.type) {
        case WebSocketMessage.Type.Initialize:
          const users: Table<Database.SummarizedUser> = {};
          for (const user of message.users) users[user.id] = user;
          for (const [id, src] of Object.entries(CLIENT_SETTINGS.sound))
            await this.audioContext.register(id, `/media/sound${src}`);
          this.audioContext.volume = message.me.settings.volume;
          this.audioContext.play(`lobby_${message.me.settings.lobbyMusic}`);
          this.setState({ me: message.me, users });
          const $intro = this.$intro.current!;
          $intro.style.opacity = "0";
          window.setTimeout(() => $intro.remove(), 2000);
          break;
        case WebSocketMessage.Type.Error:
          alert(L.get(`error_${message.errorType}`));
          break;
      }
    };
    this.socket.onclose = () => {};
  }
  public componentWillUnmount(): void {
    this.socket.close();
  }
  public render(): React.ReactNode {
    return (
      <article id="main">
        <div
          id="loading"
          style={{ display: this.state.loading ? "block" : "none" }}
        ></div>
        <div id="game">
          <section className="top-menu">menu</section>
          <div id="intro" ref={this.$intro}>
            <img className="image" src="/media/img/kkutu/intro.png" />
            <div className="version">{this.props.version}</div>
            <div className="text">{L.get("welcome")}</div>
          </div>
          <div id="box-grid" className="lobby">
            {this.state.me ? (
              <>
                <UserListBox
                  server={this.server}
                  me={this.state.me}
                  users={Object.values(this.state.users)}
                />
                <RoomListBox rooms={[]} />
                <ProfileBox {...this.state.me} />
                <ChatBox />
              </>
            ) : null}
          </div>
        </div>
      </article>
    );
  }
}
Bind(Game);
