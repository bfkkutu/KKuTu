import React from "react";

import { useNotificationStore } from "front/@global/Bayadere/notification/Store";
import NotificationData from "front/@global/Bayadere/notification/NotificationData";
import { Icon, IconType } from "front/@block/Icon";

interface Props {
  instance: NotificationData;
}
function Notification({ instance }: Props) {
  const hide = useNotificationStore((state) => state.hide);

  return (
    <div className="notification">
      <div
        className="body"
        onClick={() => {
          instance.onClick?.();
          hide(instance);
        }}
      >
        {instance.content}
      </div>
      <div className="close" onClick={() => hide(instance)}>
        <Icon type={IconType.NORMAL} name="xmark" />
      </div>
    </div>
  );
}

export default function NotificationManager() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div id="notification">
      {notifications.map((notification) => (
        <Notification instance={notification} />
      ))}
    </div>
  );
}
