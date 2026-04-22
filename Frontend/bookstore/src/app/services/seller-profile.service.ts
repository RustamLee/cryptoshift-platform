import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SellerProfileDTO {
  id?: number;
  name: string;
  address: string;
  afipNumber: string;
}

export interface SellerProfileDTOFull extends SellerProfileDTO {
  inventory?: any[];
  books?: any[];
}

@Injectable({ providedIn: 'root' })
export class SellerProfileService {
  private base = '/api/sellerProfiles';

  constructor(private http: HttpClient, private auth: AuthService) {}

  createSellerProfile(dto: { name: string; address: string; afipNumber: string }): Observable<SellerProfileDTO> {
    const token = this.auth.getAuthToken();
    if (token) {
      return this.http.post<SellerProfileDTO>(this.base, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return this.http.post<SellerProfileDTO>(this.base, dto);
  }

  getMySellerProfile(): Observable<SellerProfileDTOFull> {
    const token = this.auth.getAuthToken();
    if (token) {
      return this.http.get<SellerProfileDTOFull>(`${this.base}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return this.http.get<SellerProfileDTOFull>(`${this.base}/me`);
  }

  updateSellerProfile(dto: { name?: string; address?: string; afipNumber?: string }): Observable<SellerProfileDTO> {
    const token = this.auth.getAuthToken();
    if (token) {
      return this.http.put<SellerProfileDTO>(`${this.base}/update`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return this.http.put<SellerProfileDTO>(`${this.base}/update`, dto);
  }
}
