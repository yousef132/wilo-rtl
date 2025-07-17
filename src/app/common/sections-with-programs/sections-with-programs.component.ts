import { Component, Input, input, OnInit } from '@angular/core';
import { ContentType, Section, Status } from '../../models/program/programs';
import { ProgramsService } from '../../services/programs.service';
import { NgFor, NgIf } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SectionService } from '../../services/section.service';
import { Router, RouterLink } from '@angular/router';
import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../../services/authr/auth.service';

@Component({
    selector: 'app-sections-with-programs',
    imports: [NgIf, NgxSpinnerModule, RouterLink],
    templateUrl: './sections-with-programs.component.html',
    styleUrl: './sections-with-programs.component.scss',
})
export class SectionsWithProgramsComponent implements OnInit {
    @Input({ required: true }) programId: number = 0;
    sections: Section[] | null = null;
    ContentType = ContentType;
    currentUserId!: string;
    Status = Status;
    constructor(
        private spinner: NgxSpinnerService,
        private sectionService: SectionService,
        private authService: AuthService,
        private sharedService: SharedService,
        private router: Router
    ) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUserId = user?.id!;
        });
    }
    ngOnInit(): void {
        this.getSections();
    }

    getSections() {
        this.sectionService.getSectionsWithContents(this.programId).subscribe({
            next: (response: Section[] | undefined) => {
                this.sections = response ?? [];
            },
            error: (error) => {
                console.log(error);
            },
        });
    }
    navigateToContent(contentId: number) {
        // this.sharedService.changeSectionId(this.programId);
        // [routerLink]="['/content-details',content.id,currentUserId]"
        this.router.navigate([
            '/content-details',
            contentId,
            this.currentUserId,
            this.programId,
        ]);
    }
}
