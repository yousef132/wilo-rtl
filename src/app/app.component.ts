import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, Event, RouterOutlet } from '@angular/router';
import { AuthService } from './services/authr/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { NavbarComponent } from './common/navbar/navbar.component';
import { FooterComponent } from './common/footer/footer.component';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title =
        'Wilo - IT Business & Digital Startup Angular 19 Templates Collection';

    constructor(
        private router: Router,
        private viewportScroller: ViewportScroller,
        private authService: AuthService,
        private cookieService: CookieService,
        @Inject(PLATFORM_ID) private platformId: object
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                // Scroll to the top after each navigation end
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
        let currentUser = this.authService.decodeTokenToUser();

        if (currentUser == null) {
            // this.router.navigate(['/login']);
            this.authService.isLoggedIn.next(false);
            this.authService.currentUser.next(null);
            // this.cookieService.delete('token', '/');

            if (isPlatformBrowser(this.platformId)) {
                localStorage.removeItem('token');
            }
        } else {
            this.authService.isLoggedIn.next(true);
            this.authService.currentUser.next(currentUser);
        }
    }
}
