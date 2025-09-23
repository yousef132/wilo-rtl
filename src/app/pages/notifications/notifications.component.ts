import { Component } from '@angular/core';
import {
    Notification,
    NotificationType,
} from '../../models/Notification/Notification';
import { NotificationsService } from '../../services/notifications.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [NgClass, NgFor, NgIf, InnerPageBannerComponent],
    templateUrl: './notifications.component.html',
    styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
    notifications: Notification[] = [];
    loading = false;
    index: number = 1;

    constructor(
        private notificationService: NotificationsService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        this.loading = true;
        this.notificationService.loadNotifications(this.index, 30).subscribe({
            next: (response: Notification[] | undefined) => {
                 ;
                this.notifications = response || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
                this.loading = false;
            },
        });
    }

    trackByNotificationId(index: number, notification: Notification): string {
        return notification.id;
    }

    getNotificationClass(type: NotificationType): string {
        switch (type) {
            case NotificationType.PassedContentByCoach:
                return 'success';
            case NotificationType.Chat:
                return 'info';
            case NotificationType.RegisterInProgram:
                return 'warning';
            case NotificationType.CompletedTheProgram:
                return 'success';
            default:
                return 'info';
        }
    }

    getNotificationIcon(type: NotificationType): string {
        switch (type) {
            case NotificationType.PassedContentByCoach:
                return 'fas fa-user-check success';
            case NotificationType.Chat:
                return 'fas fa-comments info';
            case NotificationType.RegisterInProgram:
                return 'fas fa-user-plus warning';
            case NotificationType.CompletedTheProgram:
                return 'fas fa-trophy success';
            default:
                return 'fas fa-bell info';
        }
    }

    formatDate(date: Date | string): string {
        const parsedDate = date instanceof Date ? date : new Date(date);

        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return parsedDate.toLocaleDateString();
        }
    }
    onNotificationClick(notification: Notification) {
        // ✅ Optimistic update: mark as read in frontend immediately
        if (!notification.isRead) {
            notification.isRead = true;

            // ✅ Send request to server in background
            this.notificationService
                .markNotificationsAsRead(notification.id)
                .subscribe({
                    error: () => {
                        // ❌ If the request fails, revert back
                        notification.isRead = false;
                        console.error('Failed to mark notification as read');
                    },
                });
        }
        
        // ✅ Handle navigation
        if (notification.url) {
            if (notification.type === NotificationType.CompletedTheProgram) {
                window.open(notification.url, '_blank');
            } else {
                this.router.navigateByUrl(notification.url);
            }
        }
    }

    markAsRead(notificationId: string, event: Event) {}

    markAllAsRead() {}

    clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications?')) {
        }
    }
}
