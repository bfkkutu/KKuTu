import React from "react";

import { Dialog } from "front/@global/Bayadere/Dialog";
import L from "front/@global/Language";

export default class AlertDialog extends Dialog.Asynchronous<void> {
  private content: React.ReactNode;

  constructor(content: React.ReactNode) {
    super();

    this.content = content;
  }

  protected override head(): React.ReactElement {
    return <>{L.get("alert")}</>;
  }
  protected override body(): React.ReactElement {
    const hide = Dialog.useStore((state) => state.hide);

    return (
      <>
        <div className="body dialog-alert">{this.content}</div>
        <div className="footer">
          <button
            type="button"
            onClick={() => {
              hide(this);
              this.resolve();
            }}
          >
            {L.get("ok")}
          </button>
        </div>
      </>
    );
  }
}
