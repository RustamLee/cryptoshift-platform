import { Component, WritableSignal, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { SellerProfileService, SellerProfileDTOFull } from '../../services/seller-profile.service';
import { SellerRequestService, SellerRequestDTO } from '../../services/seller-request.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './profile-client.html',
})
export class ProfileComponent implements OnDestroy {
  showSellerModal = false;
  isRegistering = false;
  sellerName: string = '';
  sellerAddress: string = '';
  sellerAfipNumber: string = '';
  afipTouched = false;
  dirtyAfip = false;
  focusedAfip = false;
  showEmailModal = false;
  emailModalStep: number = 1;
  emailCurrentPassword: string = '';
  newEmail: string = '';
  isUpdatingEmail = false;
  emailUpdateError: string | null = null;
  sellerProfile: WritableSignal<SellerProfileDTOFull | null> = signal(null);
  sellerRequest: WritableSignal<SellerRequestDTO | null> = signal(null);
  // Withdraw confirm dialog state
  showWithdrawConfirm = false;
  withdrawLoading = false;
  withdrawError: string | null = null;

  private roleLabels: Record<string, string> = {
    ROLE_CLIENT: 'Cliente',
    ROLE_ADMIN: 'Administrador',
    ROLE_SELLER: 'Vendedor',
  };

  private qpSub: Subscription | null = null;

  constructor(
    public auth: AuthService,
    private sellerProfileService: SellerProfileService,
    private sellerRequestService: SellerRequestService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    effect(() => {
      const u = this.auth.user;

      if (u) {
        this.newEmail = u.email || u.name || '';
      } else {
        this.newEmail = '';
      }

      if (u?.roles?.includes('ROLE_ADMIN')) {
        this.router.navigate(['/profile', 'admin']);
        return;
      }

      if (u?.roles?.includes('ROLE_SELLER')) {
        this.loadSellerProfileIfNeeded();
      } else {
        this.sellerProfile.set(null);
        this.loadSellerRequestIfNeeded();
      }
    });

    this.qpSub = this.route.queryParams.subscribe((qp) => {
      if (qp && qp['openSellerModal']) {
        this.showSellerModal = true;
        try {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { openSellerModal: null },
            replaceUrl: true,
          });
        } catch (e) {}
      }
    });
  }

  ngOnDestroy(): void {
    this.qpSub?.unsubscribe();
  }

  openEmailModal(): void {
    this.emailModalStep = 1;
    this.emailCurrentPassword = '';
    this.emailUpdateError = null;
    const u = this.auth.userSignal();
    this.newEmail = u?.email || u?.name || '';
    this.showEmailModal = true;
  }

  closeEmailModal(): void {
    if (this.isUpdatingEmail) return;
    this.showEmailModal = false;
  }

  submitEmailStep1(): void {
    if (!this.emailCurrentPassword) {
      this.emailUpdateError = 'Ingrese la contraseña actual';
      return;
    }
    this.emailUpdateError = null;
    this.emailModalStep = 2;
  }

  submitEmailStep2(): void {
    if (!this.newEmail || !this.emailCurrentPassword) {
      this.emailUpdateError = 'Ingrese email y contraseña actuales.';
      return;
    }
    const emailTrim = this.newEmail.trim();
    if (emailTrim.length < 8) {
      this.emailUpdateError = 'Email debe tener al menos 8 caracteres.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      this.emailUpdateError = 'Ingrese un correo electrónico válido.';
      return;
    }
    this.isUpdatingEmail = true;
    this.emailUpdateError = null;
    this.auth
      .updateUser({ name: emailTrim, currentPassword: this.emailCurrentPassword })
      .subscribe({
        next: () => {
          try {
            localStorage.removeItem('basicAuth');
            localStorage.removeItem('jwtToken');
          } catch (e) {}
          this.isUpdatingEmail = false;
          this.showEmailModal = false;
          this.emailCurrentPassword = '';
        },
        error: (err) => {
          this.isUpdatingEmail = false;
          if (err?.status === 401) {
            this.emailUpdateError = 'Contraseña actual incorrecta.';
            this.emailModalStep = 1;
          } else if (err?.status === 406) {
            this.emailUpdateError = 'Ya existe un usuario con ese email.';
          } else {
            this.emailUpdateError = 'Error al actualizar email. Inténtelo más tarde.';
          }
        },
      });
  }

  roleLabel(role?: string): string {
    if (!role) return '';
    if (this.roleLabels[role]) return this.roleLabels[role];
    const cleaned = role.replace(/^ROLE_/, '').toLowerCase();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  rolesLabel(roles?: string[] | null): string {
    if (!roles || roles.length === 0) return '—';
    return roles.map((r) => this.roleLabel(r)).join(', ');
  }

  hasSellerRole(): boolean {
    return !!this.auth.userSignal()?.roles?.includes('ROLE_SELLER');
  }

  onSellClick(): void {
    const tokenPresent = (() => {
      try {
        return !!localStorage.getItem('jwtToken');
      } catch (e) {
        return false;
      }
    })();

    if (!this.auth.userSignal() || !tokenPresent) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    if (this.hasSellerRole()) {
      this.router.navigate(['/profile', 'seller']);
    } else {
      this.showSellerModal = true;
    }
  }

  submitSellerRegistration(): void {
    const tokenPresent = (() => {
      try {
        return !!localStorage.getItem('jwtToken');
      } catch (e) {
        return false;
      }
    })();

    if (!this.auth.userSignal() || !tokenPresent) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    if (!this.sellerName || this.sellerName.trim().length < 6) {
      this.emailUpdateError = 'El nombre de la empresa debe tener al menos 6 caracteres.';
      return;
    }
    if (!this.sellerAddress || this.sellerAddress.trim().length < 6) {
      this.emailUpdateError = 'La dirección debe tener al menos 6 caracteres.';
      return;
    }
    if (!this.isAfipNumberValid(this._afipDigits)) {
      this.emailUpdateError = 'El número de AFIP debe tener 11 dígitos (formato XX-XXXXXXXX-X).';
      return;
    }
    this.emailUpdateError = null;
    this.isRegistering = true;
    const start = Date.now();
    const minMs = 2500;

    this.sellerRequestService
      .createRequest({
        businessName: this.sellerName.trim(),
        address: this.sellerAddress.trim(),
        cuit: this._afipDigits.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3')
      })
      .subscribe({
        next: (request) => {
          const finish = () => {
            this.isRegistering = false;
            this.showSellerModal = false;
            this.sellerName = '';
            this.sellerAddress = '';
            this.sellerAfipNumber = '';
            this.sellerRequest.set(request);
            this.emailUpdateError = 'Tu solicitud ha sido enviada. El administrador la revisará pronto.';
          };
          const elapsed = Date.now() - start;
          const wait = Math.max(0, minMs - elapsed);
          setTimeout(finish, wait);
        },
        error: () => {
          const finishErr = () => {
            this.isRegistering = false;
            this.emailUpdateError = 'Error al enviar la solicitud. Intenta nuevamente.';
          };
          const elapsed = Date.now() - start;
          const wait = Math.max(0, minMs - elapsed);
          setTimeout(finishErr, wait);
        },
      });
  }

  onModalBackdropClick(): void {
    if (this.isRegistering) return;
  }

  onModalCloseClick(): void {
    if (this.isRegistering) return;
    this.showSellerModal = false;
  }

  loadSellerProfileIfNeeded(): void {
    if (!this.hasSellerRole()) return;
    this.sellerProfileService.getMySellerProfile().subscribe({
      next: (p) => this.sellerProfile.set(p),
      error: () => this.sellerProfile.set(null),
    });
  }

  get _afipDigits(): string {
    return (this.sellerAfipNumber || '').replace(/\D/g, '');
  }

  onAfipNumberInput(e: any): void {
    try {
      this.onInput('afip');
      const raw = e?.target?.value ?? '';
      const digits = String(raw).replace(/\D/g, '').slice(0, 11);
      const formatted = this.formatAfipNumber(digits);
      this.sellerAfipNumber = formatted;
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
      this.sellerAfipNumber = formatted;
      try {
        const input = document.activeElement as HTMLInputElement | null;
        if (input && input.id === 'sellerAfipNumber') input.value = formatted;
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

  loadSellerRequestIfNeeded(): void {

    this.sellerProfileService.getMySellerProfile().subscribe({
      next: (profile) => {
        this.sellerProfile.set(profile);
        this.sellerRequest.set(null);
      },
      error: () => {
        this.sellerRequestService.getCurrentUserRequest().subscribe({
          next: (request) => {
            this.sellerRequest.set(request);
          },
          error: () => this.sellerRequest.set(null),
        });
      }
    });
  }

  withdrawSellerRequest(): void {
    const request = this.sellerRequest();
    if (!request || !request.id) return;

    this.withdrawError = null;
    this.showWithdrawConfirm = true;
  }

  onConfirmWithdraw(): void {
    const request = this.sellerRequest();
    if (!request || !request.id) {
      this.showWithdrawConfirm = false;
      return;
    }
    this.withdrawLoading = true;
    this.withdrawError = null;
    this.sellerRequestService.withdrawRequest(request.id).subscribe({
      next: () => {
        this.withdrawLoading = false;
        this.showWithdrawConfirm = false;
        this.sellerRequest.set(null);
        this.emailUpdateError = 'Solicitud retirada exitosamente.';
      },
      error: (err) => {
        this.withdrawLoading = false;
        this.withdrawError = 'Error al retirar la solicitud. Intente nuevamente.';
      },
    });
  }

  onCancelWithdraw(): void {
    if (this.withdrawLoading) return;
    this.showWithdrawConfirm = false;
    this.withdrawError = null;
  }
}

