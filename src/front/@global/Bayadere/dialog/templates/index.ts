import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";

import { MenuType } from "front/@global/enums/MenuType";

import { SettingsDialog } from "front/@global/Bayadere/dialog/templates/Settings";

export const Dialogs: Table<DialogTuple> = {
  [MenuType.Settings]: SettingsDialog,
};
