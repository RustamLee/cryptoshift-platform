import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_TOKEN_KEY = 'jwtToken';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      if (req.headers.has('X-Skip-Auth')) {
        const cleared = req.clone({ headers: req.headers.delete('X-Skip-Auth') });
        return next.handle(cleared);
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      console.debug('[AuthInterceptor] intercept', {
        url: req.url,
        hasAuthHeader: req.headers.has('Authorization'),
        tokenPresent: !!token,
      });
      if (token) {
        if (!req.headers.has('Authorization')) {
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          console.debug('[AuthInterceptor] attaching Authorization header for', req.url);
          return next.handle(cloned);
        }
      }
    } catch (e) {}
    return next.handle(req);
  }
}
