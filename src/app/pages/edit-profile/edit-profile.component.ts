import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
    trigger,
    state,
    style,
    transition,
    animate,
    query,
    stagger,
} from '@angular/animations';
import { AuthService } from '../../services/authr/auth.service';
import { CommonModule, NgFor } from '@angular/common';
import { UpdateProfileResponse, UserProfile } from '../../models/auth/auth';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('500ms ease-in', style({ opacity: 1 })),
            ]),
        ]),
        trigger('slideInFromTop', [
            transition(':enter', [
                style({ transform: 'translateY(-50px)', opacity: 0 }),
                animate(
                    '600ms ease-out',
                    style({ transform: 'translateY(0)', opacity: 1 })
                ),
            ]),
        ]),
        trigger('slideInFromBottom', [
            transition(':enter', [
                style({ transform: 'translateY(50px)', opacity: 0 }),
                animate(
                    '600ms 200ms ease-out',
                    style({ transform: 'translateY(0)', opacity: 1 })
                ),
            ]),
        ]),
        trigger('slideInUp', [
            transition(':enter', [
                style({ transform: 'translateY(30px)', opacity: 0 }),
                animate(
                    '400ms ease-out',
                    style({ transform: 'translateY(0)', opacity: 1 })
                ),
            ]),
        ]),
        trigger('slideInLeft', [
            transition(':enter', [
                style({ transform: 'translateX(-30px)', opacity: 0 }),
                animate(
                    '500ms 300ms ease-out',
                    style({ transform: 'translateX(0)', opacity: 1 })
                ),
            ]),
        ]),
        trigger('slideInRight', [
            transition(':enter', [
                style({ transform: 'translateX(30px)', opacity: 0 }),
                animate(
                    '500ms 400ms ease-out',
                    style({ transform: 'translateX(0)', opacity: 1 })
                ),
            ]),
        ]),
        trigger('scaleIn', [
            transition(':enter', [
                style({ transform: 'scale(0.8)', opacity: 0 }),
                animate(
                    '400ms 500ms ease-out',
                    style({ transform: 'scale(1)', opacity: 1 })
                ),
            ]),
        ]),
        trigger('inputFocus', [
            state('focused', style({ transform: 'scale(1.02)' })),
            transition('* => focused', animate('200ms ease-out')),
            transition('focused => *', animate('200ms ease-in')),
        ]),
        trigger('toastSlide', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate(
                    '300ms ease-out',
                    style({ transform: 'translateX(0)', opacity: 1 })
                ),
            ]),
            transition(':leave', [
                animate(
                    '300ms ease-in',
                    style({ transform: 'translateX(100%)', opacity: 0 })
                ),
            ]),
        ]),
    ],
    imports: [ReactiveFormsModule, CommonModule],
})
export class ProfileEditComponent implements OnInit, OnDestroy {
    profileForm!: FormGroup;
    userProfile: UserProfile | null = null;
    originalProfile: UserProfile | null = null;

    // Loading states
    isInitialLoading = true;
    isLoading = false;
    isUploadingImage = false;

    // File upload
    avatarPreview: string | null = null;
    selectedFile: File | null = null;
    uploadProgress = 0;

    // Messages
    showSuccessMessage = false;
    showErrorMessage = false;
    errorMessage = '';
    currentUserId!: string;

    // **FIX 1: Create a computed property for finalImageSrc instead of calling method**
    finalImageSrc: string = '';

    // Constants
    private readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly DEFAULT_AVATAR = 'images/default-avatar.png';

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        this.authService.currentUser.subscribe((user) => {
            this.currentUserId = user?.id!;
        });
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadUserProfile();
        // **FIX 2: Initialize finalImageSrc with default**
        this.updateFinalImageSrc();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.profileForm = this.fb.group({
            name: [
                '', 
                [
                    Validators.required, 
                    Validators.minLength(2),
                    Validators.maxLength(50),
                    this.noOnlyWhitespaceValidator
                ]
            ],
            title: [
                '', 
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(100)
                ]
            ],
        });
    }

    // Custom validator to prevent only whitespace
    private noOnlyWhitespaceValidator(control: any) {
        if (control.value && control.value.trim().length === 0) {
            return { whitespace: true };
        }
        return null;
    }

    private loadUserProfile(): void {
        this.isInitialLoading = true;

        this.authService
            .getUserData(this.currentUserId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (profile: UserProfile | undefined) => {
                    if (profile) {
                        this.userProfile = profile;
                        this.originalProfile = { ...profile };
                        this.populateForm(profile);
                        // **FIX 3: Update image source after loading profile**
                        this.updateFinalImageSrc();
                    }
                    this.isInitialLoading = false;
                },
                error: (error) => {
                    console.error('Error loading profile:', error);
                    this.showError('حدث خطأ في تحميل البيانات');
                    this.isInitialLoading = false;
                },
            });
    }

    private populateForm(profile: UserProfile): void {
        this.profileForm.patchValue({
            name: profile.name || '',
            title: profile.title || '',
        });
    }

    // **FIX 4: Create method to update finalImageSrc instead of calling it repeatedly**
    private updateFinalImageSrc(): void {
        if (this.avatarPreview) {
            this.finalImageSrc = this.avatarPreview;
        } else if (this.userProfile?.avatar) {
            this.finalImageSrc = this.userProfile.avatar;
        } else {
            this.finalImageSrc = this.DEFAULT_AVATAR;
        }
    }

    // Form validation helpers
    isFieldInvalid(fieldName: string): boolean {
        const field = this.profileForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    isFieldValid(fieldName: string): boolean {
        const field = this.profileForm.get(fieldName);
        return !!(field && field.valid && (field.dirty || field.touched));
    }

    // File handling
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
                this.showError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)');
                this.resetFileInput(input);
                return;
            }

            // Validate file size
            if (file.size > this.MAX_FILE_SIZE) {
                this.showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                this.resetFileInput(input);
                return;
            }

            this.selectedFile = file;
            this.createImagePreview(file);
        }
    }

    private resetFileInput(input: HTMLInputElement): void {
        input.value = '';
        this.selectedFile = null;
        this.avatarPreview = null;
        this.uploadProgress = 0;
        // **FIX 5: Update image source when resetting**
        this.updateFinalImageSrc();
    }

    private createImagePreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.avatarPreview = e.target?.result as string;
            // **FIX 6: Update image source when preview is created**
            this.updateFinalImageSrc();
        };
        reader.readAsDataURL(file);
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        // **FIX 7: Only set default avatar if current src is not already default**
        if (img.src !== this.DEFAULT_AVATAR) {
            img.src = this.DEFAULT_AVATAR;
            // Update the property to prevent further error loops
            this.finalImageSrc = this.DEFAULT_AVATAR;
        }
    }

    // **FIX 8: Remove the old getAvatarSrc method since we now use finalImageSrc property**

    // Change detection
    hasChanges(): boolean {
        return this.hasNameChanged() || this.hasTitleChanged() || this.hasImageChanged();
    }

    hasNameChanged(): boolean {
        if (!this.originalProfile) return false;
        const currentName = this.profileForm.get('name')?.value?.trim() || '';
        const originalName = this.originalProfile.name?.trim() || '';
        return currentName !== originalName;
    }

    hasTitleChanged(): boolean {
        if (!this.originalProfile) return false;
        const currentTitle = this.profileForm.get('title')?.value?.trim() || '';
        const originalTitle = this.originalProfile.title?.trim() || '';
        return currentTitle !== originalTitle;
    }

    hasImageChanged(): boolean {
        return this.selectedFile !== null;
    }

    canSave(): boolean {
        return this.profileForm.valid && !this.isLoading && this.hasChanges();
    }

    // Form submission
    onSave(): void {
        if (!this.canSave()) {
            return;
        }

        this.isLoading = true;
        this.uploadProgress = 0;

        const formData = new FormData();

        // Append form data with trimmed values
        const name = this.profileForm.get('name')?.value?.trim() || '';
        const title = this.profileForm.get('title')?.value?.trim() || '';

        formData.append('name', name);
        formData.append('title', title);

        // Append file if selected
        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
            this.isUploadingImage = true;
        }

        this.authService
            .updateProfile(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updateProfileResponse: UpdateProfileResponse | undefined) => {
                    this.handleUpdateSuccess(updateProfileResponse);
                },
                error: (error) => {
                    this.handleUpdateError(error);
                },
            });
    }

    private handleUpdateSuccess(updateProfileResponse: UpdateProfileResponse | undefined): void {
        if (updateProfileResponse && this.userProfile && this.originalProfile) {
            // Update current profile
            this.userProfile.avatar = updateProfileResponse.profileImage || this.userProfile.avatar;
            this.userProfile.name = updateProfileResponse.arName || this.userProfile.name;
            this.userProfile.title = updateProfileResponse.title || this.userProfile.title;

            // Update original profile for comparison
            this.originalProfile.avatar = this.userProfile.avatar;
            this.originalProfile.name = this.userProfile.name;
            this.originalProfile.title = this.userProfile.title;

            // **FIX 9: Update image source after successful update**
            this.updateFinalImageSrc();
        }

        // Reset form state
        this.resetFormState();
    }

    private handleUpdateError(error: any): void {
        console.error('Error updating profile:', error);
        this.resetFormState();
        this.showError(this.getErrorMessage(error));
    }

    private resetFormState(): void {
        this.avatarPreview = null;
        this.selectedFile = null;
        this.isLoading = false;
        this.isUploadingImage = false;
        this.uploadProgress = 0;
        // **FIX 10: Update image source when resetting form state**
        this.updateFinalImageSrc();
    }

    // Form reset and cancel
    onCancel(): void {
        if (this.hasChanges()) {
            const confirmMessage = 'هل أنت متأكد من إلغاء التغييرات؟ سيتم فقدان جميع التعديلات غير المحفوظة.';
            if (confirm(confirmMessage)) {
                this.resetForm();
            }
        } else {
            this.goBack();
        }
    }

    private resetForm(): void {
        if (this.originalProfile) {
            this.populateForm(this.originalProfile);
        }
        this.avatarPreview = null;
        this.selectedFile = null;
        this.uploadProgress = 0;
        this.profileForm.markAsUntouched();
        this.profileForm.markAsPristine();
        // **FIX 11: Update image source when resetting form**
        this.updateFinalImageSrc();
    }

    goBack(): void {
        this.router.navigate(['/profile', this.currentUserId]);
    }

    // Message handling
    private showSuccess(message: string = 'تم حفظ التغييرات بنجاح!'): void {
        this.showSuccessMessage = true;
        setTimeout(() => {
            this.hideSuccessMessage();
        }, 5000);
    }

    private showError(message: string): void {
        this.errorMessage = message;
        this.showErrorMessage = true;
        setTimeout(() => {
            this.hideErrorMessage();
        }, 7000);
    }

    hideSuccessMessage(): void {
        this.showSuccessMessage = false;
    }

    hideErrorMessage(): void {
        this.showErrorMessage = false;
        this.errorMessage = '';
    }

    private getErrorMessage(error: any): string {
        // Handle different error scenarios
        if (error.status === 400) {
            return 'البيانات المدخلة غير صحيحة. يرجى التحقق من صحة المعلومات';
        } else if (error.status === 401) {
            return 'انتهت جلسة العمل. يرجى تسجيل الدخول مرة أخرى';
        } else if (error.status === 403) {
            return 'ليس لديك صلاحية لتعديل هذا الملف الشخصي';
        } else if (error.status === 413) {
            return 'حجم الصورة كبير جداً. يرجى اختيار صورة أصغر';
        } else if (error.status === 415) {
            return 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة صحيحة';
        } else if (error.status === 422) {
            return 'البيانات غير مكتملة أو غير صحيحة';
        } else if (error.status === 500) {
            return 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً';
        } else if (error.status === 0) {
            return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
        } else {
            return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى';
        }
    }

    // Utility method for development/debugging
    getCompletionRate(): number {
        if (!this.userProfile || this.userProfile.totalCourses === 0) {
            return 0;
        }
        return Math.round(
            (this.userProfile.completedCourses / this.userProfile.totalCourses) * 100
        );
    }
}

// Profile Service Interface (implement this in your actual service)
export interface ProfileService {
    getCurrentUserProfile(): Observable<UserProfile>;
    updateProfile(formData: FormData): Observable<UpdateProfileResponse>;
}