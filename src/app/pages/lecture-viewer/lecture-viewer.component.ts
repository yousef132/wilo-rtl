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
    CourseStructureResponse,
    LoadingState,
    Message,
    NextContentResponse,
    PassResponse,
    SendAIMessage,
    SendMessage,
    CourseLecture,
    CourseSection,
} from '../../models/content/content';

import {
    ContentPassingRequirement,
    ContentStatus,
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
    combineLatest,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authr/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SharedService } from '../../shared/shared.service';
import { retry, takeUntil } from 'rxjs/operators';
import { debug } from 'node:console';
import { ChatService, MessageConfirmation } from '../../services/chat.service';

@Component({
    selector: 'app-lecture-viewer',
    imports: [CommonModule, FormsModule],
    templateUrl: './lecture-viewer.component.html',
    styleUrl: './lecture-viewer.component.scss',
})
export class LectureViewerComponent implements OnInit {
    // Enums for template
    ContentType = ContentType;
    ContentPassingRequirement = ContentPassingRequirement;
    AIChatRole = AIChatRole;

    // Content data
    currentLecture: ContentDetails | null = null;
    contentId!: number;
    programId!: number;
    currentUserId: string = '';
    passed = false;

    // Course structure and navigation
    courseStructure: CourseStructureResponse | null = null;
    allContents: CourseLecture[] = [];

    // Chat data
    messages: Message[] | null = null;
    aiMessages: ContentAIChatMessage[] = [];
    newMessage: string = '';
    prompt: string = '';

    // UI state
    isChatOpen = false;
    isMobileSidebarOpen = false;
    chatMode: 'instructor' | 'ai' = 'instructor';
    aiIsThinking: boolean = false;

    // Chat loading flags
    hasLoadedInstructorChat = false;
    hasLoadedAiChat = false;
    showCourseCompletion: boolean = false;

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

    // SignalR
    isSignalRConnected = false;

    // Content processing
    safeContentHtml: SafeHtml | null = null;
    passedStudent: boolean = false;
    alertMessage = '';

    // ViewChild references
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('aiMessagesContainer') aiMessagesContainer!: ElementRef;
    @ViewChild('chatModal') chatModal!: ElementRef;

    // Cleanup
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private contentService: ContentService,
        private authService: AuthService,
        private chatService: ChatService,
        private sanitizer: DomSanitizer
    ) {
        this.authService.currentUser
            .pipe(takeUntil(this.destroy$))
            .subscribe((user) => {
                this.currentUserId = user?.id!;
            });
    }

    ngOnInit(): void {
        combineLatest([this.route.params, this.route.queryParams])
            .pipe(takeUntil(this.destroy$))
            .subscribe(async ([params, queryParams]) => {
                // required path param
                this.programId = +params['programId'];

                // optional query params
                this.passed = queryParams['passed'] === 'true';
                this.contentId = +queryParams['contentId'];

                console.log(
                    'ProgramId:',
                    this.programId,
                    'ContentId:',
                    this.contentId,
                    'Passed:',
                    this.passed
                );

                // now you have both params and queryParams before calling these
                await this.loadInitialData();
                await this.disconnectSignalR();
                await this.connectToSignalR();
            });

        // Subscribe to message confirmation events
        this.chatService.messageConfirmation
            .pipe(takeUntil(this.destroy$))
            .subscribe((confirmation: MessageConfirmation) => {
                this.handleMessageConfirmation(confirmation);
            });
    }

    private async handleMessageConfirmation(
        confirmation: MessageConfirmation
    ): Promise<void> {
        // event will be fired only when the next content id is not null
        // that's why i commented this line
        // if (!confirmation?.nextContentId) return;

        // 1. Mark CURRENT content as passed/completed
        const currentContent = this.allContents.find(
            (c) => c.id === this.contentId
        );
        if (currentContent) {
            currentContent.status = ContentStatus.Finished; // Or whatever your passed status is
            currentContent.isPassed = true; // If you have this property
        }
        if (confirmation.nextContentId === -1) {
            this.getProgressPercentage();
            this.showCourseCompletion = true;
            return;
        }

        // here the user has opened the next content
        try {
            // 2. Mark NEXT content as accessible (Progressing)
            const nextContent = this.allContents.find(
                (c) => c.id === confirmation.nextContentId
            );
            if (nextContent) {
                nextContent.status = ContentStatus.Progressing;

                // 3. Update UI state for the current component
                this.passedStudent = true; // If you're using this flag
                this.toggleChat();
                // 4. Navigate to the next content
                // Use a small delay to allow UI to update before navigation
                setTimeout(() => {
                    this.navigateToContent(confirmation.nextContentId);
                }, 100);
            }
        } catch (error) {
            console.error('Error handling message confirmation:', error);
            this.error = 'حدث خطأ أثناء معالجة التأكيد. يرجى إعادة المحاولة.';
        } finally {
            this.getProgressPercentage();
        }
    }

    // Add these helper methods
    calculateTotalTime(): number {
        if (!this.courseStructure?.sections) return 0;

        let totalMinutes = 0;
        this.courseStructure.sections.forEach((section) => {
            section.lectures.forEach((lecture) => {
                totalMinutes += lecture.minutes || 0;
            });
        });

        return Math.round(totalMinutes / 60); // Convert to hours
    }

    goToCourseList(): void {
        // Navigate to course list
        this.router.navigate(['/courses']);
    }

    restartCourse(): void {
        // Reset course progress and restart
        this.showCourseCompletion = false;
        // Add logic to reset course progress if needed
        this.navigateToContent(this.allContents[0]?.id);
    }
    private async loadContent(contentId: number): Promise<void> {
        this.loading.navigation = true;

        try {
            const content = await firstValueFrom(
                this.contentService.getCurrentContent(contentId).pipe(
                    catchError((err) => {
                        console.error('Error loading content:', err);
                        return of(undefined);
                    })
                )
            );

            if (content) {
                this.contentId = contentId;
                this.processContentData(content);
                this.expandSectionForContent(contentId);

                // Reset chat states
                this.messages = null;
                this.aiMessages = [];
                this.hasLoadedInstructorChat = false;
                this.hasLoadedAiChat = false;

                // Reconnect SignalR for the new content
                await this.disconnectSignalR();
                await this.connectToSignalR();
            }
        } catch (error) {
            console.error('Error loading content:', error);
            this.error = 'حدث خطأ في تحميل المحتوى. يرجى إعادة المحاولة.';
        } finally {
            this.loading.navigation = false;
        }
    }

    ngAfterViewInit(): void {
        if (this.chatMode === 'instructor' && this.isChatOpen) {
            this.scrollToBottom();
        } else if (this.chatMode === 'ai' && this.isChatOpen) {
            this.scrollAiToBottom();
        }
    }

    ngOnDestroy(): void {
        this.disconnectSignalR();
        this.destroy$.next();
        this.destroy$.complete();
    }
    private getContentObservable(): Observable<ContentDetails | undefined> {
        debugger;
        // passed => just course structure
        //!passed => course structure + content

        if (this.passed) {
            this.showCourseCompletion = true;
            return of(undefined);
        } else {
            if (!this.contentId) {
                return this.contentService.getFirstContent(this.programId);
            } else {
                return this.contentService.getCurrentContent(this.contentId);
            }
        }
    }

    async loadInitialData(): Promise<void> {
        this.isInitialLoading = true;
        this.error = null;

        try {
            const result = await firstValueFrom(
                forkJoin({
                    courseStructure: this.contentService
                        .getCourseStructure(this.programId)
                        .pipe(
                            retry(2), // Retry up to 2 times on failure
                            catchError((err) => {
                                console.error(
                                    'Error loading course structure after retries:',
                                    err
                                );
                                return of(undefined);
                            })
                        ),
                    content: this.getContentObservable().pipe(
                        retry(2), // Retry up to 2 times on failure
                        catchError((err) => {
                            console.error(
                                'Error loading content after retries:',
                                err
                            );
                            return of(undefined);
                        })
                    ),
                })
            );

            // Process results
            if (result.courseStructure) {
                this.courseStructure = result.courseStructure;
                this.flattenCourseContents();
            }
            debugger;

            if (this.showCourseCompletion) {
                return;
            }
            // If content failed to load but course structure succeeded, try to get first content
            if (
                !result.content &&
                result.courseStructure &&
                result.courseStructure.sections.length > 0
            ) {
                const firstContent = await this.loadFirstContentFromStructure(
                    result.courseStructure
                );
                this.processContentData(firstContent);
            } else {
                this.processContentData(result.content);
            }

            if (result.content) {
                this.contentId = result.content.id;
                this.expandSectionForContent(this.contentId);
            }

        } catch (err) {
            console.error('Critical error loading data:', err);
            this.error = 'حدث خطأ في تحميل المحتوى. يرجى إعادة المحاولة.';
        } finally {
            this.isInitialLoading = false;
        }
    }

    private async loadFirstContentFromStructure(
        courseStructure: CourseStructureResponse
    ): Promise<ContentDetails | undefined> {
        try {
            // Try to get the first content from the first section
            const firstSection = courseStructure.sections[0];
            if (firstSection && firstSection.lectures.length > 0) {
                const firstContentId = firstSection.lectures[0].id;
                return await firstValueFrom(
                    this.contentService.getCurrentContent(firstContentId).pipe(
                        catchError((err) => {
                            console.error(
                                'Error loading first content from structure:',
                                err
                            );
                            return of(undefined);
                        })
                    )
                );
            }
        } catch (err) {
            console.error('Error in loadFirstContentFromStructure:', err);
        }
        return undefined;
    }

    private flattenCourseContents(): void {
        this.allContents = [];
        if (this.courseStructure?.sections) {
            this.courseStructure.sections.forEach((section) => {
                this.allContents.push(...section.lectures);
            });
        }

        console.log(this.allContents);
    }

    private expandSectionForContent(contentId: number): void {
        if (this.courseStructure?.sections) {
            this.courseStructure.sections.forEach((section) => {
                const hasContent = section.lectures.some(
                    (lecture) => lecture.id === contentId
                );
                if (hasContent) {
                    section.isExpanded = true;
                }
            });
        }
    }

    // Progress calculation methods
    getProgressPercentage(): number {
        if (!this.courseStructure) return 0;

        const total = this.getTotalLecturesCount();
        const completed = this.getCompletedLecturesCount();

        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    getTotalLecturesCount(): number {
        return this.allContents.length;
    }

    getCompletedLecturesCount(): number {
        if (!this.courseStructure?.sections) return 0;

        return this.courseStructure.sections.reduce((total, section) => {
            return (
                total +
                section.lectures.filter((lecture) => lecture.isPassed).length
            );
        }, 0);
    }

    getSectionCompletedCount(section: CourseSection): number {
        return section.lectures.filter((lecture) => lecture.isPassed).length;
    }

    // Section management
    toggleSection(sectionId: number): void {
        if (!this.courseStructure?.sections) return;

        const section = this.courseStructure.sections.find(
            (s) => s.id === sectionId
        );
        if (section) {
            section.isExpanded = !section.isExpanded;
        }
    }

    // Lecture access and status methods
    canAccessLecture(lecture: CourseLecture): boolean {
        // Current lecture is always accessible
        if (lecture.id === this.contentId) {
            return true;
        }

        // If lecture is already passed, it's accessible
        if (lecture.isPassed) {
            return true;
        }

        // Check if it's the next available lecture in sequence
        if (this.allContents.length === 0) {
            return false;
        }

        const lectureIndex = this.allContents.findIndex(
            (content) => content.id === lecture.id
        );
        if (lectureIndex === 0) {
            return true; // First lecture is always accessible
        }

        // Check if previous lecture is completed
        if (lectureIndex > 0) {
            const previousLecture = this.allContents[lectureIndex - 1];
            return previousLecture.isPassed;
        }

        return false;
    }

    getLectureStatusIcon(lecture: CourseLecture): string {
        if (lecture.isPassed) {
            return 'bx-check-circle';
        }

        if (!this.canAccessLecture(lecture)) {
            return 'bx-lock-alt';
        }

        if (lecture.id === this.contentId) {
            return 'bx-play-circle';
        }

        return 'bx-circle';
    }

    onLectureClick(lecture: CourseLecture): void {
        // Don't navigate if lecture is locked
        if (!this.canAccessLecture(lecture)) {
            return;
        }

        // Don't navigate if it's the current lecture
        if (lecture.id === this.contentId) {
            return;
        }

        // Expand the section containing this lecture
        this.expandSectionForContent(lecture.id);

        // Navigate to the lecture
        this.navigateToContent(lecture.id);
    }


    private processContentData(content: ContentDetails | undefined): void {
        this.currentLecture = content || null;

        if (this.currentLecture?.contentUrl) {
            this.safeContentHtml = this.sanitizer.bypassSecurityTrustHtml(
                this.currentLecture.contentUrl
            );
        }

        this.passedStudent = this.currentLecture?.isPassed || false;
        this.setAlertMessage();
    }

    // Navigation Methods - Updated to use IDs
    navigateToNext(): void {
        const nextContentId = this.getNextContentId();
        if (nextContentId && this.canNavigateToContent(nextContentId)) {
            this.navigateToContent(nextContentId);
        }
    }

    navigateToPrevious(): void {
        const prevContentId = this.getPreviousContentId();
        if (prevContentId && this.canNavigateToContent(prevContentId)) {
            this.navigateToContent(prevContentId);
        }
    }

    private async navigateToContent(contentId: number): Promise<void> {
        // Set loading state
        this.loading.navigation = true;
        this.error = null;

        // Optional: Add loading class to main container
        document.querySelector('.main-container')?.classList.add('loading');

        try {
            // Load the specific content
            const content = await firstValueFrom(
                this.contentService.getCurrentContent(contentId).pipe(
                    catchError((err) => {
                        console.error(
                            'Error loading content during navigation:',
                            err
                        );
                        return of(undefined);
                    })
                )
            );

            if (content) {
                this.contentId = content.id;
                // this.currentLecture = content;
                this.processContentData(content);

                // Expand section containing the new content
                this.expandSectionForContent(this.contentId);

                // Reset chat states
                this.messages = null;
                this.aiMessages = [];
                this.hasLoadedInstructorChat = false;
                this.hasLoadedAiChat = false;

                await this.disconnectSignalR();
                await this.connectToSignalR();

               
            } else {
                this.error = 'فشل في تحميل المحتوى المطلوب.';
            }
        } catch (error) {
            console.error('Navigation error:', error);
            this.error = 'حدث خطأ أثناء التنقل. يرجى المحاولة مرة أخرى.';
        } finally {
            this.loading.navigation = false;
            // Remove loading class from main container
            document
                .querySelector('.main-container')
                ?.classList.remove('loading');
        }
    }

    // Updated helper methods to work with IDs
    private getNextContentId(): number | null {
        if (this.allContents.length === 0) return null;

        const currentIndex = this.allContents.findIndex(
            (content) => content.id === this.contentId
        );
        if (currentIndex >= 0 && currentIndex < this.allContents.length - 1) {
            return this.allContents[currentIndex + 1].id;
        }
        return null;
    }

    private getPreviousContentId(): number | null {
        if (this.allContents.length === 0) return null;

        const currentIndex = this.allContents.findIndex(
            (content) => content.id === this.contentId
        );
        if (currentIndex > 0) {
            return this.allContents[currentIndex - 1].id;
        }
        return null;
    }

    private canNavigateToContent(contentId: number): boolean {
        const content = this.allContents.find((c) => c.id === contentId);
        return content
            ? content.status == ContentStatus.Finished ||
                  content.status == ContentStatus.Progressing
            : false;
    }

    canNavigateNext(): boolean {
        const nextContentId = this.getNextContentId();
        return (
            nextContentId !== null && this.canNavigateToContent(nextContentId)
        );
    }

    canNavigatePrevious(): boolean {
        const prevContentId = this.getPreviousContentId();
        return (
            prevContentId !== null && this.canNavigateToContent(prevContentId)
        );
    }

    // Content Type Badge Methods
    getContentTypeBadge(type: ContentType): string {
        switch (type) {
            case ContentType.Vimeo:
                return 'Vimeo';
            case ContentType.YouTube:
                return 'YouTube';
            case ContentType.File:
                return 'ملف';
            case ContentType.Website:
                return 'موقع ويب';
            case ContentType.Loom:
                return 'Loom';
            case ContentType.Image:
                return 'صورة';
            case ContentType.Text:
                return 'نص';
            default:
                return 'غير محدد';
        }
    }

    getContentTypeBadgeClass(type: ContentType): string {
        switch (type) {
            case ContentType.Vimeo:
                return 'badge-vimeo';
            case ContentType.YouTube:
                return 'badge-youtube';
            case ContentType.File:
                return 'badge-file';
            case ContentType.Website:
                return 'badge-website';
            case ContentType.Loom:
                return 'badge-loom';
            case ContentType.Image:
                return 'badge-image';
            case ContentType.Text:
                return 'badge-text';
            default:
                return 'badge-default';
        }
    }

    // Chat Methods
    toggleChat(): void {
        this.isChatOpen = !this.isChatOpen;

        if (this.isChatOpen) {
            // Load chat data only when opening chat for the first time
            if (
                this.chatMode === 'instructor' &&
                !this.hasLoadedInstructorChat
            ) {
                this.loadInstructorChatMessages();
            } else if (this.chatMode === 'ai' && !this.hasLoadedAiChat) {
                this.loadAIChat();
            }

            // Add delay to ensure DOM is ready
            setTimeout(() => {
                if (this.chatMode === 'instructor') {
                    this.scrollToBottom();
                } else {
                    this.scrollAiToBottom();
                }
            }, 100);
        }
    }

    switchChatMode(mode: 'instructor' | 'ai'): void {
        this.chatMode = mode;

        // Load chat data only if not loaded before
        if (mode === 'ai' && !this.hasLoadedAiChat) {
            this.loadAIChat();
        } else if (mode === 'instructor' && !this.hasLoadedInstructorChat) {
            this.loadInstructorChatMessages();
        }

        setTimeout(() => {
            if (mode === 'ai') {
                this.scrollAiToBottom();
            } else {
                this.scrollToBottom();
            }
        }, 100);
    }

    sendMessage(): void {
        const trimmed = this.newMessage.trim();
        if (!trimmed || this.loading.sendingMessage) return;

        this.loading.sendingMessage = true;
        const originalMessage = this.newMessage;
        this.newMessage = '';

        if (
            this.isSignalRConnected &&
            this.currentLecture?.userContentRegistrationId
        ) {
            try {
                this.chatService.sendMessage(
                    this.currentLecture.userContentRegistrationId,
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
            registrationId: this.currentLecture?.userContentRegistrationId!,
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
                        this.navigateToContent(response.nextContentId);
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

    sendAiMessage(): void {
        const trimmed = this.prompt.trim();
        if (!trimmed || this.loading.sendingAiMessage) return;

        const userMessage: ContentAIChatMessage = {
            messageText: trimmed,
            role: AIChatRole.User,
            sentAt: new Date(),
        };

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
                    if (response) {
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
                    this.aiMessages = this.aiMessages.filter(
                        (msg) => msg !== userMessage
                    );
                    alert(
                        'فشل في إرسال الرسالة للمساعد الذكي. يرجى المحاولة مرة أخرى.'
                    );
                },
            });
    }

    // SignalR Methods
    private async connectToSignalR(): Promise<void> {
        if (!this.currentLecture?.userContentRegistrationId) return;

        await this.chatService.startConnection(
            this.currentLecture.userContentRegistrationId
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

    // Chat loading methods
    private loadInstructorChatMessages(): void {
        if (this.hasLoadedInstructorChat || this.loading.chat) return;

        this.loading.chat = true;
        this.getChat()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loading.chat = false))
            )
            .subscribe({
                next: (chat) => {
                    this.messages = chat || [];
                    this.hasLoadedInstructorChat = true;
                    setTimeout(() => this.scrollToBottom(), 100);
                },
                error: (err) => {
                    console.error('Error loading instructor chat:', err);
                    this.messages = [];
                    this.hasLoadedInstructorChat = true;
                },
            });
    }

    loadAIChat(): void {
        if (this.hasLoadedAiChat || this.loading.aiChat) return;

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
                    this.hasLoadedAiChat = true;
                    setTimeout(() => this.scrollAiToBottom(), 100);
                },
                error: (err) => {
                    console.error('Error loading AI chat:', err);
                    this.aiMessages = [];
                    this.hasLoadedAiChat = true;
                },
            });
    }

    // Student pass method
    async passStudent(): Promise<void> {
        this.loading.navigation = true;

        try {
            await firstValueFrom(
                this.contentService.passStudent(
                    this.contentId,
                    this.currentUserId
                )
            );

            this.passedStudent = true;

            // Update the current content status in the flattened array
            const content = this.allContents.find(
                (c) => c.id === this.contentId
            );
            if (content) {
                content.status = ContentStatus.Finished;
                content.isPassed = true; // Keep for backward compatibility if needed
            }

            await this.disconnectSignalR();
            await this.connectToSignalR();
        } catch (error) {
            console.error('Error passing student:', error);
            alert('حدث خطأ أثناء تحديث حالة الطالب. يرجى المحاولة مرة أخرى.');
        } finally {
            this.loading.navigation = false;
        }
    }

    // Scroll Methods
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

    // Helper Methods
    setAlertMessage(): void {
        if (!this.currentLecture) return;

        switch (this.currentLecture.contentPassingRequirement) {
            case ContentPassingRequirement.Comment:
                this.alertMessage = 'اضف تعليق للنجاح فى هذا المحتوى';
                break;
            case ContentPassingRequirement.Exam:
                this.alertMessage = 'قم بحل الاسئله للنجاح فى هذا المحتوى';
                break;
            case ContentPassingRequirement.Manually:
                this.alertMessage = 'سيقوم المدرب بتحديد نجاحك فى هذا المحتوى';
                break;
            case ContentPassingRequirement.AiExam:
                this.alertMessage =
                    'قم بحل الاسئله التى يقدمها الذكاء الاصطناعى للنجاح فى هذا المحتوى';
                break;
        }
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

    // Mobile Methods
    toggleMobileSidebar(): void {
        this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    }

    // API Methods
    private getChat() {
        return this.contentService.getContentChat(
            this.contentId,
            this.currentUserId,
            this.programId
        );
    }

    // Exam Methods
    takeExam(): void {
        if (
            this.currentLecture?.contentPassingRequirement ===
            ContentPassingRequirement.Exam
        ) {
            this.router.navigate([
                '/exam',
                this.currentLecture.id,
                this.programId,
            ]);
        } else if (
            this.currentLecture?.contentPassingRequirement ===
            ContentPassingRequirement.AiExam
        ) {
            this.router.navigate([
                '/ai-exam',
                this.currentLecture.id,
                this.programId,
            ]);
        }
    }

    // course completion

    etTotalCourseDuration(): number {
        if (!this.courseStructure?.sections) return 0;

        let totalMinutes = 0;
        this.courseStructure.sections.forEach((section) => {
            section.lectures.forEach((lecture) => {
                totalMinutes += lecture.minutes || 0;
            });
        });

        return totalMinutes;
    }

    /**
     * Navigate to course overview page
     */
    goToCourseOverview(): void {
        // Implement navigation to course overview
        // Example: this.router.navigate(['/courses', this.courseId]);
        console.log('Navigating to course overview...');
    }

    /**
     * Navigate to next course if available
     */
    goToNextCourse(): void {
        // Implement navigation to next course
        // Example: this.router.navigate(['/courses', this.nextCourseId]);
        console.log('Navigating to next course...');
    }

    /**
     * Share achievement on social media or copy link
     */
    shareAchievement(): void {
        // Implement share functionality
        const shareText = `🎉 لقد أكملت دورة "${this.courseStructure?.title}" بنجاح!`;

        if (navigator.share) {
            navigator
                .share({
                    title: 'إكمال الدورة',
                    text: shareText,
                    url: window.location.href,
                })
                .catch((err) => {
                    console.log('Error sharing:', err);
                    this.copyToClipboard(shareText);
                });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    /**
     * Copy text to clipboard
     */
    private copyToClipboard(text: string): void {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                // Show success message
                console.log('تم نسخ النص بنجاح');
                // You can show a toast notification here
            })
            .catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            });
    }

    /**
     * Set course completion state
     * Call this method when the user completes all lectures
     */
    setCourseCompletion(completed: boolean): void {
        this.showCourseCompletion = completed;

        if (completed) {
            // Close chat if open
            this.isChatOpen = false;

            // You can add analytics tracking here
            // this.trackCourseCompletion();
        }
    }

    /**
     * Track course completion for analytics
     */
    // private trackCourseCompletion(): void {
    //     // Implement your analytics tracking
    //     console.log('Course completed:', {
    //         courseId: this.courseStructure?.id,
    //         courseTitle: this.courseStructure?.title,
    //         completionTime: new Date(),
    //         totalLectures: this.getTotalLecturesCount(),
    //         totalDuration: this.getTotalCourseDuration(),
    //     });
    // }

    /**
     * Check if course is completed
     * You should call this method whenever lecture progress changes
     */
    checkCourseCompletion(): void {
        if (!this.courseStructure?.sections) return;

        const allLecturesCompleted = this.courseStructure.sections.every(
            (section) => section.lectures.every((lecture) => lecture.isPassed)
        );

        if (allLecturesCompleted && !this.showCourseCompletion) {
            // Add a small delay for better UX
            setTimeout(() => {
                this.setCourseCompletion(true);
            }, 1000);
        }
    }

    getTotalCourseDuration(): number {
        if (!this.courseStructure?.sections) return 0;

        let totalMinutes = 0;
        this.courseStructure.sections.forEach((section) => {
            section.lectures.forEach((lecture) => {
                totalMinutes += lecture.minutes || 0;
            });
        });

        return totalMinutes;
    }
}
