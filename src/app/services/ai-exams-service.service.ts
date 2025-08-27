import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS, Result } from '../constants/apiConstants';
import { map } from 'rxjs';
import {
    EvaluationResponse,
    FinalEvaluationResponse,
    StudentAnswer,
} from '../models/aiExam';

@Injectable({
    providedIn: 'root',
})
export class AiExamsServiceService {
    baseUrl = environment.API_URL;

    constructor(private http: HttpClient) {}

    generateQuestions(contentId: number) {
        return this.http
            .get<Result<string[]>>(
                this.baseUrl +
                    API_CONSTANTS.AIEXAM.GENERATE_QUESTIONS +
                    contentId
            )
            .pipe(map((response) => response.data));
    }

    evaluateSingleQuestion(
        contentId: number,
        question: string,
        userAnswer: string
    ) {
        return this.http
            .post<Result<EvaluationResponse>>(
                this.baseUrl + API_CONSTANTS.AIEXAM.EVALUATE_QUESTION,
                { contentId, question, userAnswer }
            )
            .pipe(map((response) => response.data));
    }

    finalEvaluation(contentId: number, questionsAnswers: StudentAnswer[]) {
        return this.http.post<Result<FinalEvaluationResponse>>(
            this.baseUrl + API_CONSTANTS.AIEXAM.EVALUATE_ALL_QUESTIONS,
            { contentId, questionsAnswers }
        );
    }
}
