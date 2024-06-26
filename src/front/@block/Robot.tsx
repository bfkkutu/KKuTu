import React from "react";

import { CLIENT_SETTINGS } from "back/utils/Utility";

export default class Robot extends React.PureComponent<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> {
  public render(): React.ReactNode {
    return (
      <div className="moremi" {...this.props}>
        {CLIENT_SETTINGS.moremiPart.map((part, index) => (
          <img
            className={`moremi-${part}`}
            key={index}
            src={`/media/image/kkutu/moremi/${
              part.includes("hand") ? "hand" : part
            }/${part === "body" ? "robot" : "def"}.png`}
          />
        ))}
      </div>
    );
  }
}
