import React from "react";

import { Game } from "../../../common/Game";
import L from "front/@global/Language";

interface Props {
  room: Game.RoomSettings;
  setter: (room: Game.RoomSettings) => void;
}
export default function RuleSelector({ room, setter }: Props) {
  return (
    <div className="checkbox-wrapper">
      {Game.modes[room.mode].rules.map((rule) => (
        <label className="tooltip-parent">
          <input
            type="checkbox"
            id={`createRoom-checkbox-${rule}`}
            checked={room.rules[rule]}
            onChange={(e) =>
              setter({
                ...room,
                rules: {
                  ...room.rules,
                  [rule]: e.currentTarget.checked,
                },
              })
            }
          />
          <label htmlFor={`createRoom-checkbox-${rule}`}>
            {L.get(`game_rule_${rule}`)}
          </label>
          <span className="tooltip">{L.get(`game_rule_${rule}_desc`)}</span>
        </label>
      ))}
    </div>
  );
}
