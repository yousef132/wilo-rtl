import { Component, OnInit } from '@angular/core';
import { ProgramsService } from '../../services/programs.service';
import { ProgramCard, ProgramQuery } from '../../models/program/programs';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-programs',
    imports: [RouterLink, InnerPageBannerComponent, NgxSpinnerModule],
    templateUrl: './programs.component.html',
    styleUrl: './programs.component.scss',
})
export class ProgramsComponent implements OnInit {
    programQuery: ProgramQuery = new ProgramQuery('', 1, 15);
    programs: ProgramCard[] | null = null;

    constructor(
        private programService: ProgramsService,
        private route: ActivatedRoute,
        private ngxxSpinner: NgxSpinnerService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const search = params['search'];
            debugger;
            if (search) {
                this.programQuery.title = search.trim() || '';
            }
            else{
                this.programQuery.title = '';
            }

            this.getPrograms();
        });
    }
    getPrograms() {
        this.programService.getPrograms(this.programQuery).subscribe({
            next: (response: ProgramCard[] | undefined) => {
                this.programs = response || null;
            },
            error: (error) => {},
        });
    }
}
