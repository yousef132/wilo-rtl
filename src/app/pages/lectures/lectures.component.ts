import { Component, OnInit } from '@angular/core';
import { ContentPassingRequirement, ContentType } from '../../models/program/programs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { ContentDetails, CourseLecture, CourseSection, CourseStructureResponse, Message, SendMessage } from '../../models/content/content';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { InnerPageBannerComponent } from "../../common/inner-page-banner/inner-page-banner.component";


@Component({
  selector: 'app-lectures',
  imports: [CommonModule, NgxSpinnerModule, FormsModule, RouterLink, InnerPageBannerComponent],
  templateUrl: './lectures.component.html',
  styleUrl: './lectures.component.scss'
})
export class LecturesComponent implements OnInit {
// Current content data
  content: ContentDetails | null = null;
  currentContentId!: number;
  userId: string = '';
  
  // Course structure
  courseSections: CourseSection[] = [];
  courseTitle: string = '';
  courseProgress: number = 0;
  completedLectures: number = 0;
  totalLectures: number = 0;
  
  // Navigation
  hasPreviousLecture: boolean = false;
  hasNextLecture: boolean = false;
  
  // Chat functionality
  messages: Message[] | null = null;
  newMessage: string = '';
  chatExpanded: boolean = true;
  
  // UI state
  sidebarCollapsed: boolean = false;
  safeContentHtml: SafeHtml | null = null;
  alertMessage: string = '';
  
  // Enums for template
  ContentType = ContentType;
  ContentPassingRequirement = ContentPassingRequirement;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentContentId = +params['contentId'];
      this.userId = params['userId'];
      
      this.loadCourseStructure();
      this.loadContent();
    });
  }

  loadCourseStructure(): void {
    // Load course sections and lectures
    this.contentService.getCourseStructure(this.currentContentId).subscribe({
      next: (courseData ) => {
        this.courseSections = courseData.sections;
        this.courseTitle = courseData.title;
        this.calculateProgress();
        this.updateNavigationState();
      },
      error: (error) => {
        console.error('Error loading course structure:', error);
      }
    });
  }

  loadContent(): void {
    this.spinner.show();
    this.getContent().subscribe({
      next: (content) => {
        this.content = content || null;
        
        if (this.content?.contentUrl) {
          this.safeContentHtml = this.sanitizer.bypassSecurityTrustHtml(this.content.contentUrl);
        }
        
        this.setAlertMessage();
        this.loadChat();
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading content:', err);
        this.spinner.hide();
      }
    });
  }

  loadChat(): void {
    if (this.content?.userContentRegistrationId) {
      this.getChat().subscribe({
        next: (chat) => {
          this.messages = chat || null;
        },
        error: (err) => {
          console.error('Error loading chat:', err);
        }
      });
    }
  }

  calculateProgress(): void {
    this.totalLectures = this.courseSections.reduce((total, section) => total + section.lectures.length, 0);
    this.completedLectures = this.courseSections.reduce((total, section) => 
      total + section.lectures.filter(lecture => lecture.isPassed).length, 0
    );
    this.courseProgress = this.totalLectures > 0 ? (this.completedLectures / this.totalLectures) * 100 : 0;
  }

  updateNavigationState(): void {
    const allLectures = this.getAllLecturesInOrder();
    const currentIndex = allLectures.findIndex(lecture => lecture.id === this.currentContentId);
    
    this.hasPreviousLecture = currentIndex > 0;
    this.hasNextLecture = currentIndex < allLectures.length - 1;
  }

  getAllLecturesInOrder(): CourseLecture[] {
    return this.courseSections.reduce((lectures, section) => {
      return lectures.concat(section.lectures.sort((a, b) => a.order - b.order));
    }, [] as CourseLecture[]);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleSection(sectionId: number): void {
    const section = this.courseSections.find(s => s.id === sectionId);
    if (section) {
      section.isExpanded = !section.isExpanded;
    }
  }

  toggleChat(): void {
    this.chatExpanded = !this.chatExpanded;
  }

  navigateToLecture(lectureId: number): void {
    if (lectureId !== this.currentContentId) {
      this.router.navigate(['/course-lecture', lectureId, this.userId]);
    }
  }

  navigateToPrevious(): void {
    if (this.hasPreviousLecture) {
      const allLectures = this.getAllLecturesInOrder();
      const currentIndex = allLectures.findIndex(lecture => lecture.id === this.currentContentId);
      const previousLecture = allLectures[currentIndex - 1];
      this.navigateToLecture(previousLecture.id);
    }
  }

  navigateToNext(): void {
    if (this.hasNextLecture) {
      const allLectures = this.getAllLecturesInOrder();
      const currentIndex = allLectures.findIndex(lecture => lecture.id === this.currentContentId);
      const nextLecture = allLectures[currentIndex + 1];
      this.navigateToLecture(nextLecture.id);
    }
  }

  getLectureIcon(contentType: ContentType): string {
    switch (contentType) {
      case ContentType.Loom:
      case ContentType.Vimeo:
      case ContentType.YouTube:
        return 'bx-play-circle';
      case ContentType.File:
        return 'bx-file';
      case ContentType.Website:
        return 'bx-globe';
      case ContentType.Image:
        return 'bx-image';
      default:
        return 'bx-file';
    }
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

  getUserInitials(userName: string): string {
    if (!userName) return '?';
    const words = userName.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  passStudent(): void {
    this.contentService.passStudent(this.currentContentId, this.userId).subscribe({
      next: (response) => {
        this.loadContent(); // Refresh content to update status
      },
      error: (error) => {
        console.error('Error passing student:', error);
      }
    });
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    const sendMessage: SendMessage = {
      contentId: this.currentContentId,
      comment: trimmed,
      registrationId: this.content?.userContentRegistrationId!
    };

    this.contentService.sendMessage(sendMessage).subscribe({
      next: (nextContentId: number | null | undefined) => {
        if (nextContentId) {
          this.router.navigate(['/course-lecture', nextContentId, this.userId]);
          return;
        }
        this.newMessage = '';
        this.loadChat();
      },
      error: (error) => {
        console.error('Send message failed:', error);
      }
    });
  }

  // Service methods (these should be in your ContentService)
  getContent(): Observable<ContentDetails | undefined> {
    return this.contentService.getContent(this.currentContentId, this.userId);
  }

  getChat(): Observable<Message[] | undefined> {
    return this.contentService.getContentChat(this.content?.userContentRegistrationId!);
  }
}
