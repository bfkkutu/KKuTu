import React from "react";

import { Schema } from "common/Schema";

export default class GoogleAdvertisement extends React.PureComponent<Schema.GoogleAdvertisement> {
  public render(): React.ReactNode {
    return (
      <ins
        className="adsbygoogle"
        data-ad-client={this.props.client}
        data-ad-slot={this.props.slot}
      />
    );
  }
}
