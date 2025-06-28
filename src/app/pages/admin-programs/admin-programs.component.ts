import { Component, OnInit } from '@angular/core';
import { ProgramCard, ProgramQuery } from '../../models/program/programs';
import { ProgramsService } from '../../services/programs.service';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import {  RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-admin-programs',
    imports: [InnerPageBannerComponent, RouterModule, NgxSpinnerModule],
    templateUrl: './admin-programs.component.html',
    styleUrl: './admin-programs.component.scss',
})

export class AdminProgramsComponent implements OnInit {
    query: ProgramQuery = new ProgramQuery('', 1, 15);
    programs: ProgramCard[] | null = null;

    
    constructor(
        private programsService: ProgramsService,
        private ngxSpinner: NgxSpinnerService
    ) {}
    ngOnInit(): void {
        this.getPrograms();
    }
    getPrograms() {
        this.programsService.getProgramsForCoach(this.query).subscribe({
            next: (response: ProgramCard[] | undefined) => {
                this.programs = response ?? [];
            },
            error: (error) => {
                console.log(error);
            },
        });
    }
}