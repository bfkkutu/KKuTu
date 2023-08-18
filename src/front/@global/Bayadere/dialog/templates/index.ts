import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

import { MenuType } from "front/@global/enums/MenuType";

import { SettingsDialog } from "front/@global/Bayadere/dialog/templates/Settings";
import { CommunityDialog } from "front/@global/Bayadere/dialog/templates/Community";

export const Dialogs: Table<DialogTuple> = {
  [MenuType.Settings]: SettingsDialog,
  [MenuType.Community]: CommunityDialog,
};
