import React from "react";
import { useLexicon } from "@daldalso/i18n";

import lKKuTu from "front/@global/languages/l.kkutu";
import { KKuTu } from "common/KKuTu";

interface Props {
  room: KKuTu.Room;
}
export default function Mode({ room }: Props) {
  const { l } = useLexicon(lKKuTu);

  return (
    <>
      {[
        l("game_mode", room.mode),
        ...Object.entries(room.rules)
          .filter(([_, v]) => v)
          .map(([k]) => l("game_rule", k as KKuTu.Game.Rule)),
      ].join(" / ")}
    </>
  );
}

