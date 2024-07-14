import React from "react";

import { KKuTu } from "../../../../common/KKuTu";

import Relay from "front/KKuTu/box/Game/types/Relay";
import WordCompetition from "front/KKuTu/box/Game/types/WordCompetition";

export namespace Game {
  // TODO: remove any
  export const TYPES: Record<any, React.FC<{}>> = {
    [KKuTu.Game.Type.Relay]: Relay,
    [KKuTu.Game.Type.WordCompetition]: WordCompetition,
  };
}

