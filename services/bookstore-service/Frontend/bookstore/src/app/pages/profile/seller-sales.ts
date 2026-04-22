import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerProfileService } from '../../services/seller-profile.service';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-seller-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-sales.html',
  styleUrls: ['./seller-sales.css'],
})
export class SellerSalesComponent {
  profile: any = null;
  loading = false;
  loadingSales = false;
  sellerSales: any[] = [];

  constructor(
    private sellerService: SellerProfileService,
    private saleService: SaleService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.sellerService.getMySellerProfile().subscribe({
      next: (p: any) => {
        this.zone.run(() => {
          let prof: any = p || null;
          try {
            if (prof && prof.sellerProfile) prof = prof.sellerProfile;
          } catch (e) {}
          if (prof) prof.inventory = prof.inventory || prof.books || [];
          this.profile = prof;
          this.loading = false;
          try { this.cd.detectChanges(); } catch (e) {}
          try { this.loadSalesForSeller(); } catch (e) {}
        });
      },
      error: (err: any) => {
        console.error('Failed to load seller profile', err);
        this.zone.run(() => {
          this.loading = false;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      }
    });
  }

  loadSalesForSeller(): void {
    if (!this.profile) {
    }
    this.loadingSales = true;
    this.saleService.getAll().subscribe({
      next: (list: any[]) => {
        this.zone.run(() => {
          try {
            const inventoryIds = new Set((this.profile?.inventory || []).map((b: any) => Number(b.id)));
            this.sellerSales = (list || []).filter((sale: any) => {
              if (!sale?.books) return false;
              return sale.books.some((b: any) => inventoryIds.has(Number(b.id)));
            });
          } catch (e) {
            this.sellerSales = [];
          }
          this.loadingSales = false;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      },
      error: (err: any) => {
        console.error('Failed to load sales', err);
        this.zone.run(() => {
          this.loadingSales = false;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      }
    });
  }

  getSaleTotal(sale: any): number {
    if (!sale || !sale.books) return 0;
    return sale.books.reduce((acc: number, b: any) => acc + Number(b.price || 0), 0);
  }

  getSaleSummary(sale: any): Array<{ book: any; quantity: number; subtotal: number }> {
    const map = new Map<number, { book: any; quantity: number; subtotal: number }>();
    if (!sale || !sale.books) return [];
    for (const b of sale.books) {
      if (!b || b.id == null) continue;
      const id = Number(b.id);
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
}
