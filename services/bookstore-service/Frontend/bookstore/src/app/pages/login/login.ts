import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  name = '';
  password = '';
  error = '';
  loading = false;
  showRoleChoice = false;
  availableRoles: string[] = [];
  showLoginForm = true;
  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    try {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
    } catch (e) {
      this.returnUrl = null;
    }
  }

  close() {
    this.router.navigate(['/']);
  }

  submit() {
    this.error = '';
    if (!this.name || !this.password) {
      this.error = 'Ingrese nombre y contraseña';
      return;
    }
    this.loading = true;
    this.auth
      .login(this.name, this.password)
      .pipe(
        finalize(() =>
          this.zone.run(() => {
            setTimeout(() => {
              this.loading = false;
              try {
                this.cdr.detectChanges();
              } catch (e) {}
            }, 0);
          })
        )
      )
      .subscribe({
        next: () => {
          const u = this.auth.user;
          if (u?.isTemporaryPassword) {
            this.router.navigate(['/change-password']);
            return;
          }
          if (u?.roles?.includes('ROLE_ADMIN')) {
            this.router.navigate(['/profile', 'admin']);
            return;
          }

          const hasClient = !!u?.roles?.includes('ROLE_CLIENT');
          const hasSeller = !!u?.roles?.includes('ROLE_SELLER');

          if (hasClient && hasSeller) {
            this.availableRoles = ['Cliente', 'Vendedor'];
            setTimeout(() => {
              this.showLoginForm = false;
              this.showRoleChoice = true;
              try {
                this.cdr.detectChanges();
              } catch (e) {}
            });
            return;
          }

          if (hasSeller) {
            this.router.navigate(['/profile', 'seller']);
            return;
          }
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            return;
          }
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login error', err);
          this.zone.run(() => {
            if (err?.status === 401) {
              this.error = 'Login o contraseña incorrectos';
            } else if (err?.status === 403) {
              this.error = 'Cuenta inactiva. Contacta al administrador.';
            } else {
              this.error = err?.error?.message ?? 'Error al iniciar sesión';
            }
            try {
              this.cdr.detectChanges();
            } catch (e) {}
          });
        },
      });
  }

  chooseRole(role: 'client' | 'seller') {
    this.showRoleChoice = false;
    if (role === 'seller') {
      this.auth.setActiveRole('ROLE_SELLER');
      this.router.navigate(['/profile', 'seller']);
      return;
    }
    this.auth.setActiveRole('ROLE_CLIENT');
    this.router.navigate(['/'], { fragment: 'home' });
  }
}
