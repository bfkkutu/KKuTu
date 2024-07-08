import React from "react";

import { KKuTu } from "../../../../common/KKuTu";

import Relay from "front/KKuTu/box/Game/types/Relay";

export namespace Game {
  // TODO: remove any
  export const TYPES: Record<any, React.FC<{}>> = {
    [KKuTu.Game.Type.Relay]: Relay,
  };
}

