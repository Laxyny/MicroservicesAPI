import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class SellerGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authService.getUser().then((user: any) => {
            if (user && (user.role === 'seller' || user.role === 'admin')) {
                return true;
            } else {
                this.router.navigate(['/homepage']);
                return false;
            }
        }).catch(err => {
            this.router.navigate(['/homepage']);
            return false;
        });
    }
}
