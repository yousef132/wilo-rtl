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
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import {
    AIChatRole,
    ContentAIChatMessage,
    ContentDetails,
    IsLastContentResponse,
    LoadingState,
    Message,
    NextContentResponse,
    PassResponse,
    SendAIMessage,
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
import { debug } from 'node:console';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-content-details',
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
export class ContentDetailsComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    activeMainTab: 'content' | 'chat' = 'content';

    content: ContentDetails | null = null;
    contentId!: number;
    ContentType = ContentType;
    alertMessage = '';
    passedStudent: boolean = false;
    ContentPassingRequirement = ContentPassingRequirement;
    messages: Message[] | null = null;
    newMessage: string = '';
    userId: string = '';
    safeContentHtml: SafeHtml | null = null;
    // arr[0]=> pref , arr[1] => next [if next is null then it is the last content]
    nextPreviewContent!: NextContentResponse[] | undefined;
    programId!: number;
    currentUserId: string = '';
    isSignalRConnected = false;
    isLastContent!: IsLastContentResponse;

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

    // Global loading state for initial load
    isInitialLoading = false;

    // Error handling
    error: string | null = null;

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    // AI chat props
    activeChatTab: 'instructor' | 'ai' = 'instructor';
    aiMessages: ContentAIChatMessage[] = [];
    prompt: string = '';
    aiIsThinking: boolean = false;
    AIChatRole = AIChatRole;
    @ViewChild('aiMessagesContainer') aiMessagesContainer!: ElementRef;

    // Destroy subject for cleanup
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private contentService: ContentService,
        private spinner: NgxSpinnerService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private sharedService: SharedService,
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
                this.userId = params['userId'];
                this.programId = +params['programId'];

                debugger;
                // 1️ Wait until data is loaded before touching SignalR
                await this.loadInitialData();

                // 2️ Disconnect old chat and connect to new one
                await this.disconnectSignalR();
                await this.connectToSignalR();
            });
    }

    ngAfterViewInit(): void {
        if (this.activeChatTab === 'instructor') {
            this.scrollToBottom();
        } else {
            this.scrollAiToBottom();
        }
    }

    ngOnDestroy(): void {
        debugger;
        this.disconnectSignalR();

        this.destroy$.next();
        this.destroy$.complete();
    }

    switchMainTab(tab: 'content' | 'chat'): void {
        this.activeMainTab = tab;

        // Load chat data when switching to chat tab if not already loaded
        if (tab === 'chat') {
            if (this.activeChatTab === 'instructor') {
                this.loadChatMessages();

                // Connect to SignalR when switching to instructor chat
                // this.connectToSignalR();
            } else if (this.activeChatTab === 'ai') {
                this.loadAiMessages();
            }
        }
    }

    private async connectToSignalR(): Promise<void> {
        if (!this.content?.userContentRegistrationId) return;

        await this.chatService.startConnection(
            this.content.userContentRegistrationId
        );

        // Subscribe to new messages after the connection is ready
        this.subscribeToSignalRMessages();

        this.isSignalRConnected = true;
    }

    // private async disconnectFromSignalR(): Promise<void> {
    //     if (this.isSignalRConnected) {
    //         try {
    //             await this.chatService.stopConnection();
    //             this.isSignalRConnected = false;
    //         } catch (err) {
    //             console.error('Error stopping SignalR connection:', err);
    //         }
    //     }
    // }
    private subscribeToSignalRMessages(): void {
        // Listen for new messages from SignalR
        this.chatService.hubConnection?.on(
            'ReceiveMessage',
            (signalRMessage: any) => {
                debugger;
                // Convert SignalR message format to your Message format
                const newMessage: Message = {
                    textMessage: signalRMessage.message,
                    userId: signalRMessage.senderId,
                    userName: signalRMessage.arName, // You'll need to implement this
                    messageDate: new Date(signalRMessage.sentAt),
                };

                // Add message to the messages array
                if (this.messages) {
                    this.messages.push(newMessage);
                } else {
                    this.messages = [newMessage];
                }

                // Scroll to bottom to show new message
                this.scrollToBottom();
            }
        );
    }

    private async disconnectSignalR(): Promise<void> {
        if (this.isSignalRConnected && this.chatService.hubConnection) {
            // Remove listeners before stopping the connection
            this.chatService.hubConnection.off('ReceiveMessage');
            this.chatService.hubConnection.off('MessageRead');

            await this.chatService.hubConnection
                .stop()
                .catch((err) => console.error('Error stopping SignalR:', err));

            this.isSignalRConnected = false;
            console.log('SignalR disconnected');
        }
    }

    // Optional: You can also add method to handle initial chat loading
    private loadChatMessages(): void {
        // Your existing chat loading logic here
        // This will be called when user first switches to instructor chat
    }

    private loadAiMessages(): void {
        // Your existing AI chat loading logic here
        // This will be called when user first switches to AI chat
    }
    public async loadInitialData(): Promise<void> {
        this.isInitialLoading = true;
        this.error = null;

        try {
            // Load essential data in parallel
            const essentialData = await firstValueFrom(
                forkJoin({
                    content: this.getContent().pipe(
                        catchError((err) => {
                            console.error('Error loading content:', err);
                            return of(undefined);
                        })
                    ),
                    navigation: this.contentService
                        .getNextPrevContent(this.contentId, this.programId)
                        .pipe(
                            catchError((err) => {
                                console.error('Error loading navigation:', err);
                                return of(undefined);
                            })
                        ),
                    isLastContent: this.contentService
                        .isLastContent(this.programId, this.contentId)
                        .pipe(
                            catchError((err) => {
                                console.error(
                                    'Error checking last content:',
                                    err
                                );
                                return of(undefined); // default if error occurs
                            })
                        ),
                })
            );
            // Process the essential data
            this.processContentData(essentialData.content);
            this.nextPreviewContent = essentialData.navigation;
            this.isLastContent = essentialData.isLastContent!;
            // Now load chat (non-blocking)
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

    // Load AI chat with loading state
    loadAIChat(): void {
        if (this.loading.aiChat) return; // Prevent multiple calls

        this.loading.aiChat = true;
        this.contentService
            .getAiChat(this.contentId)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loading.aiChat = false))
            )
            .subscribe({
                next: (aiMessages: ContentAIChatMessage[] | undefined) => {
                    this.aiMessages = aiMessages || [];
                    this.scrollAiToBottom();
                },
                error: (err) => {
                    console.error('Error loading AI chat:', err);
                    this.aiMessages = [];
                },
            });
    }

    sendMessage(): void {
        const trimmed = this.newMessage.trim();
        if (!trimmed || this.loading.sendingMessage) return;

        this.loading.sendingMessage = true;
        const originalMessage = this.newMessage;
        this.newMessage = '';

        // Use SignalR for real-time messaging instead of HTTP API
        if (
            this.isSignalRConnected &&
            this.content?.userContentRegistrationId
        ) {
            try {
                // Send message via SignalR
                this.chatService.sendMessage(
                    this.content.userContentRegistrationId,
                    trimmed,
                    this.contentId
                );

                this.loading.sendingMessage = false;
                this.scrollToBottom();
            } catch (error) {
                console.error('SignalR send message failed:', error);
                this.newMessage = originalMessage; // Restore message on error
                this.loading.sendingMessage = false;
                alert('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
            }
        } else {
            // Fallback to HTTP API if SignalR is not connected
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
                    // Handle response if needed
                    if (response?.nextContentId) {
                        if (response.nextContentId === -1) {
                            this.router.navigate(['/program-completed']);
                            return;
                        }
                        this.router.navigate([
                            '/content-details',
                            response.nextContentId,
                            this.userId,
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
    // Enhanced AI message sending
    sendAiMessage(): void {
        const trimmed = this.prompt.trim();
        if (!trimmed || this.loading.sendingAiMessage) return;

        const userMessage: ContentAIChatMessage = {
            messageText: trimmed,
            role: AIChatRole.User,
            sentAt: new Date(),
        };

        // Add user message immediately
        this.aiMessages.push(userMessage);
        this.prompt = '';
        this.scrollAiToBottom();

        this.loading.sendingAiMessage = true;
        this.aiIsThinking = true;

        const sendMessage: SendAIMessage = {
            contentId: this.contentId,
            question: trimmed,
        };

        this.contentService
            .sendAIMessage(sendMessage)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.loading.sendingAiMessage = false;
                    this.aiIsThinking = false;
                })
            )
            .subscribe({
                next: (response: string | undefined) => {
                    // Process AI response
                    if (response) {
                        debugger;
                        const aiResponse: ContentAIChatMessage = {
                            messageText: response,
                            role: AIChatRole.Assistant,
                            sentAt: new Date(),
                        };
                        this.aiMessages.push(aiResponse);
                    }
                    this.scrollAiToBottom();
                },
                error: (error) => {
                    console.error('Send AI message failed:', error);
                    // Remove user message on error
                    this.aiMessages = this.aiMessages.filter(
                        (msg) => msg !== userMessage
                    );
                    alert(
                        'فشل في إرسال الرسالة للمساعد الذكي. يرجى المحاولة مرة أخرى.'
                    );
                },
            });
    }

    switchChatTab(tab: 'instructor' | 'ai'): void {
        this.activeChatTab = tab;

        // Load AI messages when switching to AI tab for the first time
        if (
            tab === 'ai' &&
            this.aiMessages.length === 0 &&
            !this.loading.aiChat
        ) {
            this.loadAIChat();
        }

        // Scroll to bottom when switching tabs
        setTimeout(() => {
            if (tab === 'ai') {
                this.scrollAiToBottom();
            } else {
                this.scrollToBottom();
            }
        }, 100);
    }

    async passStudent(): Promise<void> {
        this.loading.navigation = true;

        try {
            await firstValueFrom(
                this.contentService.passStudent(this.contentId, this.userId)
            );

            this.passedStudent = true;

            // Wait until data is fully reloaded
            await this.loadInitialData();

            // Reconnect SignalR with the updated content (if needed)
            await this.disconnectSignalR();
            await this.connectToSignalR();
        } catch (error) {
            console.error('Error passing student:', error);
            alert('حدث خطأ أثناء تحديث حالة الطالب. يرجى المحاولة مرة أخرى.');
        } finally {
            this.loading.navigation = false;
        }
    }

    // Helper methods remain the same
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

    scrollAiToBottom(): void {
        setTimeout(() => {
            try {
                if (this.aiMessagesContainer?.nativeElement) {
                    this.aiMessagesContainer.nativeElement.scrollTop =
                        this.aiMessagesContainer.nativeElement.scrollHeight;
                }
            } catch (err) {
                console.error('AI Scroll error:', err);
            }
        }, 100);
    }

    setAlertMessage(): void {
        switch (this.content?.contentPassingRequirement) {
            case ContentPassingRequirement.Comment:
                this.alertMessage = 'اضف تعليق للنجاح فى هذا المحتوى';
                break;
            case ContentPassingRequirement.Exam:
                this.alertMessage = 'قم بحل الاسئله للنجاح فى هذا المحتوى';
                break;
            case ContentPassingRequirement.Manually:
                this.alertMessage = 'سيقوم المدرب بتحديد نجاحك فى هذا المحتوى';
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

    // API methods remain the same
    getContent(): Observable<ContentDetails | undefined> {
        return this.contentService.getContent(this.contentId, this.userId);
    }

    getChat(): Observable<Message[] | undefined> {
        return this.contentService.getContentChat(
            this.contentId,
            this.userId,
            this.programId
        );
    }
}
