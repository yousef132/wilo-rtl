import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {


    const platformId = inject(PLATFORM_ID);

    let token: string | null = null;
  
    if (isPlatformBrowser(platformId)) {
      token = localStorage.getItem('token');
    }

    // Prepare headers
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const authReq = req.clone({
      setHeaders: headers,
    });
  
    return next(authReq);
};
