import React from "react";

import { Tooltip } from "front/@global/Bayadere/Tooltip";

interface Props {
  id: string;
  className?: string;
  tooltip?: Tooltip;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  children?: React.ReactNode;
}
export default function Checkbox(props: Props) {
  const propsForTooltip: React.DOMAttributes<HTMLLabelElement> = {};
  if (props.tooltip !== undefined) {
    const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
      (state) => [
        state.createOnMouseEnter,
        state.onMouseMove,
        state.onMouseLeave,
      ]
    );
    propsForTooltip["onMouseEnter"] = createOnMouseEnter(props.tooltip);
    propsForTooltip["onMouseMove"] = onMouseMove;
    propsForTooltip["onMouseLeave"] = onMouseLeave;
  }

  return (
    <label className={props.className} {...propsForTooltip}>
      <input
        type="checkbox"
        id={props.id}
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
      />
      <label htmlFor={props.id}>{props.children || null}</label>
    </label>
  );
}
