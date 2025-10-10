import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONSTANTS, Result } from '../constants/apiConstants';
import { map, Observable } from 'rxjs';
import {
    ContentAIChatMessage,
    ContentData,
    ContentDetails,
    CourseStructureResponse,
    Message,
    NextContentResponse,
    PassResponse,
    SendMessage,
} from '../models/content/content';

import { SendAIMessage } from '../models/content/content';
@Injectable({
    providedIn: 'root',
})
export class ContentService {
    baseUrl = environment.API_URL;
    constructor(private http: HttpClient) {}

    createContent(content: FormData) {
        return this.http
            .post<Result<any>>(
                this.baseUrl + API_CONSTANTS.CONTENT.CREATE_CONTENT,
                content
            )
            .pipe(map((response) => response.data));
    }
    getContent(contentId: number, userId: string) {
        const params = new HttpParams()
            .set('contentId', contentId.toString())
            .set('userId', userId);

        return this.http
            .get<Result<ContentDetails>>(
                this.baseUrl + API_CONSTANTS.CONTENT.GET_CONTENT_BY_ID,
                { params }
            )
            .pipe(map((response) => response.data));
    }

    getFirstContent(programId: number) {
        return this.http
            .get<Result<ContentDetails>>(
                this.baseUrl +
                    API_CONSTANTS.CONTENT.GET_FIRST_CONTENT +
                    programId
            )
            .pipe(map((response) => response.data));
    }

    getCurrentContent(contentId: number) {
        return this.http
            .get<Result<ContentDetails>>(
                this.baseUrl +
                    API_CONSTANTS.CONTENT.GET_CURRENT_CONTENT +
                    contentId
            )
            .pipe(map((response) => response.data));
    }

    getContentChat(contentId: number, userId: string, programId: number) {
        return this.http
            .get<Result<Message[]>>(
                this.baseUrl +
                    API_CONSTANTS.CONTENT.GET_CONTENT_CHAT +
                    `?contentId=${contentId}&userId=${userId}&programId=${programId}`
            )
            .pipe(map((response) => response.data));
    }

    getContentForEdit(contentId: number) {
        return this.http
            .get<Result<ContentData>>(
                this.baseUrl +
                    API_CONSTANTS.CONTENT.GET_CONTENT_FOR_UPDATE +
                    contentId
            )
            .pipe(map((response) => response.data));
    }

    sendMessage(message: SendMessage) {
        return this.http
            .post<Result<PassResponse>>(
                this.baseUrl + API_CONSTANTS.CONTENT.SEND_MESSAGE,
                message
            )
            .pipe(map((response) => response.data));
    }

    sendAIMessage(SendAIMessage: SendAIMessage) {
        return this.http
            .post<Result<string>>(
                this.baseUrl + API_CONSTANTS.CONTENT.SEND_AI_MESSAGE,
                SendAIMessage
            )
            .pipe(map((response) => response.data));
    }

    getAiChat(contentId: number) {
        return this.http
            .get<Result<ContentAIChatMessage[]>>(
                this.baseUrl + API_CONSTANTS.CONTENT.GET_AI_CHAT + contentId
            )
            .pipe(map((response) => response.data));
    }

    passStudent(contentId: number, studentId: string) {
        return this.http
            .post<Result<any>>(
                this.baseUrl + API_CONSTANTS.CONTENT.PASS_STUDENT,
                { contentId: contentId, studentId: studentId }
            )
            .pipe(map((response) => response.data));
    }
    updateContent(formdata: FormData) {
        return this.http
            .put<Result<any>>(
                this.baseUrl + API_CONSTANTS.CONTENT.UPDATE_CONTENT,
                formdata
            )
            .pipe(map((response) => response.data));
    }

    getCourseStructure(
        programId: number
    ): Observable<CourseStructureResponse | undefined> {
        return this.http
            .get<Result<CourseStructureResponse>>(
                `${this.baseUrl}CoachingProgram/course-structure/${programId}`
            )
            .pipe(
                map((response: Result<CourseStructureResponse>) => {
                    return response.data;
                })
            );
    }

    getCourseMentors(programId: number) {
        return this.http
            .get<Result<string[]>>(
                `${this.baseUrl}${API_CONSTANTS.PROGRAM.GET_PROGRAM_MENTORS}${programId}`
            )
            .pipe(map((response) => response.data));
    }

   

    addMentor(programId: number, mentorEmail: string) {
        // params
        const params = new HttpParams()
            .set('ProgramId', programId.toString())
            .set('MentorEmail', mentorEmail);

        return this.http
            .post<Result<any>>(
                `${this.baseUrl}${API_CONSTANTS.PROGRAM.ADD_PROGRAM_MENTOR}`,
                params
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Get the next content in the course sequence
     * @param contentId - Current content ID
     * @returns Observable with next content ID or null
     */
    getNextContent(contentId: number): Observable<number | null> {
        return this.http.get<number | null>(
            `${this.baseUrl}/content/${contentId}/next`
        );
    }

    /**
     * Get the previous content in the course sequence
     * @param contentId - Current content ID
     * @returns Observable with previous content ID or null
     */
    getPreviousContent(contentId: number): Observable<number | null> {
        return this.http.get<number | null>(
            `${this.baseUrl}/content/${contentId}/previous`
        );
    }

    /**
     * Mark content as completed/viewed
     * @param contentId - Content ID to mark as completed
     * @param userId - User ID
     * @returns Observable with success status
     */
    markContentAsCompleted(contentId: number, userId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/content/${contentId}/complete`, {
            userId,
        });
    }

    /**
     * Get course progress for a user
     * @param courseId - Course ID
     * @param userId - User ID
     * @returns Observable with progress data
     */
    getCourseProgress(courseId: number): Observable<any> {
        return this.http.get(
            `${this.baseUrl}/${API_CONSTANTS.PROGRAM.GET_ALL_PROGRAMS}/${courseId}/${API_CONSTANTS.PROGRAM.GET_PROGRESS}`
        );
    }

    getNextPrevContent(contentId: number, programId: number,studentId:string) {
        const params = new HttpParams()
            .set('Id', contentId.toString())
            .set('ProgramId', programId)
            .set("UserId",studentId);

        return this.http
            .get<Result<NextContentResponse[]>>(
                this.baseUrl + API_CONSTANTS.CONTENT.GET_NEXT_PREV,
                { params }
            )
            .pipe(map((response) => response.data));
    }
}
