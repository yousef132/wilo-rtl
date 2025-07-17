import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CreateCoachCommand, UserResponse } from '../../models/auth/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AuthService } from '../../services/authr/auth.service';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../demos/home-demo-two/banner/banner.component';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    standalone: true,
    selector: 'app-users',
    imports: [CommonModule, ReactiveFormsModule, InnerPageBannerComponent],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
})
export class UsersComponent {
    users: UserResponse[] = [];
    createCoachForm!: FormGroup;
    @ViewChild('createCoachModal') createCoachModalRef!: TemplateRef<any>;
    modalInstance!: NgbModalRef;

    // Loading states
    isLoadingUsers = false;
    isCreatingCoach = false;

    // Modal state
    isModalOpen = false;

    // Error handling
    errorMessage = '';
    successMessage = '';

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalUsers = 0;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private modalService: NgbModal
    ) {
        ;
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    private initializeForm(): void {
        this.createCoachForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            arName: ['', [Validators.required, Validators.minLength(2)]],
            title: ['', [Validators.required, Validators.minLength(2)]],
        });
    }

    // Load users from API
    loadUsers(): void {
        ;
        this.isLoadingUsers = true;
        this.errorMessage = '';
        this.authService.getUsers().subscribe({
            next: (response: UserResponse[] | undefined) => {
                if (response) {
                    this.users = response;
                    this.totalUsers = response.length;
                }
                this.isLoadingUsers = false;
            },
        });
    }

    // Open create coach modal
    openCreateCoachModal(): void {
        this.clearMessages();
        this.createCoachForm.reset();
        this.modalInstance = this.modalService.open(this.createCoachModalRef, {
            centered: true,
            backdrop: 'static',
        });
    }

    // Close create coach modal
    closeCreateCoachModal(): void {
        this.isModalOpen = false;
        this.createCoachForm.reset();
        this.clearMessages();
    }

    // Create new coach
    createCoach(): void {
        if (this.createCoachForm.invalid) {
            this.markFormGroupTouched();
            return;
        }
        ;
        this.isCreatingCoach = true;
        this.clearMessages();

        const command: CreateCoachCommand = this.createCoachForm.value;
        this.authService.createCoach(command).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.createCoachForm.reset();
                    this.loadUsers(); // Refresh users list
                    this.isModalOpen = false;
                    this.isCreatingCoach = false;
                    if (this.modalInstance) {
                        this.modalInstance.close();
                    }
                }
            },
            error: (error) => {
                this.isCreatingCoach = false;
            },
        });
    }

    // Form validation helpers
    isFieldInvalid(fieldName: string): boolean {
        const field = this.createCoachForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.createCoachForm.get(fieldName);
        if (field && field.errors) {
            if (field.errors['required']) {
                return `حقل ${this.getFieldLabel(fieldName)} مطلوب`;
            }
            if (field.errors['email']) {
                return 'يرجى إدخال بريد إلكتروني صحيح';
            }
            if (field.errors['minlength']) {
                const requiredLength = field.errors['minlength'].requiredLength;
                return `يجب أن يحتوي ${this.getFieldLabel(
                    fieldName
                )} على ${requiredLength} حروف على الأقل`;
            }
        }
        return '';
    }

    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            arName: 'الاسم العربي',
            title: 'المسمى الوظيفي',
        };
        return labels[fieldName] || fieldName;
    }

    private markFormGroupTouched(): void {
        Object.keys(this.createCoachForm.controls).forEach((key) => {
            const control = this.createCoachForm.get(key);
            if (control) {
                control.markAsTouched();
            }
        });
    }

    // Message handling
    private handleError(message: string): void {
        this.errorMessage = message;
        this.successMessage = '';
    }

    private clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }

    // Pagination helpers (optional)
    get paginatedUsers(): UserResponse[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.users.slice(startIndex, startIndex + this.pageSize);
    }
    get totalPages(): number {
        return Math.ceil(this.totalUsers / this.pageSize);
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }
    // Refresh users
    refreshUsers(): void {
        this.loadUsers();
    }


}
