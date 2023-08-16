import DialogTuple from "front/@global/Bayadere/dialog/DialogTuple";
import { MenuType } from "front/@global/Types";

import Settings from "front/@global/Bayadere/dialog/templates/Settings";

export const Dialogs: Table<DialogTuple> = {
  [MenuType.Settings]: Settings,
};
