import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    QuestionResponse,
} from '../../models/aiExam';
import { ActivatedRoute, Router } from '@angular/router';
import { AiExamsServiceService } from '../../services/ai-exams-service.service';
import { currentUser } from '../../constants/apiConstants';
import { AuthService } from '../../services/authr/auth.service';
import { AnswerSubmission, SubmitQuestions } from '../../models/question/question';
import { QuestionService } from '../../services/question.service';

@Component({
    selector: 'app-ai-exam',
    imports: [CommonModule, FormsModule],
    standalone: true,
    templateUrl: './ai-exam.component.html',
    styleUrl: './ai-exam.component.scss',
})
export class AiExamComponent implements OnInit {
    contentId!: number;
    programId!: number;

    examState:
        | 'loading'
        | 'question'
        | 'course-completed'
        | 'exam-failed' = 'loading';

    currentUser!: currentUser;

    questions: QuestionResponse[] = [];
    currentQuestionIndex: number = 0;
    selectedChoiceId: string = '';
    submissions: AnswerSubmission[] = [];

    nextContentId: number = 0;
    courseCompleted: boolean = false;
    examPassed: boolean = false;

    isLoading: boolean = false;
    isThinking: boolean = false;
    errorMessage: string = '';
    totalQuestions: number = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private aiExamService: AiExamsServiceService,
        private questionService: QuestionService,
        private authService: AuthService
    ) {
        this.route.params.subscribe((params) => {
            this.contentId = +params['contentId'];
            this.programId = +params['programId'];
        });

        this.authService.currentUser.subscribe((user) => {
            if (user) this.currentUser = user;
        });
    }

    ngOnInit() {
        this.initializeExam();
    }

    get currentQuestion(): QuestionResponse | null {
        return this.questions[this.currentQuestionIndex] || null;
    }

    get progressPercentage(): number {
        return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
    }

    initializeExam() {
        this.isThinking = true;
        this.examState = 'loading';

        this.aiExamService.generateQuestions(this.contentId).subscribe({
            next: (response: QuestionResponse[] | undefined) => {
                if (response && response.length > 0) {
                    this.questions = response;
                    this.totalQuestions = this.questions.length;

                    setTimeout(() => {
                        this.isThinking = false;
                        this.currentQuestionIndex = 0;
                        this.examState = 'question';
                        this.selectedChoiceId = '';
                    }, 500);
                    
                } else {
                    this.isThinking = false;
                    this.showError(
                        'لم يتم إنشاء أسئلة. يرجى المحاولة مرة أخرى.'
                    );
                }
            },
            error: (error) => {
                console.error('Error generating questions:', error);
                this.showError(
                    'فشل الاتصال بنظام الذكاء الاصطناعي. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
                );
                this.isThinking = false;
            },
        });
    }

    selectChoice(choiceId: string) {
        this.selectedChoiceId = choiceId;
    }

    submitAnswer() {
        if (!this.selectedChoiceId) {
            this.showError('يرجى اختيار إجابة قبل المتابعة.');
            return;
        }

        // Store the submission
        this.submissions.push({
            questionId: this.currentQuestion!.id,
            choiceId: this.selectedChoiceId,
        });

        // Move to next question or submit exam
        if (this.hasMoreQuestions()) {
            this.currentQuestionIndex++;
            this.selectedChoiceId = '';
        } else {
            this.submitExam();
        }
    }

    submitExam() {
        this.isLoading = true;
        this.errorMessage = '';

        const requestPayload: SubmitQuestions = {
            contentId: this.contentId,
            submissions: this.submissions,
        };

        this.questionService.submitQuestions(requestPayload).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                
                if (response.nextContentId === -1) {
                    // Course completed
                    this.courseCompleted = true;
                    this.examPassed = true;
                    this.router.navigate(['/lecture-viewer', this.programId], {
                        queryParams: { passed: true },
                    });
                } else if (response.nextContentId > 0) {
                    // Passed exam, move to next content
                    this.examPassed = true;
                    this.nextContentId = response.nextContentId;
                    this.router.navigate(['/lecture-viewer', this.programId], {
                        queryParams: { contentId: response.nextContentId },
                    });
                } else if (response.nextContentId === -2) {
                    // Failed exam
                    this.examPassed = false;
                    this.examState = 'exam-failed';
                }
            },
            error: (error) => {
                console.error('Error submitting exam:', error);
                this.showError(
                    'فشل إرسال الامتحان. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
                );
                this.isLoading = false;
            },
        });
    }

    hasMoreQuestions(): boolean {
        return this.currentQuestionIndex < this.questions.length - 1;
    }

    restartExam() {
        this.examState = 'loading';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.selectedChoiceId = '';
        this.submissions = [];
        this.errorMessage = '';
        this.isLoading = false;
        this.isThinking = false;
        this.courseCompleted = false;
        this.examPassed = false;
        this.nextContentId = 0;

        this.initializeExam();
    }

    goToCurrentContent() {
        this.router.navigate(['/lecture-viewer', this.programId], {
            queryParams: { contentId: this.contentId },
        });
    }

    private showError(message: string) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 6000);
    }
}