import React from "react";

interface Props {
  key?: number;
  name: string;
  className: string;
}

export default function Icon({ name, className }: Props) {
  return <i className={`fa fa-${name} ${className}`} />;
}
