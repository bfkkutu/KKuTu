import React from "react";
import { useLexicon } from "@daldalso/i18n";

import { Notification } from "front/@global/bayadere/Notification";
import lKKuTu from "front/@global/languages/l.kkutu";
import { Whisper } from "front/KKuTu/dialogs/Whisper";
import type { Database } from "common/Database";

export default class WhisperNotification extends Notification {
  private length: number;
  public sender: Database.User.Summarized;

  constructor(sender: Database.User.Summarized, length: number) {
    super();

    this.sender = sender;
    this.length = length;
  }

  protected override body(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);

    return (
      <div
        className="body"
        onClick={() => {
          Whisper.show(this.sender);
          this.hide();
        }}
      >
        {l("notification_whisper", this.sender.nickname, this.length)}
      </div>
    );
  }
}

