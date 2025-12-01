import {
    CoachingProgramStatus,
    ContentPassingRequirement,
    ContentType,
    ContentStatus,
} from '../program/programs';

export interface CreateContent {
    sectionId: number;
    title: string;
    index: number;
    content: string;
    contentType: number;
}
// export interface ContentAIChatMessage {
//     messageText: string;
//     role: AIChatRole;
//     sentAt: Date;
// }
export interface ContentAIChatMessage {
    messageText: string;
    role: AIChatRole;
    sentAt: Date;
    videoTaskId?: string;
    videoUrl?: string;
    videoStatus?: 'processing' | 'completed' | 'failed';
}
// New response interface for AI Chat with video
export interface AiChatResponse {
    reply: string;
    videoTaskId?: string;
}

// New interface for video status checking
export interface VideoStatusDto {
    status: string;
    videoUrl?: string;
    videoTaskId: string;
}
export interface LoadingState {
    content: boolean;
    chat: boolean;
    aiChat: boolean;
    sendingMessage: boolean;
    sendingAiMessage: boolean;
    passingStudent: boolean;
    courseStructure: boolean;
    navigation: boolean;
}
export enum AIChatRole {
    System = 0,
    User = 1,
    Assistant = 2,
}

export interface SendAIMessage {
    contentId: number;
    question: string;
}

// Add loading state interface
// interface LoadingState {
//     content: boolean;
//     chat: boolean;
//     aiChat: boolean;
//     navigation: boolean;
//     sendingMessage: boolean;
//     sendingAiMessage: boolean;
// }
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
    contentText: string;
    userContentRegistrationId: number;
    status: ContentStatus;
    isOwner: boolean;
    isPassed: boolean;
    examTotal?: number;
    examResult?: number;
    userName: string;
    isAiChatEnabled:boolean;
    isInstructorChatEnabled:boolean;
    
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
    status: CoachingProgramStatus;
    isInstructorChatEnabled: boolean;
    isAiChatEnabled: boolean;
}

export interface ContentToEdit {
    id: number;
    title: string;
    content: string;
    contentType: number;
    passMark: number;
    contentPassingRequirement: number;
    contentText: string;
}

export interface Message {
    textMessage: string;
    userName: string;
    userId: string;
    messageDate: Date; // ISO 8601 string format, e.g., "2024-05-04T12:34:56Z"
}

export interface SendMessage {
    contentId: number;
    comment: string;
    registrationId: number;
}

export interface PassResponse {
    nextContentId?: number;
    programId?: number;
    programName?: string;
    templateUrl?: string;
}

export interface ContentSubscribers {
    userId: string;
    arName: string;
    registrationDate: Date;
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
    status: ContentStatus;
    order: number;
    isPassed: boolean;
}
export interface NextContentResponse {
    id: number;
    title: string;
    isOpened: boolean;
}
export interface GetStudentsWithLevelResponse {
    userId: string;
    arName: string;
    email: string;
    lastContent: LastContent;
    progressPercentage: number;
}

export interface LastContent {
    id: number;
    title: string;
    passingRequirements: ContentPassingRequirement;
    isPassed: boolean;
    isLastContent: boolean;
}
// export enum ContentStatus {
//     IsLocked,
//     IsFinished,
//     IsProccessing,
// }

export interface ChatMessage {
    senderId: string;
    message: string;
    sentAt: Date;
    arName: string;
    nextContentId: number;
}

// SenderId = senderId,
// Message = message,
// SentAt = chatMessage.RecordDate,
// MessageId = chatMessage.Id,
// ArName = arName,
// NextContentId = nextContentId,
