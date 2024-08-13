import React, { useEffect } from "react";
import { create } from "zustand";

import Icon from "front/@block/Icon";

export abstract class Notification {
  private static id = 0;
  /**
   * Notification은 생성 순서의 역순으로
   * 소멸한다는 보장이 없다.
   * 따라서 Notification마다 고유값을 부여한다.
   */
  public readonly id = Notification.id++;
  private _hide?: () => void;

  public readonly Component = React.memo(this.body.bind(this));

  protected abstract body(): React.ReactElement;

  protected hide() {
    this._hide?.();
  }

  public bind(hide: Notification.State["hide"]): void {
    this._hide = () => hide(this);
  }
  public unbind(): void {
    this._hide = undefined;
  }
}

export namespace Notification {
  export interface State {
    notifications: Notification[];
    show: (notification: Notification) => void;
    hide: (notification: Notification) => void;
  }

  export const useStore = create<State>((setState) => ({
    notifications: [],
    show: (notification) =>
      setState(({ notifications }) => ({
        notifications: [...notifications, notification],
      })),
    hide: (notification) =>
      setState(({ notifications }) => ({
        notifications: notifications.filter((v) => v !== notification),
      })),
  }));

  interface Props {
    instance: Notification;
  }
  function Component({ instance }: Props) {
    const hide = useStore((state) => state.hide);

    useEffect(() => {
      return () => {
        instance.unbind();
      };
    }, []);

    useEffect(() => {
      instance.bind(hide);
    }, [hide]);

    return (
      <div className="notification">
        <instance.Component />
        <div className="close" onClick={() => hide(instance)}>
          <Icon type={Icon.Type.NORMAL} name="xmark" />
        </div>
      </div>
    );
  }

  export function Manager() {
    const notifications = useStore((state) => state.notifications);

    return (
      <div id="notification">
        {notifications.map((notification) => (
          <Component key={notification.id} instance={notification} />
        ))}
      </div>
    );
  }
}

