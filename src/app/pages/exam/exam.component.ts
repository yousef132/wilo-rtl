import { Component, DebugElement } from '@angular/core';
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
import { forkJoin, Subject, takeUntil } from 'rxjs';
import {
    IsLastContentResponse,
    PassResponse,
} from '../../models/content/content';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { currentUser } from '../../constants/apiConstants';

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
    currentUser!: currentUser;
    // Route parameters
    contentId: number = 0;
    userId: string = '';
    programId: number = 0;
    isLastContent!: IsLastContentResponse;

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
        private authService: AuthService,
        private contentService: ContentService,
        private pdfGeneratorService: PdfGeneratorService
    ) {
        this.initializeUser();
        this.authService.currentUser.subscribe((user) => {
            this.currentUser = user!;
        });
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
        if (!this.contentId || !this.programId) {
            console.error(
                'Content ID and Program ID are required to load questions'
            );
            return;
        }

        this.isLoadingQuestions = true;
        this.hasLoadingError = false;

        forkJoin({
            questions: this.questionService.getContentQuestions(this.contentId),
            isLast: this.contentService.isLastContent(
                this.programId,
                this.contentId
            ),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ questions, isLast }) => {
                    this.questions = questions ?? [];
                    this.isLastContent = isLast!;

                    this.isLoadingQuestions = false;

                    if (this.questions.length === 0) {
                        console.warn(
                            'No questions found for content ID:',
                            this.contentId
                        );
                    }
                },
                error: (error) => {
                    console.error(
                        'Error loading questions or last content check:',
                        error
                    );
                    this.hasLoadingError = true;
                    this.isLoadingQuestions = false;
                    this.questions = [];
                },
            });
    }

    /**
     * Submit exam answers
     */
    async submitAnswers(): Promise<void> {
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

        await this.performSubmission(requestPayload); // ✅ await the async function
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
    private async performSubmission(
        requestPayload: SubmitQuestions
    ): Promise<void> {
        this.isSubmitting = true;
        this.spinner.show();

        this.questionService
            .submitQuestions(requestPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: async (response: PassResponse | undefined) => {
                    await this.handleSubmissionSuccess(response!);
                },
                error: (error) => {
                    this.handleSubmissionError(error);
                },
            });
    }

    /**
     * Handle successful submission
     */
    private async handleSubmissionSuccess(
        passResponse: PassResponse
    ): Promise<void> {
        if (passResponse.nextContentId) {
            if (passResponse.nextContentId == -1) {
                this.spinner.show();
                await this.pdfGeneratorService.fireAndForgetGenerateCertificate(
                    passResponse.templateUrl!,
                    this.currentUser.userName,
                    passResponse.programName!,
                    new Date().toString(),
                    this.currentUser.id,
                    passResponse.programId!,
                    this.contentId,
                    false
                );

                this.spinner.hide();
                this.isSubmitting = false;

                // Don't navigate here, it's already done inside the service
                return;
            }

            if (passResponse.nextContentId == -2) {
                this.spinner.hide();
                this.isSubmitting = false;
                this.router.navigate([
                    '/content-details',
                    this.contentId,
                    this.userId,
                    this.programId,
                ]);
                return;
            }

            this.spinner.hide();
            this.isSubmitting = false;
            this.router.navigate([
                '/content-details',
                passResponse.nextContentId,
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
        // this.showAlert('حدث خطأ أثناء إرسال الإجابات. يرجى المحاولة مرة أخرى.');
    }

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
