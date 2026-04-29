import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,HttpErrorResponse} from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';


const AUTH_TOKEN_KEY = 'jwtToken';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    let request = req;

    if (req.headers.has('X-Skip-Auth')) {
      const cleared = req.clone({ headers: req.headers.delete('X-Skip-Auth') });
      return next.handle(cleared);
    }

    if (token && !req.headers.has('Authorization')) {
      request = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.warn('[AuthInterceptor] Session expired, redirecting to login...');

          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('activeRole');

          this.router.navigate(['/login'], { queryParams: { expired: true } });
        }
        return throwError(() => error);
      })
    );
  }
}

