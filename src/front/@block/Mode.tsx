import React from "react";

import { KKuTu } from "common/KKuTu";
import L from "front/@global/Language";

export default function Mode(room: KKuTu.Room) {
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
