// import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
// import { inject } from '@angular/core';
// import { AuthService } from '../services/authr/auth.service';
// import { map } from 'rxjs';

// // export const canActivateAdminGuard: CanActivateFn = (route, state) => {
 
// // };
// export const canActivateAdminGuard: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ) => {
//  const authService = inject(AuthService);
//   const router = inject(Router);
//   return authService.currentUser.pipe(
//     map(user => {
//       if (user && user.role === 'admin') {
//         return true;
//       } else {
//         authService.logout();
//         return router.createUrlTree(['/login']);
//       }
//     })
//   );
// };
import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/authr/auth.service';
import { currentUser } from '../constants/apiConstants';

export const canActivateAdminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  let user = authService.getCurrentUser();
  if (user && user.roles.includes('Admin')) {
    return true;
  } else {
    authService.logout();
    return false;
  }
};