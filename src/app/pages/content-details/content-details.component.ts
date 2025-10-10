import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { CommonModule } from '@angular/common';
import {
    ContentDetails,
    LoadingState,
    Message,
    NextContentResponse,
    PassResponse,
    SendMessage,
} from '../../models/content/content';

import {
    ContentPassingRequirement,
    ContentType,
} from '../../models/program/programs';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import {
    forkJoin,
    Observable,
    Subject,
    finalize,
    catchError,
    of,
    firstValueFrom,
} from 'rxjs';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/authr/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SharedService } from '../../shared/shared.service';
import { takeUntil } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-instructor-content-details',
    imports: [
        CommonModule,
        InnerPageBannerComponent,
        NgxSpinnerModule,
        FormsModule,
        RouterLink,
    ],
    templateUrl: './content-details.component.html',
    styleUrl: './content-details.component.scss',
})
export class InstructorContentDetailsComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    // Student-specific data
    content: ContentDetails | null = null;
    contentId!: number;
    studentId!: string;
    programId!: number;
    
    // UI State
    ContentType = ContentType;
    ContentPassingRequirement = ContentPassingRequirement;
    alertMessage = '';
    passedStudent: boolean = false;
    safeContentHtml: SafeHtml | null = null;
    
    // Chat
    messages: Message[] | null = null;
    newMessage: string = '';
    currentUserId: string = '';
    isSignalRConnected = false;
    
    // Navigation
    nextPreviewContent!: NextContentResponse[] | undefined;

    // Loading states
    loading: LoadingState = {
        content: false,
        chat: false,
        aiChat: false,
        navigation: false,
        sendingMessage: false,
        sendingAiMessage: false,
        passingStudent: false,
        courseStructure: false,
    };

    isInitialLoading = false;
    error: string | null = null;

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    // Destroy subject for cleanup
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private contentService: ContentService,
        private spinner: NgxSpinnerService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private authService: AuthService,
        private chatService: ChatService
    ) {
        this.authService.currentUser
            .pipe(takeUntil(this.destroy$))
            .subscribe((user) => {
                this.currentUserId = user?.id!;
            });
    }

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (params) => {
                this.contentId = +params['contentId'];
                this.studentId = params['userId'];
                this.programId = +params['programId'];

                await this.loadInitialData();
                await this.disconnectSignalR();
                await this.connectToSignalR();
            });
    }

    ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    ngOnDestroy(): void {
        this.disconnectSignalR();
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async connectToSignalR(): Promise<void> {
        if (!this.content?.userContentRegistrationId) return;

        await this.chatService.startConnection(
            this.content.userContentRegistrationId
        );

        this.subscribeToSignalRMessages();
        this.isSignalRConnected = true;
    }

    private subscribeToSignalRMessages(): void {
        this.chatService.hubConnection?.on(
            'ReceiveMessage',
            (signalRMessage: any) => {
                const newMessage: Message = {
                    textMessage: signalRMessage.message,
                    userId: signalRMessage.senderId,
                    userName: signalRMessage.arName,
                    messageDate: new Date(signalRMessage.sentAt),
                };

                if (this.messages) {
                    this.messages.push(newMessage);
                } else {
                    this.messages = [newMessage];
                }

                this.scrollToBottom();
            }
        );
    }

    private async disconnectSignalR(): Promise<void> {
        if (this.isSignalRConnected && this.chatService.hubConnection) {
            this.chatService.hubConnection.off('ReceiveMessage');
            this.chatService.hubConnection.off('MessageRead');

            await this.chatService.hubConnection
                .stop()
                .catch((err) => console.error('Error stopping SignalR:', err));

            this.isSignalRConnected = false;
        }
    }

    public async loadInitialData(): Promise<void> {
        this.isInitialLoading = true;
        this.error = null;

        try {
            const essentialData = await firstValueFrom(
                forkJoin({
                    content: this.getContent().pipe(
                        catchError((err) => {
                            console.error('Error loading content:', err);
                            return of(undefined);
                        })
                    ),
                    navigation: this.contentService
                        .getNextPrevContent(this.contentId, this.programId,this.studentId )
                        .pipe(
                            catchError((err) => {
                                console.error('Error loading navigation:', err);
                                return of(undefined);
                            })
                        ),
                })
            );

            this.processContentData(essentialData.content);
            this.nextPreviewContent = essentialData.navigation;

            this.loading.chat = true;
            firstValueFrom(
                this.getChat().pipe(
                    catchError((err) => {
                        console.error('Error loading chat:', err);
                        return of(undefined);
                    })
                )
            )
                .then((chat) => {
                    this.messages = chat || [];
                    setTimeout(() => this.scrollToBottom(), 100);
                })
                .catch((err) => {
                    console.error('Error loading chat:', err);
                    this.messages = [];
                })
                .finally(() => (this.loading.chat = false));
        } catch (err) {
            console.error('Critical error loading essential data:', err);
            this.error = 'حدث خطأ في تحميل المحتوى. يرجى إعادة المحاولة.';
        } finally {
            this.isInitialLoading = false;
            this.spinner.hide();
        }
    }

    private processContentData(content: ContentDetails | undefined): void {
        this.content = content || null;

        if (this.content?.contentUrl) {
            this.safeContentHtml = this.sanitizer.bypassSecurityTrustHtml(
                this.content.contentUrl
            );
        }

        this.passedStudent = this.content?.isPassed || false;
        this.setAlertMessage();
    }

    sendMessage(): void {
        const trimmed = this.newMessage.trim();
        if (!trimmed || this.loading.sendingMessage) return;

        this.loading.sendingMessage = true;
        const originalMessage = this.newMessage;
        this.newMessage = '';

        if (
            this.isSignalRConnected &&
            this.content?.userContentRegistrationId
        ) {
            try {
                this.chatService.sendMessage(
                    this.content.userContentRegistrationId,
                    trimmed,
                    this.contentId
                );

                this.loading.sendingMessage = false;
                this.scrollToBottom();
            } catch (error) {
                console.error('SignalR send message failed:', error);
                this.newMessage = originalMessage;
                this.loading.sendingMessage = false;
                alert('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
            }
        } else {
            this.sendMessageViaHttp(trimmed, originalMessage);
        }
    }

    private sendMessageViaHttp(message: string, originalMessage: string): void {
        const sendMessage: SendMessage = {
            contentId: this.contentId,
            comment: message,
            registrationId: this.content?.userContentRegistrationId!,
        };

        this.contentService
            .sendMessage(sendMessage)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loading.sendingMessage = false))
            )
            .subscribe({
                next: (response: PassResponse | undefined) => {
                    if (response?.nextContentId) {
                        if (response.nextContentId === -1) {
                            this.router.navigate(['/program-completed']);
                            return;
                        }
                        this.router.navigate([
                            '/content-details',
                            response.nextContentId,
                            this.studentId,
                            this.programId,
                        ]);
                        return;
                    }
                },
                error: (error) => {
                    console.error('Send message failed:', error);
                    this.newMessage = originalMessage;
                    alert('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
                },
            });
    }

    async passStudent(): Promise<void> {
        this.loading.navigation = true;

        try {
            await firstValueFrom(
                this.contentService.passStudent(this.contentId, this.studentId)
            );

            this.passedStudent = true;
            await this.loadInitialData();
            await this.disconnectSignalR();
            await this.connectToSignalR();
        } catch (error) {
            console.error('Error passing student:', error);
            alert('حدث خطأ أثناء تحديث حالة الطالب. يرجى المحاولة مرة أخرى.');
        } finally {
            this.loading.navigation = false;
        }
    }

    scrollToBottom(): void {
        setTimeout(() => {
            try {
                if (this.messagesContainer?.nativeElement) {
                    this.messagesContainer.nativeElement.scrollTop =
                        this.messagesContainer.nativeElement.scrollHeight;
                }
            } catch (err) {
                console.error('Scroll error:', err);
            }
        }, 100);
    }

    setAlertMessage(): void {
        switch (this.content?.contentPassingRequirement) {
            case ContentPassingRequirement.Comment:
                this.alertMessage = 'يجب على الطالب إضافة تعليق للنجاح';
                break;
            case ContentPassingRequirement.Exam:
                this.alertMessage = 'يجب على الطالب حل الأسئلة للنجاح';
                break;
            case ContentPassingRequirement.Manually:
                this.alertMessage = 'يمكنك تحديد نجاح الطالب يدوياً';
                break;
            case ContentPassingRequirement.AiExam:
                this.alertMessage = 'يجب على الطالب حل الأسئلة الذكية للنجاح';
                break;
        }
    }

    getPercentage(result: number, total: number): number {
        if (!total || total === 0) return 0;
        return (result / total) * 100;
    }

    getUserInitials(userName: string): string {
        if (!userName) return '?';
        const words = userName.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        return (
            words[0].charAt(0) + words[words.length - 1].charAt(0)
        ).toUpperCase();
    }

    getContent(): Observable<ContentDetails | undefined> {
        return this.contentService.getContent(this.contentId, this.studentId);
    }

    getChat(): Observable<Message[] | undefined> {
        return this.contentService.getContentChat(
            this.contentId,
            this.studentId,
            this.programId
        );
    }
}