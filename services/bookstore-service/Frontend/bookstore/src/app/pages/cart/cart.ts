import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {BookDTO} from '../../services/book.service';
import {CartService} from '../../services/cart.service';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog';
import {SaleService} from '../../services/sale.service';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {PaymentService} from '../../services/payment.service';

interface CartSummaryItem {
  book: BookDTO;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class CartComponent {
  cartItems: BookDTO[] = [];
  paymentMode = false;
  loading = false;
  errorMessage: string | null = null;
  confirmVisible = false;
  confirmLoading = false;
  confirmError: string | null = null;
  confirmTitle = 'Confirmar pago';
  confirmMessage = '';

  constructor(
    private cartService: CartService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
    , private saleService: SaleService
    , private router: Router
    , private auth: AuthService
    , private paymentService: PaymentService
  ) {
  }


  paymentMethod =  'CRYPTO';

  ngOnInit(): void{
    this.loadCart()
    try {
      this.cartService.cart$.subscribe(items => {
        this.zone.run(() => {
          this.cartItems = items || [];
          try { this.cd.detectChanges(); } catch(e){}
        });
      });
    } catch (e) {}
  }

  loadCart(): void {
    this.loading = true
    this.cartService.getCart().subscribe({
      next: (item) => {
        this.zone.run(() => {
          const arr = item || [];
          if (arr.length && (arr[0] as any).book !== undefined) {
            this.cartItems = arr.map((i: any) => i.book as BookDTO).filter(Boolean);
          } else {
            this.cartItems = arr as BookDTO[];
          }
          this.loading = false;
          this.errorMessage = null;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      },
      error: (err: any) => {
        console.error('Failed to load cart items', err);
        this.zone.run(() => {
          this.loading = false;
          this.errorMessage = 'Error al cargar el carrito. Ver consola para más detalles.';
          try {
            this.cd.detectChanges();
          } catch (e) {
          }
        });
      }
    })
  }


  onStartPayment(): void {
    this.paymentMode = true;
    try {
    } catch (e) {
    }
  }

  onConfirmPayment(): void {
    this.paymentMethod = 'CRYPTO';
    this.confirmMessage = `Vas a generar una factura de Bitcoin por $${this.getTotalPrice()}. El precio se mantendrá por 15 minutos. ¿Confirmás?`;
    this.confirmError = null;
    this.confirmVisible = true;
  }

  openConfirmDialog(): void {
    this.onConfirmPayment();
  }

  onDialogConfirm(): void {

    this.confirmLoading = true;
    this.confirmError = null;

    const ensureToken = (): void => {
      const token = this.auth.getAuthToken();

      if (!token) {
        this.auth.me().subscribe({
          next: () => {
            this.processPayment();
          },
          error: (err) => {
            this.zone.run(() => {
              this.confirmLoading = false;
              this.cd.detectChanges();
            });
          }
        });
      } else {
        this.processPayment();
      }
    };

    ensureToken();
  }

  private processPayment(): void {

    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        this.zone.run(() => {
          this.confirmLoading = false;
          this.confirmVisible = false;
          this.confirmError = 'El servidor no responde. Intente nuevamente.';
          this.cd.detectChanges();
        });
      }
    }, 10000);

    this.saleService.create(this.paymentMethod).subscribe({
      next: (sale) => {
        finished = true;
        clearTimeout(timeout);

        this.zone.run(() => {
          console.log('⏳ Задержка 1.8 сек перед закрытием диалога...');
          setTimeout(() => {
            console.log('🔄 Закрытие диалога, сброс состояния');
            this.confirmLoading = false;
            this.confirmVisible = false;
            this.paymentMode = false;

            try {
              this.cartService.setLocalCart([]);
            } catch (e) {
              console.error('Ошибка setLocalCart:', e);
            }
            try {
              this.cartService.getCart().subscribe();
            } catch (e) {
              console.error('Ошибка getCart:', e);
            }
            this.cd.detectChanges();

            console.log('📄 Получение инвойса для ID:', sale.id);
            this.paymentService.getInvoiceByOrderId(sale.id).subscribe({
              next: (invoice) => {
                console.log('✅ Инвойс получен:', invoice);
                console.log('🔀 Навигация на /payment/' + invoice.id);
                this.router.navigate(['/payment', invoice.id]);
              },
              error: (err) => {
                this.router.navigate(['/profile', 'client', 'compras']);
              }
            });
          }, 1800);
        });
      },
      error: (err) => {
        finished = true;
        clearTimeout(timeout);

        this.zone.run(() => {
          this.confirmLoading = false;
          this.confirmError = 'Error al procesar el pago. Intente nuevamente.';
          this.cd.detectChanges();
        });
      }
    });
  }


  onDialogCancel(): void {
    this.confirmVisible = false;
    this.confirmError = null;
  }

  onCancelPayment(): void {
    this.paymentMode = false;
  }

  goToShop(): void {
    try {
      this.router.navigate(['/']);
    } catch (e) {
      console.error('Navigation to shop failed', e);
    }
  }

  getTotalPrice(): number {
    return this.getSummary().reduce((acc, it) => acc + it.subtotal, 0);
  }

  substractItemFromCart(id: any): void {
    try {
      this.zone.run(() => {
        const idx = this.cartItems.findIndex((b) => b.id === id);
        let removed: BookDTO | null = null;
        if (idx !== -1) {
          removed = this.cartItems.splice(idx, 1)[0];
          try {
            this.cartService.setLocalCart(this.cartItems);
          } catch (e) {
          }
          try {
            this.cd.detectChanges();
          } catch (e) {
          }
        }
        this.cartService.removeFromCart(id, 1).subscribe({
          next: () => {
          },
          error: (err) => {
            console.error('Error removing from cart', err);
            if (removed) {
              this.cartItems.splice(idx, 0, removed);
              try {
                this.cartService.setLocalCart(this.cartItems);
              } catch (e) {
              }
              try {
                this.cd.detectChanges();
              } catch (e) {
              }
            }
          }
        });
      });
    } catch (e) {
    }
  }

  addItemToCart(id: any): void {
    try {
      const currentQty = this.getBookQuantity(id);
      const book = this.cartItems.find((b) => b.id === id) as BookDTO | undefined;
      if (book && book.stock != null && currentQty >= book.stock) {
        return;
      }

      this.zone.run(() => {
        const found = this.cartItems.find((b) => b.id === id);
        let added: BookDTO | null = null;
        if (found) {
          this.cartItems.push(found);
          added = found;
        }
        try {
          this.cartService.setLocalCart(this.cartItems);
        } catch (e) {
        }
        try {
          this.cd.detectChanges();
        } catch (e) {
        }

        this.cartService.addToCart(id, 1).subscribe({
          next: () => {
          },
          error: (err) => {
            console.error('Error adding to cart', err);
            if (added) {
              const lastIdx = this.cartItems.map((b) => b.id).lastIndexOf(id);
              if (lastIdx !== -1) {
                this.cartItems.splice(lastIdx, 1);
                try {
                  this.cartService.setLocalCart(this.cartItems);
                } catch (e) {
                }
                try {
                  this.cd.detectChanges();
                } catch (e) {
                }
              }
            }
          }
        });
      });
    } catch (e) {
    }
  }

  getBookQuantity(id: any) {
    let count = 0
    this.cartItems.forEach(item => {
      if (item.id === id) count++
    })
    return count
  }

  getSummary(): CartSummaryItem[] {
    const map = new Map<number, CartSummaryItem>();
    for (const b of this.cartItems) {
      if (!b || b.id == null) continue;
      const id = b.id as number;
      if (!map.has(id)) {
        map.set(id, {book: b, quantity: 1, subtotal: (b.price ?? 0)});
      } else {
        const it = map.get(id)!;
        it.quantity += 1;
        it.subtotal = (it.book.price ?? 0) * it.quantity;
      }
    }
    return Array.from(map.values());
  }


}
