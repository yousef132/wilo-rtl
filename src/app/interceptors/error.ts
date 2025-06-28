import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse,
    HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, finalize, map, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/authr/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router
    ) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        this.spinner.show();

        return next.handle(req).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if (event.body.message && event.body.message.length > 0)
                        this.toastr.success(event.body.message);
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                debugger;
                let errorMessage = '';
                let message = error?.error?.message ?? '';
                switch (error.status) {
                   
                    case 400:
                        errorMessage = message || 'خطأ فى البيانات المرسلة';

                        break;
                    case 401:
                        errorMessage = message || 'فشل عمليه تسجيل الدخول';
                        this.authService.logout(); // Log out the user
                        break;
                    case 403:
                        errorMessage =
                            message || 'ليس لديك صلاحية للوصول إلى هذا المورد';
                        break;
                    case 404:
                        errorMessage = message || 'المورد غير موجود';
                        break;
                    case 500:
                        debugger
                        errorMessage =
                            message ||
                            'خطأ داخلي في الخادم. يرجى المحاولة لاحقًا';

                        break;
                
                }
                if (errorMessage != null && errorMessage.length > 0) {
                    this.toastr.error(errorMessage);
                    // , 'خطأ', {
                    //     timeOut: 3000,
                    //     progressBar: true,
                    // }
                }
                return throwError(() => error);
            }),

            finalize(() => {
                this.spinner.hide();
            })
        );
    }
}
