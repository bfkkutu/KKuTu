import React from "react";

import { KKuTu } from "../../../../common/KKuTu";

import General from "front/KKuTu/box/Game/interfaces/General";

export namespace Game {
  export interface Props {
    mode: KKuTu.Game.Mode;
  }

  export const INTERFACES: Record<KKuTu.Game.Interface, React.FC<Props>> = {
    [KKuTu.Game.Interface.General]: General,
    [KKuTu.Game.Interface.TODO]: () => null,
  };
}

