import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import {
    FormGroup,
    Validators,
    FormControl,
    ReactiveFormsModule,
    ValidatorFn,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { Register } from '../../models/auth/auth';
import { AuthService } from '../../services/authr/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Result } from '../../constants/apiConstants';
import { NgxSpinnerModule } from 'ngx-spinner';

export const confirmPasswordValidator: ValidatorFn = (
    group: AbstractControl
): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
    selector: 'app-contact-page',
    imports: [
        NavbarComponent,
        InnerPageBannerComponent,
        FooterComponent,
        ReactiveFormsModule,
        NgIf,
        NgxSpinnerModule,
        RouterLink
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent {
    registerFailed: boolean = false;
    registeObj: Register = new Register();
    errorMessage: string = '';
    inforMessage: string = '';
    registerForm = new FormGroup(
        {
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required]),
            confirmPassword: new FormControl('', [Validators.required]),
            arName: new FormControl('', [Validators.required]),
            title: new FormControl('', [Validators.required]),
        },
        { validators: confirmPasswordValidator }
    );

    constructor(private authService: AuthService, private router: Router) {}
    onSubmit() {
        this.registeObj.email = this.registerForm.value.email!;
        this.registeObj.password = this.registerForm.value.password!;
        this.registeObj.arName = this.registerForm.value.arName!;
        this.registeObj.title = this.registerForm.value.title!;

        this.authService.register(this.registeObj).subscribe({
            next: (res: Result<string> | undefined) => {
                if (res) {
                    this.router.navigate(['/login']);
                }
            },
            error: (err) => {
                this.errorMessage = err.error.message;
            },
        });
    }
}
