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
import { NgIf, NgClass } from '@angular/common';
import { SharedService } from '../../shared/shared.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-create-program',
    imports: [
        ReactiveFormsModule,
        InnerPageBannerComponent,
        NgIf,
        NgClass,
        NgxSpinnerModule,
    ],
    templateUrl: './create-program.component.html',
    styleUrl: './create-program.component.scss',
})
export class CreateProgramComponent {
    programForm: FormGroup;
    coverFile: File | null = null;
    certificateFile: File | null = null;
    isSubmitting = false;
    fileErrorMessage: string | null = null;
    certificateErrorMessage: string | null = null;
    coverPreview: string | null = null;

    constructor(
        private fb: FormBuilder,
        private programService: ProgramsService,
        private router: Router,
        private sharedService: SharedService,
        private spinner: NgxSpinnerService
    ) {
        this.programForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            details: ['', [Validators.required, Validators.minLength(10)]],
            duration: ['', [Validators.required, Validators.min(1)]],
        });
    }

    onFileChange(event: any, fileType: 'cover' | 'certificate') {
        const file = event.target.files[0];

        if (fileType === 'cover') {
            let errorMessage = this.sharedService.validateFile(
                file,
                ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
                1000
            );

            if (errorMessage == null) {
                this.coverFile = file;
                this.createImagePreview(file);
            } else {
                this.coverFile = null;
                this.coverPreview = null;
            }
            this.fileErrorMessage = errorMessage;
        } else if (fileType === 'certificate') {
            let errorMessage = this.sharedService.validateFile(
                file,
                [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                    'image/webp',
                    'application/pdf',
                ],
                1000
            );

            if (errorMessage == null) {
                this.certificateFile = file;
            } else {
                this.certificateFile = null;
            }
            this.certificateErrorMessage = errorMessage;
        }
    }

    private createImagePreview(file: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.coverPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    removeCoverImage() {
        this.coverFile = null;
        this.coverPreview = null;
        this.fileErrorMessage = null;
    }

    removeCertificateFile() {
        this.certificateFile = null;
        this.certificateErrorMessage = null;
    }

    getFieldError(fieldName: string): string | null {
        const field = this.programForm.get(fieldName);
        if (field?.touched && field?.errors) {
            if (field.errors['required']) {
                switch (fieldName) {
                    case 'title':
                        return 'العنوان مطلوب';
                    case 'details':
                        return 'التفاصيل مطلوبة';
                    case 'duration':
                        return 'المدة مطلوبة';
                    default:
                        return 'هذا الحقل مطلوب';
                }
            }
            if (field.errors['minLength']) {
                switch (fieldName) {
                    case 'title':
                        return 'العنوان يجب أن يكون 3 أحرف على الأقل';
                    case 'details':
                        return 'التفاصيل يجب أن تكون 10 أحرف على الأقل';
                    default:
                        return 'النص قصير جداً';
                }
            }
            if (field.errors['min']) {
                return 'يجب أن تكون المدة أكبر من 0';
            }
        }
        return null;
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.programForm.get(fieldName);
        return !!(field?.touched && field?.invalid);
    }

    submitForm() {
        // Mark all fields as touched to show validation errors
        Object.keys(this.programForm.controls).forEach((key) => {
            this.programForm.get(key)?.markAsTouched();
        });

        if (
            this.programForm.invalid ||
            !this.coverFile ||
            !this.certificateFile
        )
            return;

        const formData = new FormData();
        formData.append('Title', this.programForm.value.title);
        formData.append('Details', this.programForm.value.details);
        formData.append('Duration', this.programForm.value.duration);
        formData.append('Cover', this.coverFile);
        formData.append('CertificateTemplate', this.certificateFile);

        this.isSubmitting = true;
        this.spinner.show();

        this.programService.createProgram(formData).subscribe({
            next: (programId: number | undefined) => {
                this.isSubmitting = false;
                this.spinner.hide();
                this.router.navigate([`/program/dashboard/${programId}`]);
            },
            error: (error) => {
                this.isSubmitting = false;
                this.spinner.hide();
                console.error('Error creating program:', error);
                alert('حدث خطأ أثناء إنشاء التدريب.');
            },
        });
    }
}
