import { Database } from "common/Database";
import NotificationData from "front/@global/Bayadere/notification/NotificationData";
import L from "front/@global/Language";
import { toggleWhisperDialog } from "front/Game/dialogs/Whisper";

export const createWhisperNotification = (
  user: Database.SummarizedUser,
  length: number
) =>
  new NotificationData(
    L.get("notification_whisper", user.nickname, length),
    () => toggleWhisperDialog(user)
  );
