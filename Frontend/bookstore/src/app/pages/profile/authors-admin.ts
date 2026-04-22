import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthorService, AuthorDTO } from '../../services/author.service';
import { ProfileTableComponent } from '../../shared/profile-table/profile-table';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-author-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProfileTableComponent, ConfirmDialogComponent],
  templateUrl: './authors-admin.html',
  styleUrls: ['../../shared/profile-table/profile-table.css'],
})
export class AuthorsAdminComponent implements OnInit {
  authors: AuthorDTO[] = [];
  loading = false;
  showCreateModal = false;
  newAuthorName = '';
  newAuthorBirthDate: string | null = null;
  newAuthorMaxDate = '';
  creating = false;
  createError: string | null = null;
  isEditMode = false;
  editingId: number | null = null;
  showDeleteModal = false;
  deleteTarget: AuthorDTO | null = null;
  deleting = false;
  deleteMessage = '';
  deleteError: string | null = null;

  constructor(
    private authorService: AuthorService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadAuthors();
    this.newAuthorMaxDate = this.getTodayString();
  }

  loadAuthors(): void {
    this.loading = true;
    this.authorService.getAll().subscribe({
      next: (g) => {
        this.zone.run(() => {
          this.authors = g || [];
          this.loading = false;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: () => {
        this.zone.run(() => (this.loading = false));
      },
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.createError = null;
    this.newAuthorName = '';
    this.newAuthorBirthDate = null;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.creating) return;
    this.showCreateModal = false;
    this.createError = null;
  }
  openEditModal(g: AuthorDTO): void {
    this.isEditMode = true;
    this.editingId = g.id || null;
    this.createError = null;
    this.newAuthorName = g.name || '';
    this.newAuthorBirthDate = this.formatDateForInput(g.birthDate || null);
    this.showCreateModal = true;
  }

  submitCreateOrEdit(): void {
    const name = (this.newAuthorName || '').trim();
    if (!name) {
      this.createError = 'El nombre es requerido.';
      return;
    }
    if (!this.newAuthorBirthDate) {
      this.createError = 'La fecha de nacimiento es requerida.';
      return;
    }
    if (this.newAuthorMaxDate && this.newAuthorBirthDate > this.newAuthorMaxDate) {
      this.createError = 'La fecha de nacimiento no puede ser en el futuro.';
      return;
    }
    this.creating = true;
    this.createError = null;
    let birthDateIso = this.newAuthorBirthDate;
    try {
      birthDateIso = new Date((this.newAuthorBirthDate || '') + 'T00:00:00').toISOString();
    } catch (e) {}

    const payload = { name, birthDate: birthDateIso || '' };
    const obs =
      this.isEditMode && this.editingId
        ? this.authorService.update(this.editingId, payload)
        : this.authorService.create(payload);

    obs.subscribe({
      next: () => {
        this.zone.run(() => {
          this.creating = false;
          this.showCreateModal = false;
          this.loadAuthors();
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.creating = false;
          this.createError = err?.error?.message || 'Error al crear/editar autor.';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  private formatDateForInput(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch (e) {
      return null;
    }
  }

  private getTodayString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  deleteGenre(g: AuthorDTO): void {
    this.deleteTarget = g;
    this.deleteMessage = `¿Estás seguro que deseas eliminar el autor "${g.name}"?`;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (!this.showDeleteModal) return;
    this.showDeleteModal = false;
    this.deleteTarget = null;
    this.deleteError = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id!;
    this.deleting = true;
    this.authorService.delete(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.zone.run(() => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.deleteTarget = null;
            this.loadAuthors();
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        }, 450);
      },
      error: (err) => {
        this.zone.run(() => {
          this.deleting = false;
          if (err && err.status === 409) {
            this.deleteError = 'El autor tiene libros y no se puede eliminar.';
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
