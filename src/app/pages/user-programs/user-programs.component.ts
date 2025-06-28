import { Component, OnInit } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProgramCard } from '../../models/program/programs';
import { ProgramsService } from '../../services/programs.service';

@Component({
  selector: 'app-user-programs',
  imports: [RouterLink, InnerPageBannerComponent,NgxSpinnerModule],
  templateUrl: './user-programs.component.html',
  styleUrl: './user-programs.component.scss'
})
export class UserProgramsComponent implements OnInit {
  programs: ProgramCard[] | null = null;

    constructor(
        private programService: ProgramsService,
        private route: ActivatedRoute,
        private ngxxSpinner: NgxSpinnerService
    ) {}

    ngOnInit(): void {
      this.getPrograms();
    }
    getPrograms() {
        this.programService.getStudentPrograms().subscribe({
            next: (response: ProgramCard[] | undefined) => {
                this.programs = response || null;
            },
            error: (error) => {},
        });
    }
}
