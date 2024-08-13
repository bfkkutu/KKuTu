import React from "react";
import { useLexicon } from "@daldalso/i18n";

import lCommon from "front/@global/languages/l.common";

interface Props {
  className?: string;
  max: number;
  value: number;
  width: number;
  height: number;
}

class TimeGauge extends React.Component<Props> {
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
          <TimeGauge.Text value={this.props.value} />
        </span>
      </div>
    );
  }
}

namespace TimeGauge {
  interface Props {
    value: number;
  }
  export function Text(props: Props) {
    const { l } = useLexicon(lCommon);

    return (
      <span className="gauge-text">
        {l("unitSecond", props.value / 1000, 1)}
      </span>
    );
  }
}

export default TimeGauge;

