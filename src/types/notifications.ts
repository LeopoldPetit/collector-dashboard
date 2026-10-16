export interface INotification {
  id: number;
  text: string;
  time: string;
  severity: "ok" | "warning" | "critical" | "info";
}

export interface INotificationsResponse {
  notifications: INotification[];
  unreadCount: number;
}
