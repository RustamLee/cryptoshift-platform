import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileTableComponent } from '../../shared/profile-table/profile-table';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { CardService } from '../../services/card.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cards-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileTableComponent, ConfirmDialogComponent],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <h2>Mis tarjetas</h2>
        <div class="admin-actions">
          <button class="btn-primary" (click)="openAdd()">Agregar tarjeta</button>
        </div>
      </header>

      <div class="admin-container">
        <app-profile-table
          [columns]="columns"
          [keys]="keys"
          [rows]="cards"
          [actionsTemplate]="cardActions"
        ></app-profile-table>

        <ng-template #cardActions let-row>
          <button class="btn-small" title="Editar" (click)="openEdit(row)">
            <i class="ri-edit-line"></i>
          </button>
          <button class="btn-small danger" title="Eliminar" (click)="deleteCard(row)">
            <i class="ri-delete-bin-5-line"></i>
          </button>
        </ng-template>
      </div>
    </section>

    @if (showModal) {
    <div class="modal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" aria-label="Cerrar" (click)="closeModal()">×</button>
        <h3>@if(editing) {Editar tarjeta} @else {Agregar tarjeta}</h3>

        <div class="modal-field">
          <label for="cardNumber">Número de tarjeta</label>
          <input
            id="cardNumber"
            name="cardNumber"
            maxlength="19"
            inputmode="numeric"
            autocomplete="cc-number"
            [(ngModel)]="cardNumber"
            (beforeinput)="onBeforeInputCard($event)"
            (input)="onCardNumberInput($event)"
            (keydown)="allowDigitKeydown($event)"
            (paste)="onPasteCardNumber($event)"
            (blur)="onBlur('card')"
            (focus)="onFocus('card')"
          />
          <div class="field-hint">Formato: 1234 5678 9012 3456</div>

@if (cardTouched && !isCardNumberValid(_cardDigits)) {
  <div class="field-error">Número inválido — debe tener exactamente 16 dígitos.</div>
}
        </div>

        <div class="modal-field">
          <label for="bank">Banco</label>
          <input
            id="bank"
            name="bank"
            [(ngModel)]="bank"
            (input)="onInput('bank')"
            (blur)="onBlur('bank')"
            (focus)="onFocus('bank')"
          />
          @if (bankTouched && !isBankValid(bank)) {
          <div class="field-error">
            Nombre del banco inválido — debe tener entre 3 y 25 caracteres.
          </div>
          }
        </div>

        <div class="modal-field">
          <label for="cvv">CVV</label>
          <input
            id="cvv"
            name="cvv"
            maxlength="3"
            inputmode="numeric"
            autocomplete="cc-csc"
            [(ngModel)]="cvv"
            (beforeinput)="onBeforeInputCvv($event)"
            (input)="onCvvInput($event)"
            (keydown)="allowDigitKeydown($event)"
            (paste)="onPasteCvv($event)"
            (blur)="onBlur('cvv')"
            (focus)="onFocus('cvv')"
          />
          @if (cvvTouched && !isCvvValid(cvv)) {
          <div class="field-error">CVV inválido — debe tener exactamente 3 dígitos.</div>
          }
        </div>

        @if (error) {
        <div class="error">{{ error }}</div>
        }

        <div class="modal-actions">
          <button class="btn-primary" (click)="submit()" [disabled]="isSaving || !formValid()">
            <span *ngIf="isSaving" class="spinner" aria-hidden="true"></span> Guardar
          </button>
          <button class="btn-secondary" (click)="closeModal()" [disabled]="isSaving">
            Cancelar
          </button>
        </div>
      </div>
    </div>
    } @if (showDeleteModal) {
    <app-confirm-dialog
      [visible]="showDeleteModal"
      [title]="'Confirmar eliminación'"
      [message]="deleteMessage"
      [errorMessage]="deleteError"
      [confirmLabel]="'Eliminar'"
      [cancelLabel]="'Cancelar'"
      [loading]="deleting"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()"
    ></app-confirm-dialog>
    }
  `,
  styleUrls: ['../../shared/profile-table/profile-table.css'],
})
export class CardsClientComponent implements OnInit {
  cards: any[] = [];
  columns: string[] = ['Número', 'Banco'];
  keys: string[] = ['maskedNumber', 'bank'];

  showModal = false;
  editing: any = null;
  cardNumber = '';
  bank = '';
  cvv = '';
  isSaving = false;
  error: string | null = null;
  cardTouched = false;
  bankTouched = false;
  cvvTouched = false;
  dirtyCard = false;
  dirtyBank = false;
  dirtyCvv = false;
  focusedCard = false;
  focusedBank = false;
  focusedCvv = false;

  showDeleteModal = false;
  deleteTarget: any = null;
  deleting = false;
  deleteMessage = '';
  deleteError: string | null = null;

  constructor(
    private cardService: CardService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    public auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.loadCards();
  }

  ngOnInit(): void {
    try {
      this.route.queryParams.subscribe((params) => {
        if (params && params['openAddCard'] && String(params['openAddCard']) === '1') {
          setTimeout(() => this.openAdd(), 0);
        }
      });
    } catch (e) {}
  }

  get _cardDigits(): string {
    return (this.cardNumber || '').replace(/\D/g, '');
  }

  loadCards(): void {
    this.cardService.getAll().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.cards = (res || []).map((c) => ({
            ...c,
            maskedNumber: this.formatDisplayCardNumber(c.cardNumber),
          }));
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: () => {
        this.zone.run(() => {
          this.cards = [];
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  formatDisplayCardNumber(raw?: string): string {
    if (!raw) return '—';
    const digits = String(raw).replace(/\D/g, '').slice(-4);
    return '•••• •••• •••• ' + digits;
  }

  openAdd(): void {
    this.editing = null;
    this.cardNumber = '';
    this.bank = '';
    this.cvv = '';
    this.error = null;
    this.cardTouched = false;
    this.bankTouched = false;
    this.cvvTouched = false;
    this.showModal = true;
  }

  openEdit(row: any): void {
    this.editing = row;
    this.cardNumber = this.formatDisplayEditableNumber(row.cardNumber || '');
    this.bank = row.bank || '';
    this.cvv = row.cvv || '';
    this.error = null;
    this.cardTouched = false;
    this.bankTouched = false;
    this.cvvTouched = false;
    this.showModal = true;
  }

  formatDisplayEditableNumber(raw?: string): string {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  onCardNumberInput(e: any): void {
    try {
      this.onInput('card');
      const raw = e?.target?.value ?? '';
      const digits = String(raw).replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      this.cardNumber = formatted;
      try {
        const inputEl = e?.target as HTMLInputElement | null;
        if (inputEl) inputEl.value = formatted;
      } catch (err) {}
    } catch (err) {}
  }

  onBeforeInputCard(e: InputEvent): void {
    try {
      const data = (e as any).data || '';
      if (!data) return;
      if (/\D/.test(String(data))) {
        e.preventDefault();
      }
    } catch (err) {}
  }

  onInput(field: string): void {
    switch (field) {
      case 'card':
        this.dirtyCard = true;
        break;
      case 'bank':
        this.dirtyBank = true;
        break;
      case 'cvv':
        this.dirtyCvv = true;
        break;
    }
  }

  onBlur(field: string): void {
    switch (field) {
      case 'card':
        if (this.dirtyCard || this.focusedCard) this.cardTouched = true;
        this.focusedCard = false;
        break;
      case 'bank':
        if (this.dirtyBank || this.focusedBank) this.bankTouched = true;
        this.focusedBank = false;
        break;
      case 'cvv':
        if (this.dirtyCvv || this.focusedCvv) this.cvvTouched = true;
        this.focusedCvv = false;
        break;
    }
  }

  onFocus(field: string): void {
    switch (field) {
      case 'card':
        this.focusedCard = true;
        break;
      case 'bank':
        this.focusedBank = true;
        break;
      case 'cvv':
        this.focusedCvv = true;
        break;
    }
  }

  allowDigitKeydown(e: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
    if (allowedKeys.indexOf(e.key) !== -1) return;
    if (e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  }

  onPasteCardNumber(e: ClipboardEvent): void {
    try {
      const text = e.clipboardData?.getData('text') || '';
      const digits = text.replace(/\D/g, '').slice(0, 16);
      if (digits.length === 0) {
        e.preventDefault();
        return;
      }
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      e.preventDefault();
      this.cardNumber = formatted;
      try {
        const input = document.activeElement as HTMLInputElement | null;
        if (input && input.id === 'cardNumber') input.value = formatted;
      } catch (err) {}
      this.onInput('card');
    } catch (err) {}
  }

  onPasteCvv(e: ClipboardEvent): void {
    try {
      const text = e.clipboardData?.getData('text') || '';
      const digits = text.replace(/\D/g, '').slice(0, 3);
      if (digits.length === 0) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      this.cvv = digits;
      try {
        const input = document.activeElement as HTMLInputElement | null;
        if (input && input.id === 'cvv') input.value = digits;
      } catch (err) {}
      this.onInput('cvv');
    } catch (err) {}
  }

  onBeforeInputCvv(e: InputEvent): void {
    try {
      const data = (e as any).data || '';
      if (!data) return;
      if (/\D/.test(String(data))) {
        e.preventDefault();
      }
    } catch (err) {}
  }

  onCvvInput(e: any): void {
    try {
      this.onInput('cvv');
      const raw = e?.target?.value ?? '';
      const digits = String(raw).replace(/\D/g, '').slice(0, 3);
      this.cvv = digits;
      try {
        const inputEl = e?.target as HTMLInputElement | null;
        if (inputEl) inputEl.value = digits;
      } catch (err) {}
    } catch (err) {}
  }

  markAllTouched(): void {
    this.cardTouched = true;
    this.bankTouched = true;
    this.cvvTouched = true;
  }

  closeModal(): void {
    if (this.isSaving) return;
    this.showModal = false;
  }

  isCardNumberValid(n?: string): boolean {
    if (!n) return false;
    return /^\d{16}$/.test(n);
  }

  isCvvValid(c?: string): boolean {
    if (!c) return false;
    return /^\d{3}$/.test(c);
  }

  isBankValid(b?: string): boolean {
    if (!b) return false;
    return b.length >= 3 && b.length <= 25;
  }

  formValid(): boolean {
    const num = (this.cardNumber || '').replace(/\D/g, '');
    const cvv = (this.cvv || '').replace(/\D/g, '');
    const bank = (this.bank || '').trim();
    return this.isCardNumberValid(num) && this.isCvvValid(cvv) && this.isBankValid(bank);
  }

  submit(): void {
    this.markAllTouched();
    this.error = null;
    const num = (this.cardNumber || '').replace(/\D/g, '');
    const bank = (this.bank || '').trim();
    const cvv = (this.cvv || '').replace(/\D/g, '');

    if (!this.isCardNumberValid(num)) {
      this.error = 'Número de tarjeta inválido. Debe contener exactamente 16 dígitos.';
      return;
    }
    if (!this.isBankValid(bank)) {
      this.error = 'Nombre del banco inválido. Debe tener entre 3 y 25 caracteres.';
      return;
    }
    if (!this.isCvvValid(cvv)) {
      this.error = 'CVV inválido. Debe contener exactamente 3 dígitos.';
      return;
    }

    this.isSaving = true;
    const ownerId = this.auth.user?.id;
    if (this.editing && this.editing.id) {
      this.cardService
        .update(this.editing.id, { cardNumber: num, bank, cvv, owner: ownerId ? { id: ownerId } : undefined })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            setTimeout(() => this.loadCards(), 0);
          },
          error: (err: any) => {
            this.zone.run(() => {
              this.isSaving = false;
              this.error = err?.error || 'Error al actualizar tarjeta.';
            });
          },
        });
    } else {
      this.cardService
        .create({ cardNumber: num, bank, cvv, owner: ownerId ? { id: ownerId } : undefined })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            setTimeout(() => this.loadCards(), 0);
          },
          error: (err: any) => {
            this.zone.run(() => {
              this.isSaving = false;
              this.error = err?.error || 'Error al crear tarjeta.';
            });
          },
        });
    }
  }

  deleteCard(row: any): void {
    if (!row || !row.id) return;
    this.deleteTarget = row;
    this.deleteMessage = `¿Desea eliminar la tarjeta terminada en ${String(row.cardNumber).slice(
      -4
    )}?`;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (!this.showDeleteModal) return;
    if (this.deleting) return;
    this.showDeleteModal = false;
    this.deleteTarget = null;
    this.deleteError = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget || !this.deleteTarget.id) return;
    const id = this.deleteTarget.id;
    this.deleting = true;
    this.cardService.delete(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.zone.run(() => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.deleteTarget = null;
            this.loadCards();
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        }, 350);
      },
      error: (err) => {
        this.zone.run(() => {
          this.deleting = false;
          if (err && err.status === 409) {
            this.deleteError = 'Esta tarjeta tiene un pedido pagado. No se puede eliminar.';
            this.showDeleteModal = true;
            try {
              this.cd.detectChanges();
            } catch (e) {}
          } else {
            this.showDeleteModal = false;
            this.deleteTarget = null;
          }
        });
      },
    });
  }
}
