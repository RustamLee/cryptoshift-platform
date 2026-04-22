import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BookDTO } from  './book.service';

@Injectable({ providedIn: 'root'})
export class CartService {
  private base = '/api/books';
  private cartSubject = new BehaviorSubject<BookDTO[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService, private zone: NgZone){
    try {
      const token = this.auth.getAuthToken();
      if (token) {
        this.getCart().subscribe({ next: (items) => this.runNext(items || []), error: () => {} });
      }
    } catch (e) {}
  }

  addToCart(bookId: number, cant: number): Observable<BookDTO[]>{
    const token = this.auth.getAuthToken();
    if (token) {
      return this.http.put<BookDTO[]>(`${this.base}/add/${bookId}`, cant, { headers: { Authorization: `Bearer ${token}` } }).pipe(
        tap(items => this.runNext(items || [])),
        catchError(err => {
          console.error('addToCart failed', err);
          return of([] as BookDTO[]);
        })
      );
    }
    return this.http.put<BookDTO[]>(`${this.base}/add/${bookId}`, cant).pipe(
    tap(items => this.runNext(items || [])),
      catchError(err => {
        console.error('addToCart failed', err);
        return of([] as BookDTO[]);
      })
    );
  }

  removeFromCart(bookId: number, cant: number): Observable<BookDTO[]>{
    const token = this.auth.getAuthToken();
    if (token) {
      return this.http.put<BookDTO[]>(`${this.base}/remove/${bookId}`, cant, { headers: { Authorization: `Bearer ${token}` } }).pipe(
        tap(items => this.runNext(items || [])),
        catchError(err => {
          console.error('removeFromCart failed', err);
          return of([] as BookDTO[]);
        })
      );
    }
    return this.http.put<BookDTO[]>(`${this.base}/remove/${bookId}`, cant).pipe(
      tap(items => this.runNext(items || [])),
      catchError(err => {
        console.error('removeFromCart failed', err);
        return of([] as BookDTO[]);
      })
    );
  }

  getCart(): Observable<BookDTO[]>{
    const token = this.auth.getAuthToken();
    if (token) {
      return this.http.get<BookDTO[]>(`${this.base}/cart`, { headers: { Authorization: `Bearer ${token}` } }).pipe(
        tap(items => this.runNext(items || [])),
        catchError(err => {
          console.error('getCart failed', err);
          return of([] as BookDTO[]);
        })
      );
    }
    return this.http.get<BookDTO[]>(`${this.base}/cart`).pipe(
      tap(items => this.runNext(items || [])),
      catchError(err => {
        console.error('getCart failed', err);
        return of([] as BookDTO[]);
      })
    );
  }

  setLocalCart(items: BookDTO[]) {
    try { this.runNext(items || []); } catch (e) {}
  }

  private runNext(items: BookDTO[]) {
    try {
      this.zone.run(() => { this.cartSubject.next(items || []); });
    } catch (e) {
      try { this.cartSubject.next(items || []); } catch (err) {}
    }
  }
}
