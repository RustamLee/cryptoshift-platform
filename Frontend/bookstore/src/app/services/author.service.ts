import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthorDTO {
  id?: number;
  name: string;
  birthDate?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private base = '/api/authors';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AuthorDTO[]> {
    return this.http.get<AuthorDTO[]>(this.base);
  }

  create(payload: { name: string; birthDate: string }): Observable<AuthorDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<AuthorDTO>(this.base, payload, headers ? { headers } : {});
  }

  update(id: number, payload: { name: string; birthDate: string }): Observable<AuthorDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<AuthorDTO>(`${this.base}/${id}`, payload, headers ? { headers } : {});
  }

  delete(id: number): Observable<void> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.base}/${id}`, headers ? { headers } : {});
  }

  getAllPublic(): Observable<AuthorDTO[]> {
    const headers = { 'X-Skip-Auth': 'true' } as any;
    return this.http.get<AuthorDTO[]>(this.base, { headers });
  }
}
