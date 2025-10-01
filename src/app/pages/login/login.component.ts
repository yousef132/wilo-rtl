import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Login, LoginResponse } from '../../models/auth/auth';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AuthService } from '../../services/authr/auth.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { InnerPageBannerComponent } from '../../common/inner-page-banner/inner-page-banner.component';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { Result } from '../../constants/apiConstants';
import { CredentialResponse } from 'google-one-tap';

declare const google: any;

@Component({
    selector: 'app-login',
    imports: [
        InnerPageBannerComponent,
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        NgxSpinnerModule,
        RouterLink,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
    loginObj: Login = new Login();
    errorMessage: string = '';
    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
    });

    constructor(
        private authService: AuthService,
        private router: Router,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        @Inject(PLATFORM_ID) private platformId: object
    ) {}

    ngOnInit(): void {
   
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loginObj.email = this.loginForm.value.email!;
        this.loginObj.password = this.loginForm.value.password!;

        this.spinner.show();

        this.authService.login(this.loginObj).subscribe({
            next: (res: Result<any> | undefined) => {
                this.spinner.hide();
                if (res && res.data) {
                    this.toastr.success('تم تسجيل الدخول بنجاح', 'نجاح');
                    this.handleLogin(res.data);
                }
            },
            error: (err) => {
                this.spinner.hide();
                this.errorMessage =
                    err.error?.message || 'حدث خطأ أثناء تسجيل الدخول';
                this.toastr.error(this.errorMessage, 'خطأ');
            },
        });
    }

    handleLogin(token: string): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
        }
        this.authService.isLoggedIn.next(true);
        this.authService.currentUser.next(this.authService.decodeTokenToUser());
        this.router.navigate(['/Home']);
    }

    signInWithGoogle(): void {
        if (typeof google !== 'undefined') {
            google.accounts.id.prompt((notification: any) => {
                if (
                    notification.isNotDisplayed() ||
                    notification.isSkippedMoment()
                ) {
                    // Fallback to renderButton if prompt is not displayed
                    console.log(
                        'Google One Tap not displayed, trying alternative method'
                    );
                }
            });
        } else {
            this.toastr.error('Google Sign-In is not loaded yet', 'خطأ');
        }
    }

    // async handleCredentialResponse(
    //     response: CredentialResponse
    // ): Promise<void> {
    //     try {
    //         this.spinner.show();

    //         // Send the credential token to your backend
    //         const googleToken = response.credential;

    //         // Call your backend API to verify and login with Google token
    //         this.authService.loginWithGoogle(googleToken).subscribe({
    //             next: (res: Result<any> | undefined) => {
    //                 this.spinner.hide();
    //                 if (res && res.data) {
    //                     this.toastr.success(
    //                         'تم تسجيل الدخول بنجاح عبر Google',
    //                         'نجاح'
    //                     );
    //                     this.handleLogin(res.data);
    //                 }
    //             },
    //             error: (err) => {
    //                 this.spinner.hide();
    //                 const errorMsg =
    //                     err.error?.message || 'فشل تسجيل الدخول عبر Google';
    //                 this.toastr.error(errorMsg, 'خطأ');
    //                 console.error('Google Sign-In Error:', err);
    //             },
    //         });
    //     } catch (error) {
    //         this.spinner.hide();
    //         this.toastr.error('حدث خطأ أثناء تسجيل الدخول عبر Google', 'خطأ');
    //         console.error('Error handling Google credential:', error);
    //     }
    // }
}
