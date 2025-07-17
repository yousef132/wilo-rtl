import { HttpStatusCode } from "@angular/common/http";

export const API_CONSTANTS = {
    AUTH: {
        LOGIN: 'User/login',
        REGISTER: 'User/signup',
        REFRESH_TOKEN: 'User/confirm-email',
        GET_USERS: 'User/users',
        CREATE_COACH: 'User/coach',
    },
    USER: {
        GET_ALL_USER: '/User/get-all-user',
        GET_USER_BY_ID: '/user/get-user-by-id',
        CREATE_USER: '/user/create-user',
        UPDATE_USER: '/user/update-user',
        DELETE_USER: '/user/delete-user',
    },
    SECTION:{
        CREATE_SECTION:'ProgramSection',
        UPDATE_SECTION:'ProgramSection',
        UPDATE_SECTION_INDEX:'ProgramSection/index',
    },
    CONTENT:{
        CREATE_CONTENT:'Content',
        GET_CONTENT_BY_ID:'Content',
        GET_CONTENT_CHAT:'Content/chat',
        SEND_MESSAGE:'Content/chat',
        GET_SUBSCRIBERS:'Content/subscribers/',
        PASS_STUDENT: 'Content/pass',
        GET_CONTENT_FOR_UPDATE: 'Content/edit/',
        GET_NEXT_PREV: 'Content/prev-next',
        UPDATE_CONTENT: 'Content/edit',
    },
    QUESTION:{
        CREATE_QUESTION:'Exam',
        GET_CONTENT_QUESTIONS:'Exam/questions/',
        SUBMIT_QUESTIONS:'Exam/solve',
    },
    PROGRAM: {
        GET_ALL_PROGRAMS: 'CoachingProgram',
        ADMIN_PROGRAMS: 'CoachingProgram/coach',
        GET_PROGRAM_BY_ID: 'CoachingProgram',
        REGISTER_IN_PROGRAM : 'CoachingProgram/',
        GET_PROGRAM_DETAILS: 'CoachingProgram/',
        CREATE_PROGRAM: 'CoachingProgram',
        GET_STUDENT_PROGRAMS: 'CoachingProgram/member',
        GET_SECTIONS_WITH_PROGRAMS: 'CoachingProgram/sections/',
        GET_PROGRAM_DETAILS_FOR_DASHBOARD: 'CoachingProgram/update-details/',
        GET_SECTIONS_FOR_DASHBOARD: 'CoachingProgram/dashboard-sections/',
        UPDATE_PROGRAM_DETAILS: 'CoachingProgram',
        UPDATE_PROGRAM_STUDENTS: 'CoachingProgram/program-subscribers/',
        GET_PROGRAM_MENTORS: 'CoachingProgram/mentors/',
        ADD_PROGRAM_MENTOR: 'CoachingProgram/mentors',
        GET_PROGRAM_STUDENTS_CHAT_NOTIFICATIONS: 'CoachingProgram/students/chats/',
        GET_PROGRESS: 'progress',
        IMPORT_PROGRAM: 'CoachingProgram/import',
    },
    NOTIFICATION:{
        GET_NOTIFICATIONS: 'Notification',
        GET_NOTIFICATION_COUNT: 'Notification/count',
        MARK_NOTIFICATION_AS_READ: 'Notification',
    }
};

export const FILES = 'https://ariduniversity.com/Files/';
export const FILE_URL = 'https://ariduniversity.com/Files/';


export interface currentUser {
    email: string;
    userName: string;
    tokenExpired: boolean;
    roles: string[];
    id:string;
}


export class Result<T>{
    isSuccess!:boolean;
    statusCode!:HttpStatusCode;
    message?:string;
    data?:T;
  }

