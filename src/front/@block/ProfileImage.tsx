import React from "react";

export default class ProfileImage extends React.PureComponent<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
> {
  public render(): React.ReactNode {
    return <img className="jt-image image" {...this.props} />;
  }
}
