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
    const hide = Dialog.useStore((state) => state.hide);

    return (
      <>
        <div className="body dialog-confirm">{this.content}</div>
        <div className="footer">
          <button
            type="button"
            onClick={() => {
              hide(this);
              this.resolve(true);
            }}
          >
            {L.get("yes")}
          </button>
          <button
            type="button"
            onClick={() => {
              hide(this);
              this.resolve(false);
            }}
          >
            {L.get("no")}
          </button>
        </div>
      </>
    );
  }
}
