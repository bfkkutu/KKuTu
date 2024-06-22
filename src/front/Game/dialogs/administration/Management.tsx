import React from "react";

import L from "front/@global/Language";
import AdministrationDialog from "front/Game/dialogs/administration/AdministrationDialog";

export default class ManagementDialog extends AdministrationDialog {
  public static instance?: ManagementDialog;

  public override body(): React.ReactElement {
    super.body();

    return <p>CONNECTED</p>;
  }
}
