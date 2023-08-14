import React from "react";

import L from "front/@global/Language";

interface State {
  chat: string;
}

export default class ChatBox extends React.PureComponent<{}, State> {
  public state: State = {
    chat: "",
  };
  public render(): React.ReactNode {
    return (
      <section id="box-chat" className="product">
        <h5 className="title">{L.render("chatBox_title")}</h5>
        <div className="body">
          <div className="list">{}</div>
          <input
            className="input-chat"
            maxLength={200}
            value={this.state.chat}
            onChange={(e) => this.setState({ chat: e.currentTarget.value })}
          />
          <button type="button" className="button-send">
            {L.get("send")}
          </button>
        </div>
      </section>
    );
  }
}
