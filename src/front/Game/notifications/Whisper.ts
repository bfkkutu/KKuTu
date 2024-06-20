import L from "front/@global/Language";
import { Notification } from "front/@global/Bayadere/Notification";
import { WhisperDialog } from "front/Game/dialogs/Whisper";
import { Database } from "common/Database";

export class WhisperNotification extends Notification {
  public sender: string;

  constructor(user: Database.User.Summarized, length: number) {
    super(L.get("notification_whisper", user.nickname, length), () =>
      WhisperDialog.show(user)
    );

    this.sender = user.id;
  }
}
