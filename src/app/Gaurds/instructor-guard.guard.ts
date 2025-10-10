import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/authr/auth.service';

export const instructorGuard: CanActivateFn = (route, state) => {
 const authService = inject(AuthService);
  let user = authService.getCurrentUser();
  if (user && user.roles.includes('Coach')) {
    return true;
  } else {
    authService.logout();
    return false;
  }};
