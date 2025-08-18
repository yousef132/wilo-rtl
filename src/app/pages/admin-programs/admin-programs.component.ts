import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ProgramCard, ProgramQuery } from '../../models/program/programs';
import { ProgramsService } from '../../services/programs.service';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { currentUser } from '../../constants/apiConstants';
import { AuthService } from '../../services/authr/auth.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-admin-programs',
    imports: [
        InnerPageBannerComponent,
        RouterModule,
        NgxSpinnerModule,
        ReactiveFormsModule,
        FormsModule,
        NgIf,
    ],
    templateUrl: './admin-programs.component.html',
    styleUrl: './admin-programs.component.scss',
})
export class AdminProgramsComponent implements OnInit {
    query: ProgramQuery = new ProgramQuery('', 1, 15);
    programs: ProgramCard[] | null = null;
    currentUser: currentUser | null = null;
    secretKey: string = '';
    @ViewChild('ImportProgramModal') ImportProgramModalRef!: TemplateRef<any>;

    constructor(
        private programsService: ProgramsService,
        private ngxSpinner: NgxSpinnerService,
        private modalService: NgbModal,
        private authservice: AuthService
    ) {
        this.authservice.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    get isCoach(): boolean {
        debugger;
        return this.currentUser?.roles.includes('Coach') ?? false;
    }
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

    openModal() {
        this.modalService.open(this.ImportProgramModalRef, { centered: true });
    }
    importProgram(key: string): void {
        this.programsService.importProgram(key).subscribe({
            next: (response: ProgramCard) => {
                this.modalService.dismissAll();
                this.getPrograms();
            },
            error: (error) => {
                console.log(error);
            },
        });
    }
}
