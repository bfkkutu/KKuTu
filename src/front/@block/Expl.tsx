import React from "react";

interface Props {
  width?: number;
  text: string | React.ReactNode;
}

export default function Expl({ width, text }: Props) {
  return (
    <div className="expl" style={{ width: width ? width + "px" : "initial" }}>
      <h5>{text}</h5>
    </div>
  );
}
