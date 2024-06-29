import React, { useState } from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";

export default class PromptDialog extends Dialog.Asynchronous<string | null> {
  private title: string;
  private content: React.ReactNode;
  private type: React.HTMLInputTypeAttribute;

  constructor(
    title: string,
    content: React.ReactNode,
    type: React.HTMLInputTypeAttribute = "text"
  ) {
    super();

    this.title = title;
    this.content = content;
    this.type = type;
  }

  protected override head(): React.ReactElement {
    return <>{this.title}</>;
  }
  protected override body(): React.ReactElement {
    const hide = Dialog.useStore((state) => state.hide);
    const [input, setInput] = useState("");

    return (
      <>
        <div className="body dialog-prompt">
          {this.content}
          <input
            type={this.type}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </div>
        <div className="footer">
          <button
            type="button"
            onClick={() => {
              hide(this);
              this.resolve(input);
            }}
          >
            {L.get("ok")}
          </button>
          <button
            type="button"
            onClick={() => {
              hide(this);
              this.resolve(null);
            }}
          >
            {L.get("cancel")}
          </button>
        </div>
      </>
    );
  }
}
