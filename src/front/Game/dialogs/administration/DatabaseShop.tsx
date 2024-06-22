import React from "react";

import L from "front/@global/Language";
import AdministrationDialog from "front/Game/dialogs/administration/AdministrationDialog";

export default class DatabaseShopDialog extends AdministrationDialog {
  public static instance?: DatabaseShopDialog;

  public override body(): React.ReactElement {
    super.body();

    return <p>CONNECTED</p>;
  }
}
