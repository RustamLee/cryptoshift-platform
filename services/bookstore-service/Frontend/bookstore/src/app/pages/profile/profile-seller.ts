import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SellerProfileDTOFull, SellerProfileService } from '../../services/seller-profile.service';
import { AuthService, UserDTO } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile-seller',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="profile-title"><h2>Perfil del Vendedor</h2></header>
    @if (showProfileDetails) {
    <div class="profile-details">
      @if (seller) {
      <div class="profile-email-row">
        <p class="seller-detail-item"><strong>Nombre de empresa:</strong> {{ seller.name }}</p>
        <button class="edit-email" title="Editar" (click)="openEditModal()">
          <i class="ri-edit-line"></i>
        </button>
      </div>
      <div class="profile-email-row">
        <p class="seller-detail-item"><strong>Direccion:</strong> {{ seller.address }}</p>
        <button class="edit-email" title="Editar" (click)="openEditModal()">
          <i class="ri-edit-line"></i>
        </button>
      </div>
      <div class="profile-email-row">
        <p class="seller-detail-item"><strong>Número de AFIP:</strong> {{ seller.afipNumber }}</p>
        <button class="edit-email" title="Editar" (click)="openEditModal()">
          <i class="ri-edit-line"></i>
        </button>
      </div>
      <div class="profile-email-row">
        <p class="seller-detail-item"><strong>Inventario:</strong> {{ inventoryCount }} items</p>
      </div>
      }
    </div>
    } @if (showEditModal) {
    <div class="modal" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" aria-label="Cerrar" (click)="closeEditModal()">×</button>
        <h3>Editar datos del vendedor</h3>
        <div class="modal-field">
          <label for="editSellerName">Nombre de empresa</label>
          <input id="editSellerName" [(ngModel)]="editName" [disabled]="isSavingSeller" />
          @if (editName && editName.trim().length > 0 && editName.trim().length < 6) {
          <div class="field-hint">Nombre debe tener al menos 6 символов.</div>
          }
        </div>
        <div class="modal-field">
          <label for="editSellerAddress">Dirección</label>
          <input id="editSellerAddress" [(ngModel)]="editAddress" [disabled]="isSavingSeller" />
          @if (editAddress && editAddress.trim().length > 0 && editAddress.trim().length < 6) {
          <div class="field-hint">Dirección debe tener al menos 6 символов.</div>
          }
        </div>
        <div class="modal-field">
          <label for="editSellerAfip">Número de AFIP</label>
          <input
            id="editSellerAfip"
            [(ngModel)]="editAfipNumber"
            maxlength="13"
            inputmode="numeric"
            (beforeinput)="onBeforeInputAfip($event)"
            (input)="onAfipNumberInput($event)"
            (keydown)="allowDigitKeydown($event)"
            (paste)="onPasteAfip($event)"
            (blur)="onBlur('afip')"
            (focus)="onFocus('afip')"
            [disabled]="isSavingSeller"
          />
          <div class="field-hint">Formato: XX-XXXXXXXX-X</div>
          @if (afipTouched && !isAfipNumberValid(_afipDigits)) {
          <div class="field-error">Número inválido — debe tener exactamente 11 dígitos.</div>
          }
        </div>
        <div class="modal-actions">
          <button
            class="btn-primary"
            (click)="submitEdit()"
            [disabled]="
              isSavingSeller ||
              !editName.trim() ||
              !editAddress.trim() ||
              editName.trim().length < 6 ||
              editAddress.trim().length < 6 ||
              !isAfipNumberValid(_afipDigits)
            "
          >
            Guardar
          </button>
          <button class="btn-secondary" (click)="closeEditModal()" [disabled]="isSavingSeller">
            Cancelar
          </button>
        </div>
        @if (sellerUpdateError) {
        <div class="error">{{ sellerUpdateError }}</div>
        }
      </div>
    </div>
    }

    <router-outlet></router-outlet>
  `,
})
export class ProfileSellerComponent implements OnInit, OnDestroy {
  private userSub: any = null;
  private fetchingSeller = false;

  ngOnInit(): void {
    this.userSub = this.auth.currentUser$.subscribe((u) => {
      if (!u) return;
      const s = u.sellerProfile as any;

      const booksArr = Array.isArray(s?.books) ? s.books : [];
      const invArr = Array.isArray(s?.inventory) ? s.inventory : [];

      const itemsHaveCounts = (arr: any[]): boolean => {
        if (!arr || arr.length === 0) return false;
        return arr.some((item) => {
          if (item == null) return false;
          if (typeof item === 'number') return true;
          if (item.stock !== null && item.stock !== undefined) return true;
          if (item.quantity !== null && item.quantity !== undefined) return true;
          if (item.units !== null && item.units !== undefined) return true;
          return false;
        });
      };

      const hasAnyArr = booksArr.length > 0 || invArr.length > 0;
      const booksHaveCounts = itemsHaveCounts(booksArr);
      const invHaveCounts = itemsHaveCounts(invArr);

      const shouldFetch =
        !this.fetchingSeller &&
        (!hasAnyArr ||
          (booksArr.length > 0 && !booksHaveCounts) ||
          (invArr.length > 0 && !invHaveCounts));

      if (s && shouldFetch) {
        this.fetchingSeller = true;
        this.sellerService
          .getMySellerProfile()
          .pipe(finalize(() => (this.fetchingSeller = false)))
          .subscribe({
            next: (res) => {
              const current = this.auth.user;
              if (current) {
                const updated: UserDTO = { ...current, sellerProfile: res };
                this.auth.setCurrentUser(updated);
              }
            },
            error: () => {},
          });
      }
    });
  }

  ngOnDestroy(): void {
    try {
      if (this.userSub && typeof this.userSub.unsubscribe === 'function')
        this.userSub.unsubscribe();
    } catch (e) {}
  }
  get seller(): SellerProfileDTOFull | null {
    const u = this.auth.user;
    return u && u.sellerProfile ? (u.sellerProfile as SellerProfileDTOFull) : null;
  }
  get inventoryCount(): number {
    const s = this.seller as any;
    if (!s) return 0;

    const arr = Array.isArray(s.books) ? s.books : Array.isArray(s.inventory) ? s.inventory : [];
    let total = 0;
    for (const item of arr) {
      if (item == null) continue;
      if (typeof item === 'number') {
        total += item;
        continue;
      }
      if (typeof item.quantity === 'number') {
        total += item.quantity;
        continue;
      }
      if (typeof item.stock === 'number') {
        total += item.stock;
        continue;
      }
      if (typeof item.units === 'number') {
        total += item.units;
        continue;
      }
      const candidate = item.quantity ?? item.stock ?? item.units ?? item.qty ?? item.count;
      const n = Number(candidate);
      if (!isNaN(n)) total += n;
    }
    return total;
  }
  showEditModal = false;
  editName = '';
  editAddress = '';
  editAfipNumber = '';
  afipTouched = false;
  dirtyAfip = false;
  focusedAfip = false;
  isSavingSeller = false;
  sellerUpdateError: string | null = null;

  constructor(
    private sellerService: SellerProfileService,
    private auth: AuthService,
    private router: Router
  ) {}

  get isCatalogRoute(): boolean {
    try {
      return !!(
        this.router &&
        this.router.url &&
        this.router.url.includes('/profile/seller/catalog')
      );
    } catch (e) {
      return false;
    }
  }

  get showProfileDetails(): boolean {
    try {
      const url = this.router && this.router.url ? this.router.url : '';
      if (url.includes('/profile/seller/')) return false;
      return url === '/profile/seller' || url === '/profile/seller/';
    } catch (e) {
      return false;
    }
  }

  openEditModal(): void {
    const s = this.seller;
    if (s) {
      this.editName = s.name || '';
      this.editAddress = s.address || '';
      this.editAfipNumber = this.formatDisplayEditableAfip(s.afipNumber || '');
    }
    this.afipTouched = false;
    this.sellerUpdateError = null;
    this.showEditModal = true;
  }

  formatDisplayEditableAfip(raw?: string): string {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  }

  closeEditModal(): void {
    if (this.isSavingSeller) return;
    this.showEditModal = false;
  }

  submitEdit(): void {
    if (!this.editName || this.editName.trim().length < 6) {
      this.sellerUpdateError = 'Nombre de empresa debe tener al menos 6 символов.';
      return;
    }
    if (!this.editAddress || this.editAddress.trim().length < 6) {
      this.sellerUpdateError = 'Dirección debe tener al menos 6 символов.';
      return;
    }
    if (!this.isAfipNumberValid(this._afipDigits)) {
      this.sellerUpdateError = 'El número de AFIP debe tener 11 dígitos (formato XX-XXXXXXXX-X).';
      return;
    }
    this.isSavingSeller = true;
    this.sellerUpdateError = null;
    this.sellerService
      .updateSellerProfile({
        name: this.editName.trim(),
        address: this.editAddress.trim(),
        afipNumber: this._afipDigits.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3')
      })
      .pipe(finalize(() => (this.isSavingSeller = false)))
      .subscribe({
        next: (res: SellerProfileDTOFull) => {
          const current = this.auth.user;
          if (current) {
            const updated: UserDTO = { ...current, sellerProfile: res };
            this.auth.setCurrentUser(updated);
          }
          this.showEditModal = false;
        },
        error: (_err) => {
          this.sellerUpdateError = 'Error al actualizar datos del vendedor';
        },
      });
  }

  get _afipDigits(): string {
    return (this.editAfipNumber || '').replace(/\D/g, '');
  }

  onAfipNumberInput(e: any): void {
    try {
      this.onInput('afip');
      const raw = e?.target?.value ?? '';
      const digits = String(raw).replace(/\D/g, '').slice(0, 11);
      const formatted = this.formatAfipNumber(digits);
      this.editAfipNumber = formatted;
      try {
        const inputEl = e?.target as HTMLInputElement | null;
        if (inputEl) inputEl.value = formatted;
      } catch (err) {}
    } catch (err) {}
  }

  formatAfipNumber(digits: string): string {
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  }

  onBeforeInputAfip(e: InputEvent): void {
    try {
      const data = (e as any).data || '';
      if (!data) return;
      if (/\D/.test(String(data))) {
        e.preventDefault();
      }
    } catch (err) {}
  }

  onPasteAfip(e: ClipboardEvent): void {
    try {
      const text = e.clipboardData?.getData('text') || '';
      const digits = text.replace(/\D/g, '').slice(0, 11);
      if (digits.length === 0) {
        e.preventDefault();
        return;
      }
      const formatted = this.formatAfipNumber(digits);
      e.preventDefault();
      this.editAfipNumber = formatted;
      try {
        const input = document.activeElement as HTMLInputElement | null;
        if (input && input.id === 'editSellerAfip') input.value = formatted;
      } catch (err) {}
      this.onInput('afip');
    } catch (err) {}
  }

  allowDigitKeydown(e: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
    if (allowedKeys.indexOf(e.key) !== -1) return;
    if (e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  }

  onInput(field: string): void {
    if (field === 'afip') {
      this.dirtyAfip = true;
    }
  }

  onBlur(field: string): void {
    if (field === 'afip') {
      if (this.dirtyAfip || this.focusedAfip) this.afipTouched = true;
      this.focusedAfip = false;
    }
  }

  onFocus(field: string): void {
    if (field === 'afip') {
      this.focusedAfip = true;
    }
  }

  isAfipNumberValid(digits?: string): boolean {
    if (!digits) return false;
    return digits.length === 11;
  }
}
