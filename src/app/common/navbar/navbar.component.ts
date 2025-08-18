import { CommonModule, NgClass, NgIf } from '@angular/common';
import {
    AfterViewInit,
    Component,
    HostListener,
    input,
    Input,
    OnDestroy,
    OnInit,
    signal,
    WritableSignal,
} from '@angular/core';
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

@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        NgClass,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgIf
        // NgxSpinnerModule
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy  {
    currentUser: currentUser | null = null;
    searchText: string = '';
    isLoggedIn: boolean | null = null;
    isLoggingOut: boolean = false;

    notifications: Notification[] = [];
    showNotifications = false;
    unreadCount: WritableSignal<number> = signal(0);
    // Input that sets the signal
    @Input()
    set unreadCountInput(value: number) {
        this.unreadCount.set(value);
    }
    loadingNotifications = false;

    // Profile dropdown state
    showProfileDropdown = false;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationsService
    ) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUser = user || null;
        });

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            this.isLoggedIn = isLoggedIn;
            if (isLoggedIn !== null) {
                this.isLoggingOut = false;
            }
        });
    }


    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Profile dropdown methods
    toggleProfileDropdown(): void {
        this.showProfileDropdown = !this.showProfileDropdown;
        // Close notifications dropdown if open
        if (this.showProfileDropdown) {
            this.showNotifications = false;
        }
    }

    closeProfileDropdown(): void {
        this.showProfileDropdown = false;
    }

    // Notification methods
    toggleNotifications(): void {
        this.showNotifications = !this.showNotifications;
        // Close profile dropdown if open
        if (this.showNotifications) {
            this.showProfileDropdown = false;
        }

        if (this.showNotifications && this.unreadCount() !== 0) {
            this.loadNotifications();
            this.notifications = this.notifications.map((notification) => ({
                ...notification,
                isRead: true,
            }));
        }
    }

    closeNotifications(): void {
        this.showNotifications = false;
    }

    handleNotificationClick(notification: Notification): void {
        notification.isRead = true;
        this.closeNotifications();
    }

    loadNotifications(): void {
        this.loadingNotifications = true;
        this.notificationService.loadNotifications(1).subscribe({
            next: (notification: Notification[] | undefined) => {
                this.notifications.push(...(notification || []));
                this.loadingNotifications = false;
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
                this.loadingNotifications = false;
            },
        });
    }

    markAllAsRead(): void {
        this.notifications.forEach((notification) => {
            notification.isRead = true;
        });

        // API call to mark all as read
        // this.notificationService.markAllAsRead().subscribe({
        //     next: () => {
        //         // Handle success
        //     },
        //     error: (error) => {
        //         console.error('Error marking all notifications as read:', error);
        //     }
        // });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        const notificationWrapper = target.closest('.notification-wrapper');
        const profileWrapper = target.closest('.profile-dropdown-wrapper');

        // Close notifications dropdown if clicked outside
        if (!notificationWrapper && this.showNotifications) {
            this.closeNotifications();
        }

        // Close profile dropdown if clicked outside
        if (!profileWrapper && this.showProfileDropdown) {
            this.closeProfileDropdown();
        }
    }

    // Responsive Menu Trigger
    classApplied = false;
    toggleClass(): void {
        this.classApplied = !this.classApplied;
    }

    get isCoach(): boolean {
        return this.currentUser?.roles.includes('Coach') ?? false;
    }

    get isMentor(): boolean {
        return this.currentUser?.roles.includes('Mentor') ?? false;
    }

    get isAdmin(): boolean {
        return this.currentUser?.roles.includes('Admin') ?? false;
    }

    logout(): void {
        if (this.isLoggingOut) return;

        this.isLoggingOut = true;
        this.closeProfileDropdown(); // Close dropdown when logging out
        this.authService.logout();

        setTimeout(() => {
            this.isLoggingOut = false;
        }, 5000);
        this.notifications = [];
        // change unreadcount to 0
        this.unreadCount.set(0);
    }

    search(): void {
        this.router.navigate(['/programs'], {
            queryParams: { search: this.searchText },
        });
    }

    // Navbar Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll(): void {
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
