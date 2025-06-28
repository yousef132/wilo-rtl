import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';
import { currentUser } from '../../constants/apiConstants';
import { AuthService } from '../../services/authr/auth.service';

@Component({
    selector: 'app-footer',
    imports: [RouterLink, NgIf, NgClass],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    currentUser?: currentUser | null;
    isLoggedIn: boolean = false;
    constructor(public router: Router, private authService: AuthService) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUser = user || null;
            this.isLoggedIn = !!user;
        });
    }
    get isCoach(): boolean {
        return this.currentUser?.role.includes('Coach') ?? false;
    }
    // Back To Top
    isShow: boolean = false;
    topPosToStartShowing = 100;
    @HostListener('window:scroll')
    checkScroll() {
        const scrollPosition =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
        this.isShow = scrollPosition >= this.topPosToStartShowing;
    }
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
    
}
