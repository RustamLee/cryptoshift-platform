import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-email-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-email-modal.html',
  styleUrls: ['./edit-email-modal.css'],
})
export class EditEmailModalComponent {
  @Input() visible = false;
  @Input() title = 'Editar nombre';
  @Input() name?: string;
  @Input() loading = false;
  @Input() errorMessage: string | null = null;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  localName = '';

  ngOnChanges() {
    this.localName = this.name || '';
  }

  onConfirm() {
    if (this.loading) return;
    this.confirm.emit(this.localName);
  }

  onCancel() {
    if (this.loading) return;
    this.cancel.emit();
  }
}
