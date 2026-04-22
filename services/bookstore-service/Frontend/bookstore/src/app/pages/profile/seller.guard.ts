import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SellerGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.me().pipe(
      map((user) => {
        if (user?.roles?.includes('ROLE_SELLER')) return true;
        return this.router.parseUrl('/profile/client');
      }),
      catchError(() => of(this.router.parseUrl('/profile/client')))
    );
  }
}
