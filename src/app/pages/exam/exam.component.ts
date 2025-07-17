import { Component } from '@angular/core';
import {
    AnswerSubmission,
    QuestionResponse,
    SubmitQuestions,
} from '../../models/question/question';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { QuestionService } from '../../services/question.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { AuthService } from '../../services/authr/auth.service';
import { debug } from 'node:console';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-exam',
    imports: [
        FormsModule,
        CommonModule,
        NgxSpinnerModule,
        InnerPageBannerComponent,
    ],
    templateUrl: './exam.component.html',
    styleUrl: './exam.component.scss',
})
export class ExamComponent {
    // Component state
    questions: QuestionResponse[] | null = null;
    selectedChoices: { [questionId: number]: string } = {};
    isSubmitting = false;

    // Route parameters
    contentId: number = 0;
    userId: string = '';
    programId: number = 0;

    // For component cleanup
    private destroy$ = new Subject<void>();

    // Loading states
    isLoadingQuestions = false;
    hasLoadingError = false;

    constructor(
        private questionService: QuestionService,
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private router: Router,
        private authService: AuthService
    ) {
        this.initializeUser();
    }

    ngOnInit(): void {
        this.extractRouteParameters();
        this.loadQuestions();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Initialize user from auth service
     */
    private initializeUser(): void {
        this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe({
            next: (user) => {
                if (user?.id) {
                    this.userId = user.id;
                }
            },
            error: (error) => {
                console.error('Error getting current user:', error);
            },
        });
    }

    /**
     * Extract route parameters
     */
    private extractRouteParameters(): void {
        const contentIdParam = this.route.snapshot.paramMap.get('id');
        const programIdParam = this.route.snapshot.paramMap.get('programId');

        this.contentId = contentIdParam ? +contentIdParam : 0;
        this.programId = programIdParam ? +programIdParam : 0;

        if (!this.contentId || !this.programId) {
            console.error('Missing required route parameters');
            this.router.navigate(['/']);
        }
    }

    /**
     * Load questions for the content
     */
    loadQuestions(): void {
        if (!this.contentId) {
            console.error('Content ID is required to load questions');
            return;
        }

        this.isLoadingQuestions = true;
        this.hasLoadingError = false;

        this.questionService
            .getContentQuestions(this.contentId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (questions: QuestionResponse[] | undefined) => {
                    this.questions = questions ?? [];
                    this.isLoadingQuestions = false;

                    if (this.questions.length === 0) {
                        console.warn(
                            'No questions found for content ID:',
                            this.contentId
                        );
                    }
                },
                error: (error) => {
                    console.error('Error loading questions:', error);
                    this.hasLoadingError = true;
                    this.isLoadingQuestions = false;
                    this.questions = [];
                },
            });
    }

    /**
     * Submit exam answers
     */
    submitAnswers(): void {
        if (!this.questions || this.questions.length === 0) {
            this.showAlert('لا توجد أسئلة للإجابة عليها.');
            return;
        }

        if (!this.allQuestionsAnswered()) {
            this.showAlert('يرجى الإجابة على جميع الأسئلة قبل الإرسال.');
            return;
        }

        if (this.isSubmitting) {
            return; // Prevent double submission
        }

        const answers = this.prepareAnswerSubmissions();
        const requestPayload: SubmitQuestions = {
            contentId: this.contentId,
            submissions: answers,
        };

        this.performSubmission(requestPayload);
    }

    /**
     * Prepare answer submissions from selected choices
     */
    private prepareAnswerSubmissions(): AnswerSubmission[] {
        return Object.entries(this.selectedChoices).map(
            ([questionId, choiceId]) => ({
                questionId: +questionId,
                choiceId,
            })
        );
    }

    /**
     * Perform the actual submission
     */
    private performSubmission(requestPayload: SubmitQuestions): void {
        this.isSubmitting = true;
        this.spinner.show();

        this.questionService
            .submitQuestions(requestPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (nextContentId: number | undefined) => {
                    this.handleSubmissionSuccess(nextContentId);
                },
                error: (error) => {
                    this.handleSubmissionError(error);
                },
            });
    }

    /**
     * Handle successful submission
     */
    private handleSubmissionSuccess(nextContentId: number | undefined): void {
        this.spinner.hide();
        this.isSubmitting = false;
      //=================================
        // null => already registered in next content
        // -1 => last content, user passed the pargram
        // value => next content opened
        // -2 => did not pass the exam
        ;
        if (nextContentId) {
            if (nextContentId == -1) {
                this.router.navigate(['/program-completed']);
                return;
            }
            if(nextContentId == -2){
                this.router.navigate(['/content-details',this.contentId,this.userId,this.programId]);
                return;
            }
            //nextContentId = [1,2,3,...]
            this.router.navigate([
                '/content-details',
                nextContentId,
                this.userId,
                this.programId,
            ]);
        }
    }

    /**
     * Handle submission error
     */
    private handleSubmissionError(error: any): void {
        console.error('Error submitting answers:', error);
        this.spinner.hide();
        this.isSubmitting = false;
        this.showAlert('حدث خطأ أثناء إرسال الإجابات. يرجى المحاولة مرة أخرى.');
    }

    /**
     * Get choice letter for display (أ، ب، ج، د...)
     */
    getChoiceLetter(index: number): string {
        const letters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
        return letters[index] || (index + 1).toString();
    }

    /**
     * Get count of answered questions
     */
    getAnsweredCount(): number {
        return Object.keys(this.selectedChoices).length;
    }

    /**
     * Get progress percentage
     */
    getProgressPercentage(): number {
        if (!this.questions || this.questions.length === 0) {
            return 0;
        }
        return Math.round(
            (this.getAnsweredCount() / this.questions.length) * 100
        );
    }

    /**
     * Check if all questions are answered
     */
    allQuestionsAnswered(): boolean {
        if (!this.questions) return false;
        return this.questions.every(
            (question) =>
                this.selectedChoices[question.id] !== undefined &&
                this.selectedChoices[question.id] !== null &&
                this.selectedChoices[question.id] !== ''
        );
    }

    /**
     * Get unanswered questions count
     */
    getUnansweredCount(): number {
        if (!this.questions) return 0;
        return this.questions.length - this.getAnsweredCount();
    }

    /**
     * Check if a specific question is answered
     */
    isQuestionAnswered(questionId: number): boolean {
        return (
            this.selectedChoices[questionId] !== undefined &&
            this.selectedChoices[questionId] !== null &&
            this.selectedChoices[questionId] !== ''
        );
    }

    /**
     * Clear answer for a specific question
     */
    clearAnswer(questionId: number): void {
        delete this.selectedChoices[questionId];
    }

    /**
     * Reset all answers
     */
    resetAllAnswers(): void {
        if (confirm('هل أنت متأكد من أنك تريد حذف جميع الإجابات؟')) {
            this.selectedChoices = {};
        }
    }

    /**
     * Retry loading questions
     */
    retryLoadQuestions(): void {
        this.hasLoadingError = false;
        this.loadQuestions();
    }

    /**
     * Show alert message
     */
    private showAlert(
        message: string,
        type: 'error' | 'success' | 'warning' = 'error'
    ): void {
        // You can replace this with a proper toast/notification service
        alert(message);
    }

    /**
     * Navigate back to content details
     */
    goBackToContent(): void {
        if (
            confirm(
                'هل أنت متأكد من أنك تريد العودة؟ ستفقد جميع الإجابات المحفوظة.'
            )
        ) {
            this.router.navigate([
                '/content-details',
                this.contentId,
                this.userId,
                this.programId,
            ]);
        }
    }

    /**
     * Track by function for ngFor performance
     */
    trackByQuestionId(index: number, question: QuestionResponse): number {
        return question.id;
    }

    /**
     * Track by function for choices
     */
    trackByChoiceId(index: number, choice: any): any {
        return choice.id;
    }
}
