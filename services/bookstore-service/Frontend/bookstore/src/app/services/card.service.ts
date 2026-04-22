import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CardDTO {
  id?: number;
  cardNumber: string;
  bank: string;
  cvv: string;
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private base = '/api/cards';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CardDTO[]> {
    return this.http.get<CardDTO[]>(this.base);
  }

  create(payload: { cardNumber: string; bank: string; cvv: string; owner?: { id?: number } }): Observable<CardDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<CardDTO>(this.base, payload, headers ? { headers } : {});
  }

  update(id: number, payload: { cardNumber: string; bank: string; cvv: string; owner?: { id?: number } }): Observable<CardDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<CardDTO>(`${this.base}/${id}`, payload, headers ? { headers } : {});
  }

  delete(id: number): Observable<void> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.base}/${id}`, headers ? { headers } : {});
  }
}
