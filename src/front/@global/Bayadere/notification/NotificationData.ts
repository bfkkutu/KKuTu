import React from "react";

type OnClick = () => void;

export default class NotificationData {
  public content: React.ComponentOrNode;
  public onClick?: OnClick;

  constructor(content: React.ComponentOrNode, onClick?: OnClick) {
    this.content = content;
    this.onClick = onClick;
  }
}
