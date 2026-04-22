import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, UserDTO } from '../../services/auth.service';
import { ProfileToggleService, ProfileTogglePayload } from './profile-toggle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-wrapper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-page">
      <div class="menu-container">
        <aside class="profile-side">
          <nav class="profile-menu">
            <a
              class="profile-menu__item"
              [routerLink]="miProfileLink"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              >Mi perfil</a
            >

            @if (!isSellerRoute && !isAdmin) {
            <a
              class="profile-menu__item"
              routerLink="/profile/client/cards"
              routerLinkActive="active"
              >Mis tarjetas</a
            >
            <a
              class="profile-menu__item"
              routerLink="/profile/client/compras"
              routerLinkActive="active"
              >Mis compras</a
            >
            } @else if (isSellerRoute) {
            <a
              class="profile-menu__item"
              routerLink="/profile/seller/sales"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              >Mis ventas</a
            >
            <a
              class="profile-menu__item"
              routerLink="/profile/seller/catalog"
              routerLinkActive="active"
              >Mi catalogo</a
            >

            } @else if (isAdmin) {
            <a
              class="profile-menu__item"
              routerLink="/profile/admin/genres"
              routerLinkActive="active"
              >Gestión de Géneros</a
            >
            <a
              class="profile-menu__item"
              routerLink="/profile/admin/authors"
              routerLinkActive="active"
              >Gestión de Autores</a
            >
            <a
              class="profile-menu__item"
              routerLink="/profile/admin/users"
              routerLinkActive="active"
              >Gestion de Usuarios</a
            >
            <a
              class="profile-menu__item"
              routerLink="/profile/admin/seller-requests"
              routerLinkActive="active"
              >Solicitudes de vendedores</a
            >
            } @if (!isAdmin) {
            <a class="profile-menu__item" (click)="openToggleConfirm()">{{ toggleLabel }}</a>

            }
          </nav>
        </aside>
      </div>
      <section class="profile-content">
        <router-outlet></router-outlet>
      </section>
    </div>

    @if (showConfirm) {
    <div class="modal" (click)="cancelConfirm()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" aria-label="Cerrar" (click)="cancelConfirm()">×</button>
        <h3>{{ confirmTitle }}</h3>
        <p>{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="btn-primary" (click)="confirmSwitch()">Sí, continuar</button>
          <button class="btn-secondary" (click)="cancelConfirm()">Cancelar</button>
        </div>
      </div>
    </div>
    }
  `,
  styleUrls: ['./profile.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileWrapperComponent {
  currentUrl = '';
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmTarget: 'seller' | 'client' | null = null;

  constructor(
    private router: Router,
    public auth: AuthService,
    private profileToggle: ProfileToggleService
  ) {
    this.currentUrl = this.router.url || '';
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentUrl = e.urlAfterRedirects || e.url || '';
      });
    this.toggleSub = this.profileToggle.toggle$.subscribe((payload?: ProfileTogglePayload | void) => {
      if (!payload) {
        this.openToggleConfirm();
        return;
      }
      if (this.isAdmin) return;
      this.confirmTarget = payload.target ?? 'client';
      this.confirmTitle = payload.title ?? (this.confirmTarget === 'client' ? 'Cambiar a perfil de cliente' : 'Cambiar a perfil de vendedor');
      this.confirmMessage = payload.message ?? (this.confirmTarget === 'client' ? '¿Deseas pasar al perfil de cliente?' : '¿Deseas pasar al perfil de vendedor?');
      this.pendingOnConfirm = payload.onConfirm ?? null;
      this.pendingOnCancel = payload.onCancel ?? null;
      this.showConfirm = true;
    });
  }

  private pendingOnConfirm: (() => void) | null = null;
  private pendingOnCancel: (() => void) | null = null;

  private userSub?: Subscription;
  private routerSub?: Subscription;
  private toggleSub?: Subscription;
  private _isAdmin: boolean | null = null;
  private _isSeller: boolean | null = null;
  private _profileLink: any[] | null = null;

  ngOnInit(): void {
    const u0 = this.auth.user;
    if (u0) this.applyUser(u0);

    this.userSub = this.auth.currentUser$.subscribe((u: UserDTO | null) => {
      if (u) this.applyUser(u);
      else {
        this._isAdmin = false;
        this._isSeller = false;
        this._profileLink = ['/profile', 'client'];
      }
    });
  }

  ngOnDestroy(): void {
    try {
      this.userSub?.unsubscribe();
    } catch (e) {}
    try {
      this.routerSub?.unsubscribe();
    } catch (e) {}
    try {
      this.toggleSub?.unsubscribe();
    } catch (e) {}
  }

  private applyUser(u: UserDTO) {
    const active = this.auth.getActiveRole();
    if (active === 'ROLE_ADMIN') {
      this._isAdmin = true;
      this._isSeller = false;
      this._profileLink = ['/profile', 'admin'];
      return;
    }
    if (active === 'ROLE_SELLER') {
      this._isAdmin = false;
      this._isSeller = true;
      this._profileLink = ['/profile', 'seller'];
      return;
    }
    this._isAdmin = !!u.roles?.includes('ROLE_ADMIN');
    this._isSeller = !!u.roles?.includes('ROLE_SELLER');
    if (this._isAdmin) this._profileLink = ['/profile', 'admin'];
    else if (this._isSeller) this._profileLink = ['/profile', 'seller'];
    else this._profileLink = ['/profile', 'client'];
  }

  get isSellerRoute(): boolean {
    return this.currentUrl.includes('/profile/seller');
  }

  get isAdminRoute(): boolean {
    return this.currentUrl.includes('/profile/admin');
  }

  get isAdmin(): boolean {
    if (this._isAdmin !== null) return this._isAdmin;
    const u = this.auth.user;
    return !!u?.roles?.includes('ROLE_ADMIN');
  }

  get profileLink(): any[] {
    if (this._profileLink) return this._profileLink;
    const u = this.auth.user;
    if (u?.roles?.includes('ROLE_ADMIN')) return ['/profile', 'admin'];
    if (u?.roles?.includes('ROLE_SELLER')) return ['/profile', 'seller'];
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.roles?.includes('ROLE_ADMIN')) return ['/profile', 'admin'];
        if (parsed?.roles?.includes('ROLE_SELLER')) return ['/profile', 'seller'];
      }
    } catch (e) {}
    return ['/profile', 'client'];
  }

  get miProfileLink(): any[] {
    try {
      if (this.currentUrl && this.currentUrl.includes('/profile/client'))
        return ['/profile', 'client'];
      if (this.currentUrl && this.currentUrl.includes('/profile/seller'))
        return ['/profile', 'seller'];
      if (this.currentUrl && this.currentUrl.includes('/profile/admin'))
        return ['/profile', 'admin'];
    } catch (e) {}
    return this.profileLink;
  }

  get toggleLabel(): string {
    return this.isSellerRoute ? 'Comprar' : 'Vender';
  }

  openToggleConfirm(): void {
    if (this.isAdmin) return;
    const user = this.auth.user;
    const hasSeller = !!user?.roles?.includes('ROLE_SELLER');

    if (this.isSellerRoute) {
      this.confirmTarget = 'client';
      this.confirmTitle = 'Cambiar a perfil de cliente';
      this.confirmMessage = '¿Deseas pasar al perfil de cliente?';
      this.showConfirm = true;
      return;
    }

    if (hasSeller) {
      this.confirmTarget = 'seller';
      this.confirmTitle = 'Cambiar a perfil de vendedor';
      this.confirmMessage = '¿Deseas pasar al perfil de vendedor?';
      this.showConfirm = true;
      return;
    }

    this.router.navigate(['/profile', 'client'], { queryParams: { openSellerModal: '1' } });
  }

  confirmSwitch(): void {
    this.showConfirm = false;
    if (this.pendingOnConfirm) {
      try {
        this.pendingOnConfirm();
      } catch (e) {}
      this.pendingOnConfirm = null;
      this.pendingOnCancel = null;
      this.confirmTarget = null;
      return;
    }

    const user = this.auth.user;
    const hasSeller = !!user?.roles?.includes('ROLE_SELLER');

    if (this.confirmTarget === 'client') {
      this.auth.setActiveRole('ROLE_CLIENT');
      this.router.navigate(['/profile', 'client']);
    } else if (this.confirmTarget === 'seller') {
      if (hasSeller) {
        this.auth.setActiveRole('ROLE_SELLER');
        this.router.navigate(['/profile', 'seller']);
      } else {
        this.router.navigate(['/profile', 'client'], { queryParams: { openSellerModal: '1' } });
      }
    }
    this.confirmTarget = null;
  }

  cancelConfirm(): void {
    this.showConfirm = false;
    if (this.pendingOnCancel) {
      try {
        this.pendingOnCancel();
      } catch (e) {}
    }
    this.pendingOnConfirm = null;
    this.pendingOnCancel = null;
    this.confirmTarget = null;
  }

  onToggle(): void {
    const user = this.auth.user;
    const hasSeller = !!user?.roles?.includes('ROLE_SELLER');
    if (this.isAdmin) return;

    if (this.isSellerRoute) {
      this.auth.setActiveRole('ROLE_CLIENT');
      this.router.navigate(['/profile', 'client']);
      return;
    }

    if (hasSeller) {
      this.auth.setActiveRole('ROLE_SELLER');
      this.router.navigate(['/profile', 'seller']);
    } else {
      this.router.navigate(['/profile', 'client'], { queryParams: { openSellerModal: '1' } });
    }
  }
}
