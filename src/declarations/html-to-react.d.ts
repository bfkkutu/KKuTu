import "html-to-react";
import React from "react";

declare module "html-to-react" {
  declare function Parser(options?: any): {
    parse: (html: string) => React.ReactNode;
    parseWithInstructions: (
      html: string,
      isValidNode: boolean,
      processingInstructions: any,
      preprocessingInstructions?: any
    ) => React.ReactNode;
  };
}
