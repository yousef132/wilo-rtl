import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
    API_CONSTANTS,
    currentUser,
    Result,
} from '../../constants/apiConstants';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
    CreateCoachCommand,
    Login,
    Register,
    UserResponse,
} from '../../models/auth/auth';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    baseUrl: string = environment.API_URL;
    isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    currentUser: BehaviorSubject<currentUser | null> =
        new BehaviorSubject<currentUser | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router,
        private cookieService: CookieService,
        @Inject(PLATFORM_ID) private platformId: object
    ) {}
    getCurrentUser(): currentUser | null {
        return this.currentUser.value;
    }

    getIsLoggedIn(): Observable<boolean> {
        return this.isLoggedIn.asObservable();
    }
    login(login: Login) {
        return this.http.post<Result<string>>(
            `${this.baseUrl}${API_CONSTANTS.AUTH.LOGIN}`,
            login
        );
    }
    logout() {
        if (isPlatformBrowser(this.platformId))
            localStorage.removeItem('token');

        this.isLoggedIn.next(false);
        this.currentUser.next(null);
        this.router.navigate(['/login']);
    }

    register(register: Register) {
        return this.http.post<Result<string>>(
            `${this.baseUrl}${API_CONSTANTS.AUTH.REGISTER}`,
            register
        );
    }
    getUsers() {
        return this.http
            .get<Result<UserResponse[]>>(
                `${this.baseUrl}${API_CONSTANTS.AUTH.GET_USERS}`
            )
            .pipe(map((response) => response.data));
    }
    createCoach(command: CreateCoachCommand) {
        return this.http.post<Result<string>>(
            `${this.baseUrl}${API_CONSTANTS.AUTH.CREATE_COACH}`,
            command
        );
    }
    decodeTokenToUser(): currentUser | null {
        let token: string | null = '';
        if (isPlatformBrowser(this.platformId)) {
            token = localStorage.getItem('token');
        }
        if (!token) {
            return null;
        }
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(
                        (c) =>
                            '%' +
                            ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);

            const exp = payload.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            if (!exp || exp <= currentTime) {
                return null; // Token is expired
            }

            return {
                email:
                    payload[
                        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
                    ] || '',
                userName: payload.ArName || '',
                tokenExpired: false,
                role:
                    payload[
                        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                    ] || [],
                id: payload.sub || '',
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
}
