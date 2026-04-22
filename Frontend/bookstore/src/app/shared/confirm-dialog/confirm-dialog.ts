import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'],
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar';
  @Input() message = '';
  @Input() confirmLabel = 'Sí';
  @Input() cancelLabel = 'Cancelar';
  @Input() loading = false;
  @Input() errorMessage: string | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (this.loading) return;
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.loading) return;
    this.cancel.emit();
  }
}
