import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SellerProfileDTOFull, SellerProfileService } from '../../services/seller-profile.service';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SellerResolver implements Resolve<SellerProfileDTOFull | null> {
  constructor(private sellerService: SellerProfileService, private auth: AuthService) {}

  resolve(): Observable<SellerProfileDTOFull | null> {
    try {
      return this.auth.me().pipe(
        map((user: any) =>
          user && user.sellerProfile ? (user.sellerProfile as SellerProfileDTOFull) : null
        ),
        catchError(() => this.sellerService.getMySellerProfile().pipe(catchError(() => of(null))))
      );
    } catch (e) {
      return this.sellerService.getMySellerProfile().pipe(catchError(() => of(null)));
    }
  }
}
