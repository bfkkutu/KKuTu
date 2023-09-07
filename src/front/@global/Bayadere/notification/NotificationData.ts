type OnClick = () => void;

export default class NotificationData {
  public content: string;
  public onClick?: OnClick;

  constructor(content: string, onClick?: OnClick) {
    this.content = content;
    this.onClick = onClick;
  }
}
