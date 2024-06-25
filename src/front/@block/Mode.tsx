import React from "react";

import { KKuTu } from "common/KKuTu";
import L from "front/@global/Language";

interface Props {
  room: KKuTu.Room;
}
export default function Mode({ room }: Props) {
  return (
    <>
      {[
        L.get(`game_mode_${room.mode}`),
        ...Object.entries(room.rules)
          .filter(([_, v]) => v)
          .map(([k]) => L.get(`game_rule_${k}`)),
      ].join(" / ")}
    </>
  );
}
