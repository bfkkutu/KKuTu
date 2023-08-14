import React from "react";

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
        {...this.props}
      />
    );
  }
}
