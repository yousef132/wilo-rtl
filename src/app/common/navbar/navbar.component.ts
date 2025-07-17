import { CommonModule, NgClass } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
    Router,
    RouterLink,
    RouterLinkActive,
    RouterModule,
} from '@angular/router';
import { AuthService } from '../../services/authr/auth.service';
import { currentUser } from '../../constants/apiConstants';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Notification } from '../../models/Notification/Notification';
import { NotificationsService } from '../../services/notifications.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        NgClass,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // NgxSpinnerModule
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
    currentUser: currentUser | null = null;
    searchText: string = '';
    isLoggedIn: boolean | null = null;

    notifications: Notification[] = [];
    showNotifications = false;
    unreadCount = 0;
    loadingNotifications = false;
    private destroy$ = new Subject<void>();
    constructor(
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationsService,
        // private spinnerService: NgxSpinnerService
    ) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUser = user || null;
        });

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            this.isLoggedIn = isLoggedIn;
        });
    }
    ngOnInit(): void {
        if (this.isLoggedIn) {
            this.loadUnreadCount();
        }
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    toggleNotifications(): void {
        this.showNotifications = !this.showNotifications;

        if (this.showNotifications && this.notifications.length === 0) {
            this.loadNotifications();
        }
    }

    closeNotifications(): void {
        this.showNotifications = false;
    }
    // Load notifications from API
    loadNotifications(): void {
        this.loadingNotifications = true;
        this.notificationService.loadNotifications(1).subscribe({
            next: (notification: Notification[] | undefined) => {
                this.notifications = notification || [];
                this.loadingNotifications = false;
            },
            error: (error) => {
                this.loadingNotifications = false;
            },
        });
    }

    // Load unread notifications count
    loadUnreadCount(): void {
        this.notificationService.loadNotificationsCount().subscribe({
            next: (count: number | undefined) => {
                this.unreadCount = count || 0;
            },
            error: (error) => {},
        });
    }

    // Mark single notification as read
    // markAsRead(notificationId: number): void {
    //     this.notificationService.markNotificationsAsRead().subscribe({
    //         next: (count: any) => {
    //             this.unreadCount = count || 0;
    //         },
    //         error: (error) => {},
    //     });
    // }

    // Mark all notifications as read
    markAllAsRead(): void {
        // this.http.post('/api/notifications/mark-all-read', {})
        //   .pipe(takeUntil(this.destroy$))
        //   .subscribe({
        //     next: () => {
        //       // Update local state
        //       this.notifications.forEach(notification => {
        //         notification.isRead = true;
        //       });
        //       this.unreadCount = 0;
        //     },
        //     error: (error) => {
        //       console.error('Error marking all notifications as read:', error);
        //     }
        //   });
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        const notificationWrapper = target.closest('.notification-wrapper');

        if (!notificationWrapper && this.showNotifications) {
            this.closeNotifications();
        }
    }
    // Responsive Menu Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    get isCoach(): boolean {
        return this.currentUser?.roles.includes('Coach') ?? false;
    }
    get isAdmin(): boolean {
        return this.currentUser?.roles.includes('Admin') ?? false;
    }

    logout() {
        this.authService.logout();
    }
    search() {
        this.router.navigate(['/programs'], {
            queryParams: { search: this.searchText },
        });
    }

    // Navbar Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Responsive Navbar Accordion
    openSectionIndex: number = -1;
    openSectionIndex2: number = -1;
    openSectionIndex3: number = -1;
    toggleSection(index: number): void {
        if (this.openSectionIndex === index) {
            this.openSectionIndex = -1;
        } else {
            this.openSectionIndex = index;
        }
    }
    toggleSection2(index: number): void {
        if (this.openSectionIndex2 === index) {
            this.openSectionIndex2 = -1;
        } else {
            this.openSectionIndex2 = index;
        }
    }
    toggleSection3(index: number): void {
        if (this.openSectionIndex3 === index) {
            this.openSectionIndex3 = -1;
        } else {
            this.openSectionIndex3 = index;
        }
    }
    isSectionOpen(index: number): boolean {
        return this.openSectionIndex === index;
    }
    isSectionOpen2(index: number): boolean {
        return this.openSectionIndex2 === index;
    }
    isSectionOpen3(index: number): boolean {
        return this.openSectionIndex3 === index;
    }
}
