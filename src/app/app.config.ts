import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error';
import { AuthInterceptor } from './interceptors/languageInterceptor';
// import { AuthInterceptor } from './interceptors/languageInterceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes,withHashLocation()),
        provideClientHydration(),
        provideAnimationsAsync(),

        provideHttpClient(withInterceptorsFromDi(), withInterceptors([AuthInterceptor])),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true,
        },
        importProvidersFrom([
            ToastrModule.forRoot({
                timeOut: 3000,
                positionClass: 'toast-top-right',
                preventDuplicates: true,
            }),
            NgxSpinnerModule.forRoot({ type: 'cube-transition' }),
        ])
    ],
    
    
};
