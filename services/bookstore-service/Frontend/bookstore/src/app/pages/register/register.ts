import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  name = '';
  password = '';
  error = '';
  nameError = false;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone
    , private cartService: CartService
  ) {}

  close() {
    this.router.navigate(['/']);
  }

  submit() {
    this.error = '';
    if (!this.name || !this.password) {
      this.error = 'Engrese nombre y contraseña';
      return;
    }
    if (this.name.trim().length < 8) {
      this.error = 'Email debe tener al menos 8 caracteres';
      this.nameError = true;
      return;
    }
    this.loading = true;
    this.auth.register(this.name, this.password).subscribe({
      next: (user) => {
        this.auth.login(this.name, this.password).subscribe({
          next: () => {
            this.zone.run(() => {
              this.loading = false;
              try {
                this.cd.detectChanges();
              } catch (e) {}
              try { this.cartService.setLocalCart([]); } catch (e) {}
              this.router.navigate(['/']);
            });
          },
          error: () => {
            this.zone.run(() => {
              this.loading = false;
              try {
                this.cd.detectChanges();
              } catch (e) {}
              try { this.cartService.setLocalCart([]); } catch (e) {}
              this.router.navigate(['/']);
            });
          }
        });
      },
      error: (err) => {
        console.error('Registration error', err);
        this.zone.run(() => {
          this.loading = false;
          if (err && err.status === 406) {
            this.error = 'El usuario ya existe';
            this.nameError = true;
            try {
              this.cd.detectChanges();
            } catch (e) {}
            return;
          }

          if (err && err.status === 403) {
            this.error = 'Cuenta inactiva. Contacta al administrador.';
            this.nameError = true;
            try { this.cd.detectChanges(); } catch (e) {}
            return;
          }

          if (err && err.status === 0) {
            this.error =
              'No se pudo conectar al servidor. Verifique la configuración del proxy y si el backend está en ejecución.';
            this.nameError = false;
            try {
              this.cd.detectChanges();
            } catch (e) {}
            return;
          }

          if (err && err.status === 404) {
            this.error =
              'Ruta no encontrada (404). Verifique la configuración del proxy y si el backend está en ejecución.';
            this.nameError = false;
            try {
              this.cd.detectChanges();
            } catch (e) {}
            return;
          }

          this.nameError = false;
          const raw = err?.error;
          let serverMessage: string | null = null;
          if (raw && typeof raw === 'object' && raw.message) {
            serverMessage = raw.message;
          } else if (raw && typeof raw === 'string') {
            if (raw.indexOf('<!DOCTYPE') !== -1 || raw.indexOf('<html') !== -1) {
              const m = raw.match(/<pre>([\s\S]*?)<\/pre>/i);
              serverMessage = m ? m[1].trim() : 'Error del servidor';
            } else {
              serverMessage = raw;
            }
          }
          this.error = serverMessage || 'Error al registrar el usuario';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }
}
