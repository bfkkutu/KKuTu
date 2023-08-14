import React from "react";

import { Database } from "common/Database";
import { CLIENT_SETTINGS } from "back/utils/Utility";

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  equipment: Database.JSON.Types.User.equipment;
}

export default class Moremi extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <div {...this.props}>
        {CLIENT_SETTINGS.moremiPart.map((part) => (
          <img
            className={`moremi-${part}`}
            src={`/media/img/kkutu/moremi/${
              part.includes("hand") ? "hand" : part
            }/${this.props.equipment[part] || "def"}.png`}
          />
        ))}
      </div>
    );
  }
}
