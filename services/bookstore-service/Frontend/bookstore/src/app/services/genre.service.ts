import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GenreDTO {
  id?: number;
  name: string;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class GenreService {
  private base = '/api/genres';

  constructor(private http: HttpClient) {}

  getAll(): Observable<GenreDTO[]> {
    return this.http.get<GenreDTO[]>(this.base);
  }

  getAllPublic(): Observable<GenreDTO[]> {
    const headers = { 'X-Skip-Auth': 'true' } as any;
    return this.http.get<GenreDTO[]>(this.base, { headers });
  }

  create(payload: { name: string; description?: string }): Observable<GenreDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<GenreDTO>(this.base, payload, headers ? { headers } : {});
  }

  update(id: number, payload: { name: string; description?: string }): Observable<GenreDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<GenreDTO>(`${this.base}/${id}`, payload, headers ? { headers } : {});
  }

  delete(id: number): Observable<void> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.base}/${id}`, headers ? { headers } : {});
  }
}
