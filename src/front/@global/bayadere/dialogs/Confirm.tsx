import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lCommon from "front/@global/languages/l.common";

export default class ConfirmDialog extends Dialog.Asynchronous<boolean> {
  private content: React.ReactNode;

  constructor(content: React.ReactNode) {
    super();

    this.content = content;
  }

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lCommon);

    return <>{l("confirm")}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lCommon);

    return (
      <>
        <div className="body dialog-confirm">{this.content}</div>
        <div className="footer buttons">
          <button type="button" onClick={() => this.resolve(true)}>
            {l("yes")}
          </button>
          <button type="button" onClick={() => this.resolve(false)}>
            {l("no")}
          </button>
        </div>
      </>
    );
  }
}

