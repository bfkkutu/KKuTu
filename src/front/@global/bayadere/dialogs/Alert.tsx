import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";

export default class AlertDialog extends Dialog.Asynchronous<void> {
  private content: React.ReactNode;

  constructor(content: React.ReactNode) {
    super();

    this.content = content;
  }

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lCommon);

    return <>{l("alert")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon);

    return (
      <>
        <div className="body dialog-alert">{this.content}</div>
        <div className="footer buttons">
          <button type="button" onClick={() => this.resolve()}>
            {l("ok")}
          </button>
        </div>
      </>
    );
  }
}

