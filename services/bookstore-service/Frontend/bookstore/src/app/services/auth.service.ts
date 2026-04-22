import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { SellerProfileDTOFull } from './seller-profile.service';

export interface UserDTO {
  id?: number;
  name: string;
  email?: string;
  roles?: string[];
  sellerProfile?: SellerProfileDTOFull | null;
  status?: string;
  isTemporaryPassword?: boolean;
}

const STORAGE_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'jwtToken';
const ACTIVE_ROLE_KEY = 'activeRole';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api/users';

  private currentUserSubject = new BehaviorSubject<UserDTO | null>(this.loadFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  userSignal: WritableSignal<UserDTO | null> = signal(this.loadFromStorage());
  activeRole: WritableSignal<string | null> = signal(this.loadActiveRole());

  get user(): UserDTO | null {
    return this.userSignal();
  }

  constructor(private http: HttpClient) {}

  register(name: string, password: string): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.base}/register`, { name, password }).pipe(
      tap((user) => {
        this.setCurrentUser(user);
      })
    );
  }

  login(name: string, password: string): Observable<UserDTO> {
    return this.http.post<{ token: string; user: UserDTO }>(`/api/auth/login`, { name, password }).pipe(
      tap((res) => {
        try {
          localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        } catch (e) {}
        this.setCurrentUser(res.user);
      }),
      map((res) => res.user)
    );
  }

  me(): Observable<UserDTO> {
    const token = this.loadAuthToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    try {
      return this.http.get<UserDTO>(`${this.base}/me`, headers ? { headers } : {}).pipe(
        tap((user) => this.setCurrentUser(user)),
        catchError(() => of(null as any))
      );
    } catch (e) {
      return of(null as any);
    }
  }

  updateUser(update: {
    name?: string;
    password?: string;
    currentPassword?: string;
  }): Observable<UserDTO> {
    const token = this.loadAuthToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http
      .put<UserDTO>(`${this.base}/update`, update, headers ? { headers } : {})
      .pipe(tap((user) => this.setCurrentUser(user)));
  }

  setCurrentUser(user: UserDTO | null) {
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
    try {
      const existing = this.loadActiveRole();
      if (user && user.roles && user.roles.length === 1) {
        this.setActiveRole(user.roles[0]);
      } else if (user && user.roles && user.roles.length > 1) {
        if (existing && user.roles.includes(existing)) {
          this.setActiveRole(existing);
        } else {
          this.setActiveRole(null);
        }
      } else {
        this.setActiveRole(null);
      }
    } catch (e) {}
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {}
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  logout() {
    this.setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(ACTIVE_ROLE_KEY);
      this.activeRole.set(null);
    } catch (e) {}
  }

  private loadFromStorage(): UserDTO | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserDTO) : null;
    } catch (e) {
      return null;
    }
  }

  private loadAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  getAuthToken(): string | null {
    return this.loadAuthToken();
  }

  private loadActiveRole(): string | null {
    try {
      const raw = localStorage.getItem(ACTIVE_ROLE_KEY);
      return raw ? raw : null;
    } catch (e) {
      return null;
    }
  }

  getActiveRole(): string | null {
    return this.activeRole();
  }

  setActiveRole(role: string | null) {
    try {
      if (role) {
        localStorage.setItem(ACTIVE_ROLE_KEY, role);
      } else {
        localStorage.removeItem(ACTIVE_ROLE_KEY);
      }
    } catch (e) {}
    this.activeRole.set(role);
  }
}
