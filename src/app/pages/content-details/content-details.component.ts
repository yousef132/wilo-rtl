import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import {
    ContentDetails,
    Message,
    NextContentResponse,
    SendMessage,
} from '../../models/content/content';

import {
    ContentPassingRequirement,
    ContentType,
} from '../../models/program/programs';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { forkJoin, Observable } from 'rxjs';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/authr/auth.service';
import { YoutubePlayerComponent } from '../../common/youtube-player/youtube-player.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SharedService } from '../../shared/shared.service';

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
export class ContentDetailsComponent implements OnInit, AfterViewInit {
    content: ContentDetails | null = null;
    contentId!: number;
    ContentType = ContentType;
    alertMessage = '';
    passedStudent: boolean = false;
    ContentPassingRequirement = ContentPassingRequirement;
    messages: Message[] | null = null;
    newMessage: string = '';
    userId: string = ''; // Replace this with actual logic
    safeContentHtml: SafeHtml | null = null;
    nextPreviewContent!: NextContentResponse[] | undefined;
    programId!: number;
    currentUserId: string = '';
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private contentService: ContentService,
        private spinner: NgxSpinnerService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private sharedService: SharedService,
        private authService: AuthService
    ) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUserId = user?.id!;
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.contentId = +params['contentId'];
            this.userId = params['userId'];
            this.programId = +params['programId'];

            this.loadContent();
        });
    }
    ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        setTimeout(() => {
            try {
                this.messagesContainer.nativeElement.scrollTop =
                    this.messagesContainer.nativeElement.scrollHeight;
            } catch (err) {
                console.error('Scroll error:', err);
            }
        }, 100); // small delay to wait for rendering
    }
    setAlertMessage() {
        // use swtich statement instead of if
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
    passStudent() {
        this.contentService.passStudent(this.contentId, this.userId).subscribe({
            next: (response) => {
                this.passedStudent = true;
                // relaod page
                document.location.reload();
            },
            error: (error) => {
                console.error('Error passing student:', error);
            },
        });
    }

    getPercentage(result: number, total: number): number {
        if (!total || total === 0) return 0;
        return (result / total) * 100;
    }

    loadContent() {
        
        forkJoin({
            content: this.getContent(),
            nextPrev: this.contentService.getNextPrevContent(
                this.contentId,
                this.programId
            ),
            chat: this.getChat(), // ✅ called in parallel, no dependency on content
        }).subscribe({
            next: ({ content, nextPrev, chat }) => {
        

                this.content = content || null;

                if (this.content?.contentUrl) {
                    this.safeContentHtml =
                        this.sanitizer.bypassSecurityTrustHtml(
                            this.content.contentUrl
                        );
                }

                this.passedStudent = this.content?.isPassed!;
                this.setAlertMessage();

                this.nextPreviewContent = nextPrev;
                this.messages = chat || null;
            },
            error: (err) => {
                console.error('Error loading data:', err);
            },
        });
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
        return this.contentService.getContent(this.contentId, this.userId);
    }

    getChat(): Observable<Message[] | undefined> {
        return this.contentService.getContentChat(
            this.contentId,
            this.userId,
            this.programId
        ); // registrationID
    }
    sendMessage() {
        const trimmed = this.newMessage.trim();
        if (!trimmed) return;
        const sendMessage: SendMessage = {
            contentId: this.contentId,
            comment: trimmed,
            registrationId: this.content?.userContentRegistrationId!,
        };

        this.contentService.sendMessage(sendMessage).subscribe({
            next: (nextContentId: number | null | undefined) => {
                // null => already registered in next content
                // -1 => last content, user passed the pargram
                // value => next content opened
                ;
                if (nextContentId) {
                    if (nextContentId == -1) {
                        this.router.navigate(['/program-completed']);
                        return;
                    }
                    //nextContentId = [1,2,3,...]
                    this.router.navigate([
                        '/content-details',
                        nextContentId,
                        this.userId,
                        this.programId,
                    ]);
                    return;
                }
                // insert the message
                this.messages?.push({
                    textMessage: this.newMessage,
                    userId: this.currentUserId,
                    userName: '',
                    messageDate: new Date(),
                });

                this.newMessage = '';
                // this.getChat().subscribe({
                //     next: (messages) => {
                //         this.messages = messages || null;
                //     },
                //     error: (err) => {
                //         console.error('Failed to refresh messages:', err);
                //     },
                // });
            },
            error: (error) => {
                console.error('Send message failed:', error);
            },
        });
    }
}
