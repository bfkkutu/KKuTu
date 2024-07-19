import React from "react";

const FA_REGULAR_TESTER = /^(.+)-o$/;
const FA_CYCLE_TYPES: Table<string> = {
  "!": "fa-pulse",
  "@": "fa-spin",
};

type Props = {
  className?: string;
  name: string;
  type?: Icon.Type;
};
function Icon({ className, name, type }: Props) {
  const classList: string[] = ["icon"];
  const style: React.CSSProperties = {};
  let chunk: RegExpMatchArray | null;

  if (className) classList.push(className);
  switch (type) {
    default:
    case Icon.Type.NORMAL: {
      const spinType = FA_CYCLE_TYPES[name[0]];

      classList.push("fa-fw");
      if (spinType) {
        classList.push(spinType);
        name = name.slice(1);
      }
      chunk = name.match(FA_REGULAR_TESTER);
      classList.push(
        ...(chunk ? ["far", `fa-${chunk[1]}`] : ["fas", `fa-${name}`])
      );
      return <i className={classList.join(" ")} style={style} />;
    }
    case Icon.Type.STACK:
      classList.push("fa-stack");
      return (
        <span className="ik fa-stack">
          {name.split(",").map((v, i) => (
            <Icon key={i} className="fa-stack-1x" name={v} />
          ))}
        </span>
      );
    case Icon.Type.PURE:
      classList.push("ip", `icon-${name}`);
      style.backgroundImage = `url("/media/images/icons/${name}.png")`;
      return <i className={classList.join(" ")} style={style} />;
  }
}
namespace Icon {
  export enum Type {
    NORMAL,
    STACK,
    PURE,
  }
}

export default Icon;

