import React from "react";

import L from "front/@global/Language";

interface Props {
  className?: string;
  max: number;
  value: number;
  width: number;
  height: number;
}

export default class TimeGauge extends React.Component<Props> {
  public shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    if (nextProps.value < 0) {
      return false;
    }
    return true;
  }
  public render(): React.ReactNode {
    return (
      <div
        className={this.props.className}
        style={{
          width: `${this.props.width}px`,
          height: `${this.props.height}px`,
        }}
      >
        <span
          className="gauge-bar"
          style={{
            width: `${(this.props.value / this.props.max) * 100}%`,
          }}
        >
          <span className="gauge-text">
            {L.get("unitSecond", (this.props.value / 1000).toFixed(1))}
          </span>
        </span>
      </div>
    );
  }
}

