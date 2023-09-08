import React from "react";

declare module "react" {
  type ComponentOrNode = React.FC | typeof React.Component | React.ReactNode;
}
