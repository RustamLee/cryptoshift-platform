import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private orchestratorUrl = 'http://localhost:8081/api/payments';

  constructor(private http: HttpClient) {}

  getInvoice(id: string): Observable<any> {
    return this.http.get(`${this.orchestratorUrl}/${id}`);
  }

  confirmPayment(id: string): Observable<any> {
    return this.http.post(`${this.orchestratorUrl}/mock-pay/${id}`, {});
  }

  getInvoiceByOrderId(orderId: number): Observable<any> {
    return this.http.get(`${this.orchestratorUrl}/by-order/${orderId}`);
  }
}
