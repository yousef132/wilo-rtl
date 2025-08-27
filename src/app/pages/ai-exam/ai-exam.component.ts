import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    EvaluateAnswerRequest,
    EvaluationResponse,
    FinalEvaluationRequest,
    FinalEvaluationResponse,
    GenerateQuestionsRequest,
    StudentAnswer,
} from '../../models/aiExam';
import { ActivatedRoute, Router } from '@angular/router';
import { AiExamsServiceService } from '../../services/ai-exams-service.service';
import { error } from 'console';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { currentUser } from '../../constants/apiConstants';
import { AuthService } from '../../services/authr/auth.service';

@Component({
    selector: 'app-ai-exam',
    imports: [CommonModule, FormsModule],

    standalone: true,
    templateUrl: './ai-exam.component.html',
    styleUrl: './ai-exam.component.scss',
})
export class AiExamComponent implements OnInit {
      // Input property for content ID
    contentId!: number;
    programId!: number;

    // Component State
    examState: 'loading' | 'question' | 'feedback' | 'final-results' | 'generating-certificate' | 'course-completed' | 'exam-failed' = 'loading';

    currentUser!: currentUser;
    
    // Data Properties
    questions: string[] = [];
    currentQuestionIndex: number = 0;
    currentAnswer: string = '';
    studentAnswers: StudentAnswer[] = [];
    lastEvaluation: EvaluationResponse | null = null;
    finalEvaluation: FinalEvaluationResponse | null = null;

    // New properties for course completion
    nextContentId: number = 0;
    programName: string = '';
    certificateGenerating: boolean = false;
    courseCompleted: boolean = false;
    examPassed: boolean = false;

    // UI State
    isLoading: boolean = false;
    isThinking: boolean = false;
    isWaitingForNext: boolean = false;
    errorMessage: string = '';
    totalQuestions: number = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private aiExamService: AiExamsServiceService,
        private pdfGenerator: PdfGeneratorService,
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

    get currentQuestion(): string {
        return this.questions[this.currentQuestionIndex] || '';
    }

    get progressPercentage(): number {
        if (this.examState === 'feedback') {
            return (this.currentQuestionIndex / this.totalQuestions) * 100;
        }
        return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
    }

    initializeExam() {
        this.isThinking = true;
        this.examState = 'loading';

        this.aiExamService.generateQuestions(this.contentId).subscribe({
            next: (response: string[] | undefined) => {
                console.log('Questions received:', response);

                if (response && response.length > 0) {
                    this.questions = response;
                    this.totalQuestions = this.questions.length;

                    setTimeout(() => {
                        this.isThinking = false;
                        this.currentQuestionIndex = 0;
                        this.examState = 'question';
                        this.currentAnswer = '';
                    }, 500);
                } else {
                    this.isThinking = false;
                    this.showError('No questions were generated. Please try again.');
                }
            },
            error: (error) => {
                console.error('Error generating questions:', error);
                this.showError('Failed to connect to AI system. Please check your connection and try again.');
                this.isThinking = false;
            },
        });
    }

    submitAnswer() {
        if (!this.currentAnswer.trim()) {
            this.showError('Please provide an answer before submitting to the AI.');
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.aiExamService
            .evaluateSingleQuestion(this.contentId, this.currentQuestion, this.currentAnswer)
            .subscribe({
                next: (response: EvaluationResponse | undefined) => {
                    if (response) {
                        this.studentAnswers.push({
                            question: this.currentQuestion,
                            answer: this.currentAnswer,
                        });

                        this.lastEvaluation = response;
                        this.examState = 'feedback';
                        this.currentAnswer = '';
                    } else {
                        this.showError('AI evaluation failed. Please try again.');
                    }
                },
                error: (error) => {
                    console.error('Error evaluating answer:', error);
                    this.showError('Failed to get AI feedback. Please check your connection and try again.');
                },
                complete: () => {
                    this.isLoading = false;
                },
            });
    }

    proceedToNext() {
        if (this.hasMoreQuestions()) {
            this.isWaitingForNext = true;
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.examState = 'question';
                this.isWaitingForNext = false;
            }, 1500);
        } else {
            this.getFinalEvaluation();
        }
    }

    getFinalEvaluation() {
        this.isLoading = true;
        this.errorMessage = '';

        this.aiExamService.finalEvaluation(this.contentId, this.studentAnswers).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    debugger
                    // ✅ Passed exam
                    this.finalEvaluation = res.data!;
                    this.nextContentId = res.data!.nextContentId!;
                    this.programName = res.data!.programName || '';
                    this.examPassed = true;

                    // Handle different scenarios based on nextContentId
                    if (this.nextContentId === -1) {
                        // Course completed - generate certificate
                        this.courseCompleted = true;
                        this.examState = 'generating-certificate';
                        this.generateCertificate(res.data!);
                    } else if (this.nextContentId > 0) {
                        // Moved to next content
                        this.examState = 'final-results';
                    }
                } else {
                    // ❌ Didn't pass exam (nextContentId = -2)
                    this.examPassed = false;
                    this.examState = 'exam-failed';
                    this.finalEvaluation = res.data!;
                    this.showError(res.message || 'لم تنجح في الامتحان. حاول مرة أخرى.');
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error getting final evaluation:', error);
                this.showError('Failed to get AI final assessment. Please check your connection and try again.');
                this.isLoading = false;
            },
            complete: () => {
                console.log('Final evaluation request completed');
            },
        });
    }

    private generateCertificate(data: any) {
        this.certificateGenerating = true;
        
        // Show certificate generation UI
        setTimeout(() => {
            this.pdfGenerator.fireAndForgetGenerateCertificate(
                data.templateUrl!,
                this.currentUser.userName,
                data.programName!,
                new Date().toString(),
                this.currentUser.id,
                data.programId!,
                this.contentId,
                false
            );

            // Simulate certificate generation time
            setTimeout(() => {
                this.certificateGenerating = false;
                this.examState = 'course-completed';
            }, 3000); // 3 seconds for certificate generation
        }, 1000);
    }

    hasMoreQuestions(): boolean {
        return this.currentQuestionIndex < this.questions.length - 1;
    }

    restartExam() {
        // Reset all state
        this.examState = 'loading';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.currentAnswer = '';
        this.studentAnswers = [];
        this.lastEvaluation = null;
        this.finalEvaluation = null;
        this.errorMessage = '';
        this.isLoading = false;
        this.isThinking = false;
        this.isWaitingForNext = false;
        this.certificateGenerating = false;
        this.courseCompleted = false;
        this.examPassed = false;
        this.nextContentId = 0;

        this.initializeExam();
    }

    goToNextContent() {
        if (this.nextContentId > 0) {
            // content id , user id , program id
            this.router.navigate(['/content-details', this.nextContentId,this.currentUser.id,this.programId]);// Adjust route as needed
        }
    }

    goToCourses() {
        this.router.navigate(['/courses']);
    }

    getScoreClass(score: number): string {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    }

    getFinalScoreClass(): string {
        const score = this.finalEvaluation?.finalScore || 0;
        return this.getScoreClass(score);
    }

    private showError(message: string) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 6000);
    }
}
