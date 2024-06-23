import React from "react";

import { Schema } from "common/Schema";

export default class KakaoAdvertisement extends React.PureComponent<Schema.KakaoAdvertisement> {
  public render(): React.ReactNode {
    return (
      <div>
        <ins
          className="kakao_ad_area"
          data-ad-unit={this.props.unit}
          data-ad-width={728}
          data-ad-height={90}
        />
        <script
          type="text/javascript"
          src="//t1.daumcdn.net/kas/static/ba.min.js"
          async
        />
      </div>
    );
  }
}
