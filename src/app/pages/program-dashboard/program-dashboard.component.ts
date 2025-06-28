import { Component, OnInit } from '@angular/core';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { ProgramsService } from '../../services/programs.service';
import { SectionService } from '../../services/section.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
    CoachingProgramStatus,
    ProgramDetailsForUpdate,
} from '../../models/program/programs';
import { DahsboardSection } from '../../models/section/section';
import { forkJoin } from 'rxjs';
import {
    FormBuilder,
    FormGroup,
    NgModel,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { EditProgramComponent } from '../edit-program/edit-program.component';
import { ProgramSectionsComponent } from '../program-sections/program-sections.component';

@Component({
    selector: 'app-program-dashboard',
    imports: [
        InnerPageBannerComponent,
        CommonModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        EditProgramComponent,
        ProgramSectionsComponent,
    ],
    templateUrl: './program-dashboard.component.html',
    styleUrl: './program-dashboard.component.scss',
})
export class ProgramDashboardComponent implements OnInit {
    programId: number = 0;
    programStatus!:CoachingProgramStatus;
    constructor(private route: ActivatedRoute) {
        // get program id from route
        this.route.params.subscribe((params) => {
            this.programId = +params['id'];
        });
    }

    ngOnInit(): void {}

    receiveData(data: CoachingProgramStatus) {
        this.programStatus = data;
    }
}
