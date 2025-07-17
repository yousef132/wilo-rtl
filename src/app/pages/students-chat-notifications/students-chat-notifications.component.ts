import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ProgramsService } from '../../services/programs.service';
import { StudentNotificationResponse } from '../../models/program/programs';
import { InnerPageBannerComponent } from "../../common/inner-page-banner/inner-page-banner.component";
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-students-chat-notifications',
    imports: [InnerPageBannerComponent,NgFor,NgIf],
    templateUrl: './students-chat-notifications.component.html',
    styleUrl: './students-chat-notifications.component.scss',
})
export class StudentsChatNotificationsComponent {
    programId!: number;
    students: StudentNotificationResponse[] | null= null;
    loading = false;
    error: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private programService: ProgramsService
    ) {}

    ngOnInit(): void {
        // Get program ID from route parameters
        this.route.params.subscribe((params) => {
            this.programId = +params['id'];
            if (this.programId) {
                this.loadStudentNotifications();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Load student notifications from API
    loadStudentNotifications(): void {
        this.loading = true;
        this.error = null;
        this.programService.getStudentsNotifications(this.programId).subscribe({
            next: (response:StudentNotificationResponse[] |undefined) => {
              this.students = response || [];
              this.loading = false;
            },
            error: () => {
              this.loading = false;

            },
        });
    }

    // Navigate to chat with specific student and content
    openChat(studentId: string, contentId: number): void {
        this.router.navigate(['/content-details', contentId, studentId, this.programId]);
    }

    // Refresh notifications
    refreshNotifications(): void {
        this.loadStudentNotifications();
    }

    // Get total content count for a student
    getTotalContentCount(student: StudentNotificationResponse): number {
        return student.contents.length;
    }
}
