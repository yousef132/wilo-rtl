import { ContentPassingRequirement, ContentType, Status } from "../program/programs";

export interface CreateContent{
    sectionId: number;
    title: string;
    index:number;
    content: string;
    contentType: number;
}
export interface ContentDetails {
    id: number;
    title: string;
    contentUrl: string;
    recordDate: string;
    requiredEffort: string;
    minutes: number;
    contentType: ContentType;
    passMark?: number;
    contentPassingRequirement: ContentPassingRequirement;
    contentText?: string;
    userContentRegistrationId: number;
    status:Status;
    isOwner:boolean;
    isPassed:boolean;
    examTotal?:number;
    examResult?:number;
  }
export interface ContentData {
  id: number;
  title: string;
  contentType: ContentType;
  contentUrl?: string;
  requiredEffort: string;
  minutes: number;
  passMark?: number;
  index: number;
  contentText?: string;
  contentPassingRequirement: ContentPassingRequirement;
}

  export interface ContentToEdit{
    id: number;
    title: string;
    content: string;
    contentType: number;
    passMark: number;
    contentPassingRequirement: number;
    contentText: string;
  }

  export  interface Message {
    textMessage: string;
    userName: string;
    userId: string;
    messageDate: Date; // ISO 8601 string format, e.g., "2024-05-04T12:34:56Z"
  }
  
  export interface SendMessage {
    contentId: number;
    comment: string;
    registrationId:number;
  }
  
  export interface ContentSubscribers{
    userId: string;
    arName: string;
    registrationDate:Date;
  }

export interface CourseStructureResponse {
  title: string;
  sections: CourseSection[];
}

export interface CourseSection {
  id: number;
  title: string;
  lectures: CourseLecture[];
  isExpanded: boolean;
}

export interface CourseLecture {
  id: number;
  title: string;
  contentType: ContentType;
  minutes: number;
  isPassed: boolean;
  order: number;
}
export interface NextContentResponse{
    id:number;
    title:string;
    isOpened :boolean
}
