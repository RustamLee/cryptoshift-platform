import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password-modal.html',
})
export class ResetPasswordModalComponent {
  @Input() visible = false;
  @Input() title = 'Asignar contraseña temporal';

  @Input() loading = false;
  @Input() errorMessage: string | null = null;

  @Output() confirm = new EventEmitter<{ password: string; temporary: boolean }>();
  @Output() cancel = new EventEmitter<void>();

  password = '';

  onConfirm() {
    if (this.loading) return;
    this.confirm.emit({ password: this.password, temporary: true });
  }

  onCancel() {
    if (this.loading) return;
    this.cancel.emit();
  }
}
