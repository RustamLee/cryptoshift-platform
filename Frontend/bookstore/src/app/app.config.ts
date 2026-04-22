import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      const http = inject(HttpClient);

      try {
        const token = localStorage.getItem('jwtToken');
        if (token) {
          return firstValueFrom(auth.me().pipe(catchError(() => of(null as any))));
        }
      } catch (e) {}

      try {
        const basic = localStorage.getItem('basicAuth');
        if (!basic) {
          auth.setCurrentUser(null);
          return Promise.resolve(null as any);
        }

        let decoded: string;
        try {
          decoded = atob(basic);
        } catch (e) {
          localStorage.removeItem('basicAuth');
          auth.setCurrentUser(null);
          return Promise.resolve(null as any);
        }

        const parts = decoded.split(':');
        const name = parts[0];
        const password = parts.slice(1).join(':');
        if (!name || !password) {
          localStorage.removeItem('basicAuth');
          auth.setCurrentUser(null);
          return Promise.resolve(null as any);
        }

        return firstValueFrom(
          http.post<{ token: string; user: any }>(`/api/auth/login`, { name, password }).pipe(
            catchError(() => of(null as any))
          )
        ).then((res) => {
          try {
            if (res && res.token) {
              localStorage.setItem('jwtToken', res.token);
              auth.setCurrentUser(res.user);
            }
          } finally {
            localStorage.removeItem('basicAuth');
          }
          return res?.user ?? null;
        });
      } catch (e) {
        try {
          localStorage.removeItem('basicAuth');
        } catch (ex) {}
        auth.setCurrentUser(null);
        return Promise.resolve(null as any);
      }
    }),
  ],
};
