export interface Notification {
  id: string;
  content: string;
  url: string;
  type: NotificationType;
  creationDate: Date;
  isRead:boolean;
}
export enum NotificationType {
  PassedContentByCoach = 0,
  Chat = 1,
  RegisterInProgram = 2,
  CompletedTheProgram = 3
}
