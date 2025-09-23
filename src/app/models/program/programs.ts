export class ProgramQuery {
    title: string;
    index: number;
    pageSize: number;

    constructor(title: string, index: number, pageSize: number) {
        this.title = title;
        this.index = index;
        this.pageSize = pageSize;
    }
}
export interface ProgramCard {
    id: number;
    title: string;
    details: string;
    image?: string;
    price: number;
    duration: string;
    coachName: string;
    coachImage?: string;
}
export interface ProgramDetails {
    id: number;
    title: string;
    details: string;
    duration: number; // in days
    recordDate: string; // or Date, depending on how you handle it
    price: number;
    coachName: string;
    coachImage: string;
    coachTitle: string;
    cover: string;
    isUserRegistered: boolean;
    noParticipants: number;
    isRegistered: boolean;
    coachId: string;
}

export interface Base {
    id: number;
    name: string;
    index: number;
}
export interface ContentResponse {
    title: string;
    id: number;
}
export interface CourseStats {
    id: number;
    title: string;
    instructor: string;
    studentsCount: number;
    price: number;
    status: CoachingProgramStatus;

    createdAt: Date;
}

// Interface for platform statistics
export interface PlatformStats {
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    totalMentors: number;
}

export interface StudentNotificationResponse {
    userId: string;
    email: string;
    arName: string;
    contents: ContentResponse[];
}
export interface SectionContent extends Base {
    status?: ContentStatus;
    contentType: ContentType;
    minutes: number;
    passingRequirement: ContentPassingRequirement;
}

export enum ContentStatus {
    Progressing = 1,
    PoorProgressing = 2,
    GoodProgressing = 3,
    Finished = 4,
}
export interface Section extends Base {
    contents: SectionContent[];
     isExpanded?: boolean;

}

export enum ContentType {
    Vimeo = 0,
    YouTube = 1,
    File = 2,
    Website = 3,
    Loom = 4,
    Image = 5,
    Text = 6
}
export enum ContentPassingRequirement {
    None = 0,
    Exam = 1,
    Comment = 2,
    Manually = 3,
    AiExam = 4,
}
export interface ProgramDetailsForUpdate {
    programId: number;
    details: string;
    title: string;
    duration: number;
    coverUrl?: string;
    secretKey: string; // Guid is typically represented as a string in TypeScript
    status: CoachingProgramStatus;
    certificateTemplate?:string;
}
export enum CoachingProgramStatus {
    Active = 1,
    InActive = 2,
    Deleted = 3,
}
export interface ProgramCertificateDetails{
    templateUrl: string;
    programId: number;
    programName: string;
}