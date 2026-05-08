import { Component, NgZone, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleService, SaleDTO } from '../../services/sale.service';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-compras-client',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="admin-page compras-page">
      <header class="admin-header">
        <h2>Mis compras</h2>
      </header>
      <div class="admin-container">
        <div *ngIf="loading">Cargando compras...</div>
        <div *ngIf="!loading && sales.length === 0">No tenés compras todavía.</div>

        <div *ngIf="!loading && sales.length > 0" class="purchases-list">
          <article *ngFor="let s of sales" class="purchase-card" [ngClass]="'status-' + s.status?.toLowerCase()">
            <div class="purchase-grid">

              <div class="purchase-meta">
                <div class="order-number">Pedido #{{ s.id }}</div>
                <div class="order-date">{{ s.date | date:'short' }}</div>
                <div class="order-total">Total: $ {{ getSaleTotal(s) }}</div>
              </div>

              <div class="purchase-status-info">
                <div class="status-badge" [ngClass]="s.status">
                  {{ getStatusLabel(s.status) }}
                </div>

                <div *ngIf="s.status === 'AWAITING_PAYMENT'" class="timer-box">
                  <span class="timer-icon">⏳</span>
                  <span class="timer-text">{{ getRemainingTime(s) }}</span>
                  <div class="action-buttons">
                    <button class="btn-pay" (click)="payNow(s.id)">Pagar con BTC</button>
                  </div>
                </div>
              </div>

              <div class="purchase-items">
                <ul>
                  <li *ngFor="let it of getSaleSummary(s)" class="sale-item">
                    <div class="item-name">{{ it.book.name }}</div>
                    <div class="item-qty">x{{ it.quantity }}</div>
                    <div class="item-sub">$ {{ it.subtotal }}</div>
                  </li>
                </ul>
              </div>

            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./compras-client.css'],
})
export class ComprasClientComponent implements OnInit, OnDestroy {
  sales: SaleDTO[] = [];
  loading = false;
  private orchestratorUrl = 'http://localhost:8081';
  private timerSub?: Subscription;

  constructor(
    private saleService: SaleService,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadSales();
    this.timerSub = interval(1000).subscribe(() => this.cd.detectChanges());
  }

  ngOnDestroy(): void {
    if (this.timerSub) this.timerSub.unsubscribe();
  }

  loadSales(): void {
    this.loading = true;
    this.saleService.getAll().subscribe({
      next: (list: any[]) => {
        this.zone.run(() => {
          this.sales = list || [];
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Failed to load sales', err);
        this.loading = false;
      }
    });
  }


  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'AWAITING_PAYMENT': return 'Esperando pago';
      case 'PAID': return 'Pagado';
      case 'EXPIRED': return 'Expirado';
      default: return status || 'Pendiente';
    }
  }

  getRemainingTime(sale: any): string {
    if (!sale.expiresAt) return '15:00';

    const now = new Date().getTime();
    const expiry = new Date(sale.expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      sale.status = 'EXPIRED';
      return '00:00';
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  payNow(orderId: number) {
    this.http.post(`${this.orchestratorUrl}/api/payment/mock-pay/${orderId}`, {}).subscribe({
      next: () => {
        alert('¡Pago simulado con éxito!');
        this.loadSales();
      },
      error: (err) => console.error('Error al simular pago', err)
    });
  }

  checkStatus(orderId: number) {
    console.log('Manual status check for order:', orderId);
  }

  getSaleSummary(sale: SaleDTO): any[] {
    const map = new Map<number, any>();
    if (!sale || !sale.books) return [];
    for (const b of sale.books) {
      if (!b || b.id == null) continue;
      const id = b.id as number;
      const price = Number(b.price || 0);
      if (!map.has(id)) {
        map.set(id, { book: b, quantity: 1, subtotal: price });
      } else {
        const it = map.get(id)!;
        it.quantity += 1;
        it.subtotal = Math.round((it.subtotal + price) * 100) / 100;
      }
    }
    return Array.from(map.values());
  }

  getSaleTotal(sale: SaleDTO): number {
    return this.getSaleSummary(sale).reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
  }
}
