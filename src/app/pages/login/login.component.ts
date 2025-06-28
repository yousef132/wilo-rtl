import { Component } from '@angular/core';
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
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

@Component({
    selector: 'app-login',
    imports: [
        InnerPageBannerComponent,
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        NgxSpinnerModule,
        RouterLink
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
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
    ) {
        // this.translate.use(localStorage.getItem('lang') || 'en');
    }

    onSubmit() {
        this.loginObj.email = this.loginForm.value.email!;
        this.loginObj.password = this.loginForm.value.password!;

        this.authService.login(this.loginObj).subscribe({
            next: (res: Result<string> | undefined) => {
                if (res) {
                    this.handleLogin(res.data!);
                }
            },
            error: (err) => {
                this.errorMessage = err.error.message;
            },
        });
    }

    handleLogin(token: string) {
        //   this.cookieService.set('token', token);

        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
        }
        this.router.navigate(['/Home']);
        this.authService.isLoggedIn.next(true);
        this.authService.currentUser.next(this.authService.decodeTokenToUser());
    }
}
