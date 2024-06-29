import React from "react";

import L from "front/@global/Language";
import { Notification } from "front/@global/Bayadere/Notification";
import { Whisper } from "front/Game/dialogs/Whisper";
import { Database } from "common/Database";

export default class WhisperNotification extends Notification {
  private length: number;
  public sender: Database.User.Summarized;

  constructor(sender: Database.User.Summarized, length: number) {
    super();

    this.sender = sender;
    this.length = length;
  }

  protected override body(): React.ReactElement {
    return (
      <>{L.get("notification_whisper", this.sender.nickname, this.length)}</>
    );
  }

  public override onClick(): void {
    Whisper.show(this.sender);
  }
}
