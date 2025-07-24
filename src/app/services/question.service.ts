import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import {
    CreateQuestionsCommand,
    QuestionResponse,
    SubmitQuestions,
} from '../models/question/question';
import { API_CONSTANTS, Result } from '../constants/apiConstants';
import { map } from 'rxjs';
import { PassResponse } from '../models/content/content';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    baseUrl = environment.API_URL;
    constructor(private http: HttpClient) {}

    createQuestion(command: CreateQuestionsCommand) {
        return this.http
            .post<Result<any>>(
                this.baseUrl + API_CONSTANTS.QUESTION.CREATE_QUESTION,
                command
            )
            .pipe(map((res: any) => res.data));
    }
    getContentQuestions(contentId: number) {
        return this.http
            .get<Result<QuestionResponse[]>>(
                this.baseUrl +
                    API_CONSTANTS.QUESTION.GET_CONTENT_QUESTIONS +
                    contentId
            )
            .pipe(map((response) => response.data));
    }

    submitQuestions(command: SubmitQuestions) {
        return this.http
            .post<Result<PassResponse >>(
                this.baseUrl + API_CONSTANTS.QUESTION.SUBMIT_QUESTIONS,
                command
            )
            .pipe(map((response) => response.data));
    }
}
