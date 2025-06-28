import { CommonModule, NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
    Router,
    RouterLink,
    RouterLinkActive,
    RouterModule,
} from '@angular/router';
import { AuthService } from '../../services/authr/auth.service';
import { currentUser } from '../../constants/apiConstants';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        NgClass,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    currentUser: currentUser | null = null;
    searchText: string = '';
    isLoggedIn: boolean | null = null;

    constructor(private authService: AuthService, private router: Router) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUser = user || null;
        });

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            this.isLoggedIn = isLoggedIn;
        });
    }
    // Responsive Menu Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    get isCoach(): boolean {
        return this.currentUser?.role.includes('Coach') ?? false;
    }
    get isAdmin(): boolean {
        return this.currentUser?.role.includes('Admin') ?? false;
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
