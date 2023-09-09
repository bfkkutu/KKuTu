import React from "react";

import { Game } from "../../../common/Game";
import L from "front/@global/Language";
import { useTooltipStore } from "front/@global/Bayadere/tooltip/Store";

interface Props {
  room: Game.RoomSettings;
  setter: (room: Game.RoomSettings) => void;
}
export default function RuleSelector({ room, setter }: Props) {
  const [createOnMouseEnter, onMouseMove, onMouseLeave] = useTooltipStore(
    (state) => [state.createOnMouseEnter, state.onMouseMove, state.onMouseLeave]
  );

  return (
    <div className="checkbox-wrapper">
      {Game.modes[room.mode].rules.map((rule) => (
        <label
          onMouseEnter={createOnMouseEnter(L.get(`game_rule_${rule}_desc`))}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
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
        </label>
      ))}
    </div>
  );
}
