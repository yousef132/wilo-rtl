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
import { ToastrService } from 'ngx-toastr';

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
    creationMode: 'manual' | 'ai' = 'manual';

    // Files
    coverFile: File | null = null;
    certificateFile: File | null = null;
    bookFile: File | null = null;

    // UI State
    isSubmitting = false;

    // Error messages
    fileErrorMessage: string | null = null;
    certificateErrorMessage: string | null = null;
    bookErrorMessage: string | null = null;

    // Previews
    coverPreview: string | null = null;

    constructor(
        private fb: FormBuilder,
        private programService: ProgramsService,
        private router: Router,
        private sharedService: SharedService,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService
    ) {
        this.programForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            details: ['', [Validators.required, Validators.minLength(10)]],
            duration: ['', [Validators.required, Validators.min(1)]],
        });
    }

    // Creation Mode Management
    setCreationMode(mode: 'manual' | 'ai') {
        this.creationMode = mode;

        // Reset all error messages
        this.fileErrorMessage = null;
        this.certificateErrorMessage = null;
        this.bookErrorMessage = null;

        if (mode === 'manual') {
            // Reset AI-specific files and validations
            this.bookFile = null;
            this.bookErrorMessage = null;
        } else {
            // For AI mode, keep the form but don't reset it
            // The form fields are still required for both modes
        }
    }

    // File Upload Handlers
    onFileChange(event: any, fileType: 'cover' | 'certificate' | 'book') {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        switch (fileType) {
            case 'cover':
                this.handleCoverUpload(file);
                break;
            case 'certificate':
                this.handleCertificateUpload(file);
                break;
            case 'book':
                this.handleBookUpload(file);
                break;
        }

        // Reset file input to allow re-uploading same file
        event.target.value = '';
    }

    private handleCoverUpload(file: File) {
        let errorMessage = this.sharedService.validateFile(
            file,
            ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            1000 // 1MB
        );

        if (errorMessage == null) {
            this.coverFile = file;
            this.createImagePreview(file);
            this.fileErrorMessage = null;
        } else {
            this.coverFile = null;
            this.coverPreview = null;
            this.fileErrorMessage = errorMessage;
        }
    }

    private handleCertificateUpload(file: File) {
        let errorMessage = this.sharedService.validateFile(
            file,
            ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            1000 // 1MB
        );

        if (errorMessage == null) {
            this.certificateFile = file;
            this.certificateErrorMessage = null;
        } else {
            this.certificateFile = null;
            this.certificateErrorMessage = errorMessage;
        }
    }

    private handleBookUpload(file: File) {
        let errorMessage = this.sharedService.validateFile(
            file,
            ['application/pdf'],
            30000 // 30MB
        );

        if (errorMessage == null) {
            this.bookFile = file;
            this.bookErrorMessage = null;
        } else {
            this.bookFile = null;
            this.bookErrorMessage = errorMessage;
        }
    }

    private createImagePreview(file: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.coverPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    // File Removal Handlers
    removeCoverImage() {
        this.coverFile = null;
        this.coverPreview = null;
        this.fileErrorMessage = null;
        const fileInput = document.getElementById(
            'coverFile'
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    removeCertificateFile() {
        this.certificateFile = null;
        this.certificateErrorMessage = null;
        const fileInput = document.getElementById(
            'certificateFile'
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    removeBookFile() {
        this.bookFile = null;
        this.bookErrorMessage = null;
        const fileInput = document.getElementById(
            'bookFile'
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    // Validation Methods
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
            if (field.errors['minlength']) {
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

    private validateFormForMode(): boolean {
        // Check required files first
        if (!this.coverFile || !this.certificateFile) {
            return false;
        }

        // Check if form is valid
        if (!this.programForm.valid) {
            return false;
        }

        // For AI mode, also check book file
        if (this.creationMode === 'ai' && !this.bookFile) {
            return false;
        }

        return true;
    }

    // Progress Steps
    isStepCompleted(stepNumber: number): boolean {
        switch (stepNumber) {
            case 1:
                return !!this.creationMode; // Always completed (mode selection)
            case 2:
                return (
                    !!this.programForm.get('title')?.value?.trim() &&
                    this.programForm.get('title')?.value?.trim().length >= 3 &&
                    !!this.programForm.get('details')?.value?.trim() &&
                    this.programForm.get('details')?.value?.trim().length >=
                        10 &&
                    !!this.programForm.get('duration')?.value &&
                    this.programForm.get('duration')?.value > 0 &&
                    (this.creationMode === 'manual' || !!this.bookFile)
                );
            case 3:
                return !!this.coverFile && !!this.certificateFile;
            default:
                return false;
        }
    }

    isStepActive(stepNumber: number): boolean {
        switch (stepNumber) {
            case 1:
                return !this.isStepCompleted(1);
            case 2:
                return this.isStepCompleted(1) && !this.isStepCompleted(2);
            case 3:
                return this.isStepCompleted(2) && !this.isStepCompleted(3);
            default:
                return false;
        }
    }

    // Form Submission
    submitForm() {
        // Mark all fields as touched to show validation errors
        Object.keys(this.programForm.controls).forEach((key) => {
            this.programForm.get(key)?.markAsTouched();
        });

        if (!this.validateFormForMode()) {
            return;
        }

        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;

        const formData = new FormData();

        // Common fields and files for both modes
        formData.append('Title', this.programForm.value.title);
        formData.append('Details', this.programForm.value.details);
        formData.append('Duration', this.programForm.value.duration.toString());
        formData.append('Cover', this.coverFile!);
        formData.append('CertificateTemplate', this.certificateFile!);

        if (this.creationMode === 'manual') {
            // Manual mode – wait for completion
            this.spinner.show();

            this.programService.createProgram(formData).subscribe({
                next: (response: number | undefined) => {
                    this.spinner.hide();
                    const programId = response;
                    this.router.navigate([`/program/dashboard/${programId}`]);
                },
                error: (error) => {
                    console.error('Error creating program:', error);
                    this.spinner.hide();

                    let errorMessage =
                        'حدث خطأ أثناء إنشاء التدريب. يرجى المحاولة مرة أخرى.';
                    if (error?.error?.message) {
                        errorMessage = error.error.message;
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }
                    alert(errorMessage);
                },
                complete: () => {
                    this.isSubmitting = false;
                    this.spinner.hide();
                },
            });
        } else {
            // AI mode – fire and forget
            formData.append('Book', this.bookFile!);
            this.toastr.info(
                'تم بدء عملية إنشاء التدريب بالذكاء الاصطناعي. ستستغرق هذه العملية عدة دقائق وستتلقى إشعاراً عند اكتمالها.'
            );
            this.router.navigate(['/my-programs']);

            // Call API in background without blocking user
            this.programService.createProgrambyAi(formData).subscribe({
                next: () => {
                    console.log('AI program creation started successfully');
                },
                error: (error) => {
                    console.error('Error creating program with AI:', error);
                    let errorMessage =
                        'حدث خطأ أثناء إنشاء التدريب بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.';
                    if (error?.error?.message) {
                        errorMessage = error.error.message;
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }
                    // Optional: show toast instead of alert since user already moved on
                    alert(errorMessage);
                },
                complete: () => {
                    this.isSubmitting = false;
                    this.spinner.hide();
                },
            });
        }
    }

    // Navigation Methods
    cancelCreation() {
        if (this.isSubmitting) {
            return;
        }
        this.router.navigate(['/programs']);
    }

    // Utility Methods
    getCharacterCount(): number {
        return this.programForm.get('details')?.value?.length || 0;
    }

    isSubmitDisabled(): boolean {
        return this.isSubmitting || !this.validateFormForMode();
    }

    getSubmitButtonText(): string {
        if (this.isSubmitting) {
            return this.creationMode === 'ai'
                ? 'جاري البدء...'
                : 'جاري الإنشاء...';
        }
        return this.creationMode === 'ai'
            ? 'بدء الإنشاء بالذكاء الاصطناعي'
            : 'إنشاء التدريب';
    }

    getSubmitButtonIcon(): string {
        if (this.isSubmitting) {
            return 'bx-loader-alt bx-spin';
        }
        return this.creationMode === 'ai' ? 'bx-brain' : 'bx-plus';
    }

    // File size formatting utility
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
