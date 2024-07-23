import React from "react";

type Format = React.FC<{ value: number; max: number }>;
interface Props {
  className?: string;
  max: number;
  value: number;
  width: number;
  height: number;
  format?: Format;
}
interface State {
  format: Format;
}
export default class Gauge extends React.PureComponent<Props, State> {
  private static readonly DEFAULT_FORMAT: Format = (props) => (
    <>
      {props.value.toLocaleString()} / {props.max.toLocaleString()}
    </>
  );
  public readonly state: State = {
    format:
      this.props.format === undefined
        ? Gauge.DEFAULT_FORMAT
        : this.props.format,
  };

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
        />
        <span className="gauge-text" style={{ width: `${this.props.width}px` }}>
          <this.state.format value={this.props.value} max={this.props.max} />
        </span>
      </div>
    );
  }
}

