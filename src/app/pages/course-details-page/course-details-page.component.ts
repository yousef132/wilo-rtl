import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { RelatedCoursesComponent } from './related-courses/related-courses.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { ProgramDetails } from '../../models/program/programs';
import { ProgramsService } from '../../services/programs.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SectionsWithProgramsComponent } from '../../common/sections-with-programs/sections-with-programs.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../services/authr/auth.service';
import { currentUser } from '../../constants/apiConstants';
import { SharedService } from '../../shared/shared.service';
import { debug } from 'node:console';

@Component({
    selector: 'app-course-details-page',
    imports: [
        NgIf,
        NgClass,
        CommonModule,
        InnerPageBannerComponent,
        RelatedCoursesComponent,
        SectionsWithProgramsComponent,
        NgxSpinnerModule,
    ],
    templateUrl: './course-details-page.component.html',
    styleUrl: './course-details-page.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class CourseDetailsPageComponent {
    safeCoverUrl: SafeResourceUrl | null = null;

    programId: number = 0;
    programDetails: ProgramDetails | null = null;
    sectionsOpened: boolean = false;
    isLoggedIn: boolean = false;
    currentUser!: currentUser;
    isCoach: boolean = false;
    constructor(
        private activatedRoute: ActivatedRoute,
        private programService: ProgramsService,
        private sanitizer: DomSanitizer,
        private spinner: NgxSpinnerService,
        public authService: AuthService,
        private router : Router
    ) {
        // get id  then
        this.activatedRoute.params.subscribe((params) => {
            this.programId = +params['id'];
        });
        this.getProgramDetails();

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            this.isLoggedIn = isLoggedIn;
        });

        debugger;
        this.authService.currentUser.subscribe((user) => {
            this.currentUser = user!;
                debugger;

            if (this.currentUser) {
                this.isCoach = this.currentUser.role === "Coach";
            }
        });
    }
    getProgramDetails() {
        this.programService.getProgramDetails(this.programId).subscribe({
            next: (response: ProgramDetails | undefined) => {
                this.programDetails = response || null;
                if (this.programDetails?.cover) {
                    this.safeCoverUrl =
                        this.sanitizer.bypassSecurityTrustResourceUrl(
                            this.programDetails.cover
                        );
                }
            },
            error: (error) => {
                console.log(error);
            },
        });
    }
    // Video Popup
    isOpen = false;
    openPopup(): void {
        this.isOpen = true;
    }
    closePopup(): void {
        this.isOpen = false;
    }

    // Tabs
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
        if (tab === 'tab2') {
            this.sectionsOpened = true;
        }
    }
    registerProgram() {
        // make confirm
        if (confirm('هل انت متأكد من التسجيل فى البرنامج؟')) {
            this.programService.registerInProgram(this.programId).subscribe({
                next: (response: number | undefined) => {
                    this.programDetails!.isRegistered = true;
                    if(response){
                        this.router.navigate(['/content-details',response,this.currentUser.id,this.programId]);
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
        }
    }
}
