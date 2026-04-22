import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleService, SaleDTO } from '../../services/sale.service';

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
          <article *ngFor="let s of sales" class="purchase-card">
            <div class="purchase-grid">
              <div class="purchase-meta">
                <div class="order-number">Pedido #{{ s.id }}</div>
                <div class="order-date">{{ s.date }}</div>
                <div class="order-total">Total: $ {{ getSaleTotal(s) }}</div>
              </div>

              <div class="purchase-cardinfo">
                <div class="card-number">Tarjeta: **** {{ (s.card?.cardNumber || s.card?.number || '') | slice:-4 }}</div>
                <div class="card-bank">Banco: {{ s.card?.bank || s.card?.bankName || '-' }}</div>
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
export class ComprasClientComponent {
  sales: SaleDTO[] = [];
  loading = false;

  constructor(private saleService: SaleService, private zone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.saleService.getAll().subscribe({
      next: (list: SaleDTO[]) => {
        this.zone.run(() => {
          this.sales = list || [];
          this.loading = false;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      },
      error: (err: any) => {
        console.error('Failed to load sales', err);
        this.zone.run(() => {
          this.loading = false;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      }
    });
  }

  getSaleSummary(sale: SaleDTO): Array<{ book: any; quantity: number; subtotal: number }> {
    const map = new Map<number, { book: any; quantity: number; subtotal: number }>();
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
