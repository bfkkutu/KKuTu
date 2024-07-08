import React from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";

export default class ConfirmDialog extends Dialog.Asynchronous<boolean> {
  private content: React.ReactNode;

  constructor(content: React.ReactNode) {
    super();

    this.content = content;
  }

  protected override head(): React.ReactElement {
    return <>{L.get("confirm")}</>;
  }
  protected override body(): React.ReactElement {
    return (
      <>
        <div className="body dialog-confirm">{this.content}</div>
        <div className="footer buttons">
          <button type="button" onClick={() => this.resolve(true)}>
            {L.get("yes")}
          </button>
          <button type="button" onClick={() => this.resolve(false)}>
            {L.get("no")}
          </button>
        </div>
      </>
    );
  }
}

