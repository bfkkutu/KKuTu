import React from "react";

import { omit } from "../../common/Utility";

interface Props
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  level: number;
}

export default class LevelIcon extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <img
        src={`/media/img/kkutu/lv/lv${this.props.level
          .toString()
          .padStart(4, "0")}.png`}
        {...omit(this.props, "level")}
      />
    );
  }
}
