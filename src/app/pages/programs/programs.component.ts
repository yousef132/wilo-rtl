import { Component, OnInit } from '@angular/core';
import { ProgramsService } from '../../services/programs.service';
import { ProgramCard, ProgramQuery } from '../../models/program/programs';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';

@Component({
    selector: 'app-programs',
    imports: [RouterLink, InnerPageBannerComponent],
    templateUrl: './programs.component.html',
    styleUrl: './programs.component.scss',
})
export class ProgramsComponent implements OnInit {
    programQuery: ProgramQuery = new ProgramQuery('', 1, 15);
    programs: ProgramCard[] | null = null;
    isLoading: boolean = true;
    skeletonArray: number[] = Array(6).fill(0); // Creates array for 6 skeleton items

    constructor(
        private programService: ProgramsService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const search = params['search'];
            
            if (search) {
                this.programQuery.title = search.trim() || '';
            } else {
                this.programQuery.title = '';
            }

            this.getPrograms();
        });
    }

    getPrograms() {
        this.isLoading = true;
        this.programs = null; // Reset programs to show skeleton
        
        this.programService.getPrograms(this.programQuery).subscribe({
            next: (response: ProgramCard[] | undefined) => {
                // Simulate minimum loading time for better UX (optional)
                setTimeout(() => {
                    this.programs = response || [];
                    this.isLoading = false;
                }, 500);
            },
            error: (error) => {
                console.error('Error loading programs:', error);
                this.programs = [];
                this.isLoading = false;
            },
        });
    }

    refreshPrograms() {
        this.getPrograms();
    }
}