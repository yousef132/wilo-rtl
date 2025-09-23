// import {
//     Component,
//     OnInit,
//     OnDestroy,
//     ViewChild,
//     ElementRef,
//     AfterViewInit,
// } from '@angular/core';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { CommonModule, NgFor } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
// import { Subject, forkJoin, of } from 'rxjs';
// import { takeUntil, finalize, catchError } from 'rxjs/operators';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// import { ContentService } from '../../services/content.service';
// import { AuthService } from '../../services/authr/auth.service';
// import { SharedService } from '../../shared/shared.service';
// import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
// import { SectionService } from '../../services/section.service';
// import {
//     AIChatRole,
//     ContentAIChatMessage,
//     ContentDetails,
//     CourseLecture,
//     CourseSection,
//     CourseStructureResponse,
//     LoadingState,
//     Message,
//     PassResponse,
//     SendAIMessage,
//     SendMessage,
// } from '../../models/content/content';
// import {
//     ContentPassingRequirement,
//     ContentStatus,
//     ContentType,
//     Section,
//     SectionContent,
// } from '../../models/program/programs';
// import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
// import { CoursesComponent } from '../../common/courses/courses.component';

// @Component({
//     selector: 'app-program-player',
//     imports: [
//         CommonModule,
//         FormsModule,
//         NgxSpinnerModule,
//         NgFor,
//         RouterLink,
//     ],
//     templateUrl: './program-player.component.html',
//     styleUrl: './program-player.component.scss',
// })
// export class ProgramPlayerComponent
//     implements OnInit, AfterViewInit, OnDestroy
// {
//     // Data properties
//     courseStructure: CourseStructureResponse | null = null;
//     sections: CourseSection[] = [];
//     currentContent: ContentDetails | null = null;
//     messages: Message[] = [];
//     aiMessages: ContentAIChatMessage[] = [];

//     // State properties
//     programId!: number;
//     currentUserId!: string;
//     currentContentId: number | null = null;
//     activeChatTab: 'instructor' | 'ai' = 'instructor';

//     // Input properties
//     newMessage: string = '';
//     aiPrompt: string = '';

//     // UI state
//     loading: LoadingState = {
//         courseStructure: false,
//         content: false,
//         chat: false,
//         aiChat: false,
//         sendingMessage: false,
//         sendingAiMessage: false,
//         passingStudent: false,
//         navigation: false,
//     };

//     error: string | null = null;
//     safeContentHtml: SafeHtml | null = null;
//     aiIsThinking: boolean = false;

//     // ViewChild references
//     @ViewChild('messagesContainer') messagesContainer!: ElementRef;
//     @ViewChild('aiMessagesContainer') aiMessagesContainer!: ElementRef;

//     // Enums for template
//     ContentType = ContentType;
//     ContentPassingRequirement = ContentPassingRequirement;
//     AIChatRole = AIChatRole;
//     Status = ContentStatus;

//     private destroy$ = new Subject<void>();

//     constructor(
//         private route: ActivatedRoute,
//         private router: Router,
//         private contentService: ContentService,
//         private authService: AuthService,
//         private sharedService: SharedService,
//         private sanitizer: DomSanitizer,
//         private spinner: NgxSpinnerService
//     ) {
//          ;
//         this.authService.currentUser
//             .pipe(takeUntil(this.destroy$))
//             .subscribe((user) => {
//                 this.currentUserId = user?.id || '';
//             });
//     }

//     ngOnInit(): void {
//         this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
//             this.programId = +params['programId'];
//             this.loadInitialData();
//         });
//     }

//     ngAfterViewInit(): void {
//         this.scrollToBottom();
//     }

//     ngOnDestroy(): void {
//         this.destroy$.next();
//         this.destroy$.complete();
//     }

//     loadInitialData(): void {
//         this.loading.courseStructure = true;
//         this.error = null;

//         this.contentService
//             .getCourseStructure(this.programId)
//             .pipe(
//                 takeUntil(this.destroy$),
//                 finalize(() => (this.loading.courseStructure = false))
//             )
//             .subscribe({
//                 next: (
//                     courseStructure: CourseStructureResponse | undefined
//                 ) => {
//                      ;
//                     console.log(courseStructure);
//                     if (courseStructure) {
//                         this.courseStructure = courseStructure;
//                         this.sections = this.processSections(
//                             courseStructure?.sections || []
//                         );
//                     }

//                     // Load first available content if none selected
//                     if (!this.currentContentId) {
//                         const firstContent = this.getFirstAvailableContent();
//                         if (firstContent) {
//                             this.selectContent(firstContent);
//                         }
//                     } else {
//                         // Load current content
//                         this.loadContentDetails(this.currentContentId);
//                     }
//                 },
//                 error: (error) => {
//                     console.error('Error loading course structure:', error);
//                     this.error =
//                         'حدث خطأ في تحميل أقسام الدورة. يرجى إعادة المحاولة.';
//                 },
//             });
//     }

//     private processSections(sections: CourseSection[]): CourseSection[] {
//         return sections.map((section, sectionIndex) => ({
//             ...section,
//             isExpanded: sectionIndex === 0, // Expand first section by default
//             lectures: section.lectures.map((lecture) => ({
//                 ...lecture,
//                 // Note: We'll track these states separately since they're not in the CourseLecture interface
//             })),
//         }));
//     }

//     // Helper methods to get lecture states
//     public isLectureActive(lectureId: number): boolean {
//         return lectureId === this.currentContentId;
//     }

//     public isLectureCompleted(lecture: CourseLecture): boolean {
//         return lecture.status == ContentStatus.IsFinished;
//     }

//     public isLectureLocked(
//         lecture: CourseLecture,
//     ): boolean {
//     return  lecture.status == ContentStatus.IsLocked
//     }

//     private getFirstAvailableContent(): CourseLecture | null {
//         for (const section of this.sections) {
//             for (const lecture of section.lectures) {
//                 if (!this.isLectureLocked(lecture)) {
//                     return lecture;
//                 }
//             }
//         }
//         return null;
//     }

//     selectContent(lecture: CourseLecture): void {
//         if (this.isLectureLocked(lecture)) {
//             return;
//         }

//         this.currentContentId = lecture.id;
//         this.loadContentDetails(lecture.id);

//         // Update URL
//         this.router.navigate(
//             ['/program-player', this.programId],
//             {
//                 replaceUrl: true,
//             }
//         );
//     }

//     loadContentDetails(contentId: number): void {
//         this.loading.content = true;
//         this.currentContent = null;
//         this.error = null;

//         const contentData$ = forkJoin({
//             content: this.contentService
//                 .getContent(contentId, this.currentUserId)
//                 .pipe(
//                     catchError((err) => {
//                         console.error('Error loading content:', err);
//                         return of(undefined);
//                     })
//                 ),
//             chat: this.contentService
//                 .getContentChat(contentId, this.currentUserId, this.programId)
//                 .pipe(
//                     catchError((err) => {
//                         console.error('Error loading chat:', err);
//                         return of([]);
//                     })
//                 ),
//         });

//         contentData$
//             .pipe(
//                 takeUntil(this.destroy$),
//                 finalize(() => (this.loading.content = false))
//             )
//             .subscribe({
//                 next: ({ content, chat }) => {
//                     if (content) {
//                         this.currentContent = content;
//                         this.processSafeContent(content);
//                     }
//                     this.messages = chat || [];
//                     this.aiMessages = []; // Reset AI messages
//                     this.activeChatTab = 'instructor'; // Reset to instructor tab

//                     setTimeout(() => this.scrollToBottom(), 100);
//                 },
//                 error: (error) => {
//                     console.error('Error loading content details:', error);
//                     this.error = 'حدث خطأ في تحميل تفاصيل المحتوى.';
//                 },
//             });
//     }

//     private processSafeContent(content: ContentDetails): void {
//         if (content.contentUrl && this.isVideoContent(content.contentType)) {
//             this.safeContentHtml = this.sanitizer.bypassSecurityTrustHtml(
//                 content.contentUrl
//             );
//         } else {
//             this.safeContentHtml = null;
//         }
//     }

//     private isVideoContent(contentType: ContentType): boolean {
//         return [
//             ContentType.YouTube,
//             ContentType.Vimeo,
//             ContentType.Loom,
//         ].includes(contentType);
//     }

//     toggleSection(section: CourseSection): void {
//         section.isExpanded = !section.isExpanded;
//     }

//     switchChatTab(tab: 'instructor' | 'ai'): void {
//         this.activeChatTab = tab;

//         if (
//             tab === 'ai' &&
//             this.aiMessages.length === 0 &&
//             !this.loading.aiChat &&
//             this.currentContentId
//         ) {
//             this.loadAIChat();
//         }

//         setTimeout(() => {
//             if (tab === 'ai') {
//                 this.scrollAiToBottom();
//             } else {
//                 this.scrollToBottom();
//             }
//         }, 100);
//     }

//     loadAIChat(): void {
//         if (!this.currentContentId || this.loading.aiChat) return;

//         this.loading.aiChat = true;
//         this.contentService
//             .getAiChat(this.currentContentId)
//             .pipe(
//                 takeUntil(this.destroy$),
//                 finalize(() => (this.loading.aiChat = false))
//             )
//             .subscribe({
//                 next: (aiMessages) => {
//                     this.aiMessages = aiMessages || [];
//                     setTimeout(() => this.scrollAiToBottom(), 100);
//                 },
//                 error: (err) => {
//                     console.error('Error loading AI chat:', err);
//                     this.aiMessages = [];
//                 },
//             });
//     }

//     trackBySectionId(index: number, section: CourseSection): number {
//         return section.id;
//     }

//     trackByLectureId(index: number, lecture: CourseLecture): number {
//         return lecture.id;
//     }

//     sendMessage(): void {
//         const trimmed = this.newMessage.trim();
//         if (!trimmed || this.loading.sendingMessage || !this.currentContent)
//             return;

//         const sendMessage: SendMessage = {
//             contentId: this.currentContent.id,
//             comment: trimmed,
//             registrationId: this.currentContent.userContentRegistrationId,
//         };

//         // Optimistic update
//         const optimisticMessage: Message = {
//             textMessage: trimmed,
//             userId: this.currentUserId,
//             userName: '',
//             messageDate: new Date(),
//         };

//         this.messages.push(optimisticMessage);
//         const originalMessage = this.newMessage;
//         this.newMessage = '';
//         this.scrollToBottom();

//         this.loading.sendingMessage = true;

//         this.contentService
//             .sendMessage(sendMessage)
//             .pipe(
//                 takeUntil(this.destroy$),
//                 finalize(() => (this.loading.sendingMessage = false))
//             )
//             .subscribe({
//                 next: (response: PassResponse | undefined) => {
//                     // Handle navigation if needed
//                     if (response?.nextContentId) {
//                         if (response.nextContentId === -1) {
//                             this.router.navigate(['/program-completed']);
//                             return;
//                         }
//                         // Find and select the next content
//                         const nextLecture = this.findLectureById(
//                             response.nextContentId
//                         );
//                         if (nextLecture) {
//                             this.selectContent(nextLecture);
//                         }
//                     }
//                 },
//                 error: (error) => {
//                     console.error('Send message failed:', error);
//                     this.messages = this.messages.filter(
//                         (msg) => msg !== optimisticMessage
//                     );
//                     this.newMessage = originalMessage;
//                     alert('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
//                 },
//             });
//     }

//     sendAiMessage(): void {
//         const trimmed = this.aiPrompt.trim();
//         if (!trimmed || this.loading.sendingAiMessage || !this.currentContentId)
//             return;

//         const userMessage: ContentAIChatMessage = {
//             messageText: trimmed,
//             role: AIChatRole.User,
//             sentAt: new Date(),
//         };

//         this.aiMessages.push(userMessage);
//         this.aiPrompt = '';
//         this.scrollAiToBottom();

//         this.loading.sendingAiMessage = true;
//         this.aiIsThinking = true;

//         const sendMessage: SendAIMessage = {
//             contentId: this.currentContentId,
//             question: trimmed,
//         };

//         this.contentService
//             .sendAIMessage(sendMessage)
//             .pipe(
//                 takeUntil(this.destroy$),
//                 finalize(() => {
//                     this.loading.sendingAiMessage = false;
//                     this.aiIsThinking = false;
//                 })
//             )
//             .subscribe({
//                 next: (response) => {
//                     if (response) {
//                         const aiResponse: ContentAIChatMessage = {
//                             messageText: response,
//                             role: AIChatRole.Assistant,
//                             sentAt: new Date(),
//                         };
//                         this.aiMessages.push(aiResponse);
//                     }
//                     this.scrollAiToBottom();
//                 },
//                 error: (error) => {
//                     console.error('Send AI message failed:', error);
//                     this.aiMessages = this.aiMessages.filter(
//                         (msg) => msg !== userMessage
//                     );
//                     alert(
//                         'فشل في إرسال الرسالة للمساعد الذكي. يرجى المحاولة مرة أخرى.'
//                     );
//                 },
//             });
//     }

//     passStudent(): void {
//         if (!this.currentContent || this.loading.passingStudent) return;

//         this.loading.passingStudent = true;

//         this.contentService
//             .passStudent(this.currentContent.id, this.currentUserId)
//             .pipe(
//                 takeUntil(this.destroy$),
//                 finalize(() => (this.loading.passingStudent = false))
//             )
//             .subscribe({
//                 next: () => {
//                     if (this.currentContent) {
//                         this.currentContent.isPassed = true;
//                         this.currentContent.status = ContentStatus.Finished;
//                     }
//                     // Update section content status
//                     this.updateLectureStatus(
//                         this.currentContent!.id,
//                         ContentStatus.Finished
//                     );
//                 },
//                 error: (error) => {
//                     console.error('Error passing student:', error);
//                     alert(
//                         'حدث خطأ أثناء تحديث حالة الطالب. يرجى المحاولة مرة أخرى.'
//                     );
//                 },
//             });
//     }

//     private updateLectureStatus(lectureId: number, status: ContentStatus): void {
//         this.sections.forEach((section) => {
//             section.lectures.forEach((lecture) => {
//                 if (lecture.id === lectureId) {
//                     lecture.isPassed = status === ContentStatus.Finished;
//                 }
//             });
//         });
//     }

//     private findLectureById(lectureId: number): CourseLecture | null {
//         for (const section of this.sections) {
//             for (const lecture of section.lectures) {
//                 if (lecture.id === lectureId) {
//                     return lecture;
//                 }
//             }
//         }
//         return null;
//     }

//     // Utility methods
//     scrollToBottom(): void {
//         setTimeout(() => {
//             try {
//                 if (this.messagesContainer?.nativeElement) {
//                     this.messagesContainer.nativeElement.scrollTop =
//                         this.messagesContainer.nativeElement.scrollHeight;
//                 }
//             } catch (err) {
//                 console.error('Scroll error:', err);
//             }
//         }, 100);
//     }

//     scrollAiToBottom(): void {
//         setTimeout(() => {
//             try {
//                 if (this.aiMessagesContainer?.nativeElement) {
//                     this.aiMessagesContainer.nativeElement.scrollTop =
//                         this.aiMessagesContainer.nativeElement.scrollHeight;
//                 }
//             } catch (err) {
//                 console.error('AI Scroll error:', err);
//             }
//         }, 100);
//     }

//     getUserInitials(userName: string): string {
//         if (!userName) return '?';
//         const words = userName.trim().split(' ');
//         if (words.length === 1) {
//             return words[0].charAt(0).toUpperCase();
//         }
//         return (
//             words[0].charAt(0) + words[words.length - 1].charAt(0)
//         ).toUpperCase();
//     }

//     getContentTypeIcon(contentType: ContentType): string {
//         switch (contentType) {
//             case ContentType.YouTube:
//             case ContentType.Vimeo:
//             case ContentType.Loom:
//                 return 'bx-play-circle';
//             case ContentType.File:
//                 return 'bx-file';
//             case ContentType.Website:
//                 return 'bx-globe';
//             case ContentType.Image:
//                 return 'bx-image';
//             default:
//                 return 'bx-file-blank';
//         }
//     }

//     getContentStatusIcon(lecture: CourseLecture): string {
//         if (this.isLectureCompleted(lecture)) return 'bx-check-circle';
//         if (this.isLectureLocked(lecture)) return 'bx-lock-alt';
//         return 'bx-play-circle';
//     }

//     getAlertMessage(): string {
//         if (!this.currentContent) return '';

//         switch (this.currentContent.contentPassingRequirement) {
//             case ContentPassingRequirement.Comment:
//                 return 'اضف تعليق للنجاح فى هذا المحتوى';
//             case ContentPassingRequirement.Exam:
//                 return 'قم بحل الاسئله للنجاح فى هذا المحتوى';
//             case ContentPassingRequirement.Manually:
//                 return 'سيقوم المدرب بتحديد نجاحك فى هذا المحتوى';
//             default:
//                 return '';
//         }
//     }

//     getTotalDuration(): number {
//         return this.sections.reduce((total, section) => {
//             return (
//                 total +
//                 section.lectures.reduce((sectionTotal, lecture) => {
//                     return sectionTotal + lecture.minutes;
//                 }, 0)
//             );
//         }, 0);
//     }

//     getCompletedCount(): number {
//         return this.sections.reduce((total, section) => {
//             return (
//                 total +
//                 section.lectures.filter((lecture) => lecture.isPassed).length
//             );
//         }, 0);
//     }

//     getTotalContentCount(): number {
//         return this.sections.reduce((total, section) => {
//             return total + section.lectures.length;
//         }, 0);
//     }
// }
