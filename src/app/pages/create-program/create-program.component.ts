import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ProgramsService } from '../../services/programs.service';
import { Router } from '@angular/router';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { NgIf } from '@angular/common';
import { SharedService } from '../../shared/shared.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-create-program',
    imports: [
        ReactiveFormsModule,
        InnerPageBannerComponent,
        NgIf,
        NgxSpinnerModule,
    ],
    templateUrl: './create-program.component.html',
    styleUrl: './create-program.component.scss',
})
export class CreateProgramComponent {
    programForm: FormGroup;
    coverFile: File | null = null;
    isSubmitting = false;
    fileErrorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private programService: ProgramsService,
        private router: Router,
        private sharedService: SharedService,
        private spinner: NgxSpinnerService
    ) {
        this.programForm = this.fb.group({
            title: ['', Validators.required],
            details: ['', Validators.required],
            duration: ['', [Validators.required, Validators.min(1)]],
            // price: ['', [Validators.required, Validators.min(0)]],
        });

        // setInterval(() => this.logFormStates(), 1000);
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        let errorMessage = this.sharedService.validateFile(
            file,
            ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            500
        );
        if (errorMessage == null) {
            this.coverFile = file;
        }
        this.fileErrorMessage = errorMessage;
    }
    logFormStates() {
        console.log('Form invalid:', this.programForm.invalid);

        Object.entries(this.programForm.controls).forEach(([key, control]) => {
            console.log(`  Valid: ${control.valid}`);
        });
    }

    submitForm() {
        if (this.programForm.invalid || !this.coverFile) return;

        const formData = new FormData();
        formData.append('Title', this.programForm.value.title);
        formData.append('Details', this.programForm.value.details);
        formData.append('Duration', this.programForm.value.duration);
        // formData.append('Price', this.programForm.value.price);
        formData.append('Cover', this.coverFile);

        this.isSubmitting = true;

        this.programService.createProgram(formData).subscribe({
            next: (programId: number | undefined) => {
                this.isSubmitting = false;
                this.router.navigate([`/program/dashboard/${programId}`]);
            },
            error: (error) => {
                this.isSubmitting = false;
                console.error('Error creating program:', error);
                alert('حدث خطأ أثناء إنشاء التدريب.');
            },
        });
    }
}
