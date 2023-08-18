import React from "react";

interface Props {
  max: number;
  value: number;
  width?: number;
  height?: number;
}

export default class Gauge extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <div
        className="graph gauge"
        style={{
          width: `${this.props.width || 190}px`,
          height: `${this.props.height || 30}px`,
        }}
      >
        <label
          className="graph-bar"
          style={{
            width: `${(this.props.value / this.props.max) * 100}%`,
          }}
        />
        <div
          className="bar-text gauge-text"
          style={{ width: `${this.props.width || 190}px` }}
        >
          {this.props.value.toLocaleString()} /{" "}
          {this.props.max.toLocaleString()}
        </div>
      </div>
    );
  }
}
