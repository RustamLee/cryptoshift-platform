import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css'],
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  close() {
    try {
      this.router.navigate(['/']);
    } catch (e) {
      // best-effort
      window.history.back();
    }
  }

  submit() {
    this.error = '';
    if (!this.currentPassword || !this.newPassword) {
      this.error = 'Complete ambos campos';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'La nueva contraseña y la confirmación no coinciden';
      return;
    }
    this.loading = true;
    this.auth.updateUser({ password: this.newPassword, currentPassword: this.currentPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.auth.me().subscribe(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al cambiar contraseña';
      },
    });
  }
}
