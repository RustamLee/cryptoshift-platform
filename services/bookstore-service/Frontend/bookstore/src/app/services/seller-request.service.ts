import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SellerRequestDTO {
  id?: number;
  userId?: number;
  userName?: string;
  businessName: string;
  cuit: string;
  address: string;
  status?: string;
  rejectionReason?: string;
  createdDate?: string;
  updatedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerRequestService {
  private base = '/api/seller-requests';

  constructor(private http: HttpClient) {}

  createRequest(dto: Omit<SellerRequestDTO, 'id' | 'userId' | 'status' | 'createdDate'>): Observable<SellerRequestDTO> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<SellerRequestDTO>(this.base, dto, { headers });
  }

  getCurrentUserRequest(): Observable<SellerRequestDTO> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<SellerRequestDTO>(`${this.base}/me/current`, { headers });
  }

  getAllRequests(): Observable<SellerRequestDTO[]> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<SellerRequestDTO[]>(`${this.base}/all`, { headers });
  }

  getPendingRequests(): Observable<SellerRequestDTO[]> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<SellerRequestDTO[]>(`${this.base}/pending`, { headers });
  }

  getRequestById(id: number): Observable<SellerRequestDTO> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<SellerRequestDTO>(`${this.base}/${id}`, { headers });
  }

  approveRequest(id: number): Observable<SellerRequestDTO> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.put<SellerRequestDTO>(`${this.base}/${id}/approve`, {}, { headers });
  }

  rejectRequest(id: number, reason: string): Observable<SellerRequestDTO> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.put<SellerRequestDTO>(`${this.base}/${id}/reject`, { reason }, { headers });
  }

  withdrawRequest(id: number): Observable<void> {
    const token = localStorage.getItem('jwtToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete<void>(`${this.base}/${id}/withdraw`, { headers });
  }
}
