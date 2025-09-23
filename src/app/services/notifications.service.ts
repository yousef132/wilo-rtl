import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS, Result } from '../constants/apiConstants';
import { Notification } from '../models/Notification/Notification';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NotificationsService {
    baseUrl = environment.API_URL;
    constructor(private http: HttpClient) {}

    loadNotifications(index: number, pageSize: number) {
        return this.http
            .get<Result<Notification[]>>(
                this.baseUrl + API_CONSTANTS.NOTIFICATION.GET_NOTIFICATIONS,
                {
                    params: {
                        index: index,
                        pageSize: pageSize,
                    },
                }
            )
            .pipe(map((response) => response.data));
    }

    loadNotificationsCount() {
        return this.http
            .get<Result<number>>(
                this.baseUrl + API_CONSTANTS.NOTIFICATION.GET_NOTIFICATION_COUNT
            )
            .pipe(map((response) => response.data));
    }

    markNotificationsAsRead(notificationId: string) {
        return this.http
            .put<Result<any>>(
                this.baseUrl +
                    API_CONSTANTS.NOTIFICATION.MARK_NOTIFICATION_AS_READ,
                { id: notificationId }
            )
            .pipe(map((response) => response.data));
    }
}
