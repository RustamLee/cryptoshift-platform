import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface SaleDTO { id: number; date?: string; user?: any; card?: any; books?: any[]; expiresAt: string; status: string; }

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private base = '/api/orders';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SaleDTO[]> {
    return this.http.get<SaleDTO[]>(this.base);
  }

  create(paymentMethod: string): Observable<SaleDTO> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let url = `${this.base}?paymentMethod=${paymentMethod}`;

    return this.http.post<SaleDTO>(url, {}, { headers });
  }
}
