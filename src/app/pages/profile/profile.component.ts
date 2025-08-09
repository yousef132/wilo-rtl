import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserCourses, UserProfile } from '../../models/auth/auth';
import { AuthService } from '../../services/authr/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { currentUser } from '../../constants/apiConstants';

@Component({
    selector: 'app-user-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    imports: [NgFor, DatePipe, NgIf, RouterLink],
})
export class ProfileComponent implements OnInit {
    user: UserProfile | null = null;
    courses: UserCourses[] = [];
    isLoading = true;
    isEditMode = false;
    activeTab: 'enrolled' | 'completed' = 'enrolled';
    routeUserId!: string;
    currentUserId?: string | null;

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.routeUserId = this.route.snapshot.params['userId'];
        this.authService.currentUser.subscribe((user) => {
            this.currentUserId = user?.id || null;
        });
    }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    loadUserProfile(): void {
        this.isLoading = true;

        forkJoin({
            courses: this.authService.getUserCourses(this.routeUserId),
            user: this.authService.getUserData(this.routeUserId),
        }).subscribe({
            next: ({ courses, user }) => {
                debugger;
                if (courses) this.courses = courses;
                if (user) this.user = user;
                this.isLoading = false; // finish loading after both finish
            },
            error: () => {
                this.isLoading = false; // stop loading even on error
            },
        });
    }

    get enrolledCourses(): UserCourses[] {
        return this.courses.filter((course) => course.status === 'enrolled');
    }

    get completedCourses(): UserCourses[] {
        return this.courses.filter((course) => course.status === 'completed');
    }

    toggleEditMode(): void {
        debugger;
        this.isEditMode = !this.isEditMode;
    }

    setActiveTab(tab: 'enrolled' | 'completed'): void {
        this.activeTab = tab;
    }

    continueCourse(courseId: string): void {
        // /:contentId/:userId/:programId
        this.router.navigate(['/program-details', courseId]);
    }

    downloadCertificate(certificateUrl: string): void {
        console.log('Download certificate:', certificateUrl);
        // Implement certificate download logic
    }

    onImageError(event: any): void {
        event.target.src = '/default-profile.png';
    }

    getProgressColor(progress: number): string {
        if (progress >= 80) return '#10b981';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    }
}
