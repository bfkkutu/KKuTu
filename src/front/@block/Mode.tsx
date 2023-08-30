import React from "react";

import { Game } from "common/Game";
import L from "front/@global/Language";

export default function Mode(room: Game.BaseRoom) {
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
