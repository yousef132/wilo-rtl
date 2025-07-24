export interface Notification {
  id: string;
  content: string;
  url: string;
  type: NotificationType;
  creationDate: Date;
  isRead:boolean;
}
export enum NotificationType {
  PassedContentByCoach = "PassedContentByCoach",
  Chat = "Chat",
  RegisterInProgram = "RegisterInProgram",
  CompletedTheProgram = "CompletedTheProgram"
}
