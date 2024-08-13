import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";

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
    const { l } = useLexicon(lCommon);
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
        <div className="footer buttons">
          <button type="button" onClick={() => this.resolve(input)}>
            {l("ok")}
          </button>
          <button type="button" onClick={() => this.resolve(null)}>
            {l("cancel")}
          </button>
        </div>
      </>
    );
  }
}

