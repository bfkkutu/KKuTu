import React from "react";

interface Props {
  className?: string;
  max: number;
  value: number;
  width: number;
  height: number;
}

export default class Gauge extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <div
        className={this.props.className}
        style={{
          width: `${this.props.width}px`,
          height: `${this.props.height}px`,
        }}
      >
        <div
          className="bar"
          style={{
            width: `${(this.props.value / this.props.max) * 100}%`,
          }}
        />
        <label className="text" style={{ width: `${this.props.width}px` }}>
          {this.props.value.toLocaleString()} /{" "}
          {this.props.max.toLocaleString()}
        </label>
      </div>
    );
  }
}
