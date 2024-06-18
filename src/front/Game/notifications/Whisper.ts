import L from "front/@global/Language";
import { Notification } from "front/@global/Bayadere/Notification";
import { WhisperDialog } from "front/Game/dialogs/Whisper";
import { Database } from "common/Database";

export const createWhisperNotification = (
  user: Database.User.Summarized,
  length: number
) =>
  new Notification(L.get("notification_whisper", user.nickname, length), () =>
    WhisperDialog.toggle(user)
  );
