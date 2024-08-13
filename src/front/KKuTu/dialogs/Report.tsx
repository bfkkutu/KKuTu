import React, { useState } from "react";
import { useLexicon } from "@daldalso/i18n";

import { Dialog } from "front/@global/bayadere/Dialog";
import lKKuTu from "front/@global/languages/l.kkutu";
import { useSocket } from "front/KKuTu/Store";
import { Database } from "common/Database";
import { Iterator } from "../../../common/Utility";
import { WebSocketMessage } from "../../../common/WebSocket";

export default class ReportDialog extends Dialog {
  private target: Database.User.Summarized;

  constructor(target: Database.User.Summarized) {
    super();

    this.target = target;
  }

  protected override head(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);

    return <>{l("report_title", this.target.nickname)}</>;
  }
  protected override body(): React.ReactElement {
    const { l } = useLexicon(lKKuTu);
    const socket = useSocket((state) => state.socket);
    const [reason, setReason] = useState(0);
    const [comment, setComment] = useState("");

    return (
      <div className="dialog-report">
        <form className="body">
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="report-label-target">
              {l("report_target")}
            </label>
            <label id="report-label-target">{this.target.nickname}</label>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="report-select-reason">
              {l("report_reason")}
            </label>
            <select
              id="report-select-reason"
              value={reason}
              onChange={(e) => setReason(parseInt(e.currentTarget.value))}
            >
              {Iterator(4).map((_, index) => (
                <option key={index} value={index}>
                  {l("report_reason", index)}
                </option>
              ))}
            </select>
          </label>
          <label className="item-wrapper-center">
            <textarea
              value={comment}
              rows={7}
              onChange={(e) => setComment(e.currentTarget.value)}
            />
          </label>
        </form>
        <div className="footer buttons">
          <button
            onClick={async () => {
              socket.send(WebSocketMessage.Type.Report, {
                target: this.target.id,
                reason,
                comment,
              });
              await socket.messageReceiver.wait(WebSocketMessage.Type.Report);
              window.alert(l("alert_reportSubmitted"));
              this.hide();
            }}
          >
            {l("submit")}
          </button>
        </div>
      </div>
    );
  }
}

