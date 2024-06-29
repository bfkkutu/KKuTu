import React, { useState } from "react";

import { Database } from "common/Database";
import { WebSocketMessage } from "../../../common/WebSocket";
import L from "front/@global/Language";
import { Dialog } from "front/@global/Bayadere/Dialog";
import { useStore } from "front/Game/Store";

export default class ReportDialog extends Dialog {
  private target: Database.User.Summarized;

  constructor(target: Database.User.Summarized) {
    super();

    this.target = target;
  }

  protected override head(): React.ReactElement {
    return <>{L.render("report_title", this.target.nickname)}</>;
  }
  protected override body(): React.ReactElement {
    const socket = useStore((state) => state.socket);
    const hide = Dialog.useStore((state) => state.hide);
    const [reason, setReason] = useState(0);
    const [comment, setComment] = useState("");

    return (
      <div className="dialog-report">
        <form className="body">
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="report-label-target">
              {L.get("report_target")}
            </label>
            <label id="report-label-target">{this.target.nickname}</label>
          </label>
          <label className="item-wrapper">
            <label className="dialog-desc" htmlFor="report-select-reason">
              {L.get("report_reason")}
            </label>
            <select
              id="report-select-reason"
              value={reason}
              onChange={(e) => setReason(parseInt(e.currentTarget.value))}
            >
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <option key={index} value={index}>
                    {L.get(`report_reason_${index}`)}
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
        <div className="footer">
          <button
            onClick={async () => {
              socket.send(WebSocketMessage.Type.Report, {
                target: this.target.id,
                reason,
                comment,
              });
              await socket.messageReceiver.wait(WebSocketMessage.Type.Report);
              window.alert(L.get("alert_reportSubmitted"));
              hide(this);
            }}
          >
            {L.get("submit")}
          </button>
        </div>
      </div>
    );
  }
}
