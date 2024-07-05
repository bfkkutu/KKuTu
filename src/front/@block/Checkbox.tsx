import React from "react";

import { Tooltip } from "front/@global/Bayadere/Tooltip";

interface Props {
  id: string;
  className?: string;
  tooltip?: Tooltip;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
}
export default function Checkbox(props: Props) {
  if (props.tooltip === undefined) {
    return (
      <label className={props.className}>
        <input
          type="checkbox"
          id={props.id}
          checked={props.checked}
          onChange={props.onChange}
        />
        <label htmlFor={props.id}>{props.children || null}</label>
      </label>
    );
  }

  const [createOnMouseEnter, onMouseMove, onMouseLeave] = Tooltip.useStore(
    (state) => [state.createOnMouseEnter, state.onMouseMove, state.onMouseLeave]
  );

  return (
    <label
      className={props.className}
      onMouseEnter={createOnMouseEnter(props.tooltip)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <input
        type="checkbox"
        id={props.id}
        checked={props.checked}
        onChange={props.onChange}
      />
      <label htmlFor={props.id}>{props.children || null}</label>
    </label>
  );
}
