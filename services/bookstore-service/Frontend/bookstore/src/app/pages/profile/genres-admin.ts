import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GenreService, GenreDTO } from '../../services/genre.service';
import { ProfileTableComponent } from '../../shared/profile-table/profile-table';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-genres-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProfileTableComponent, ConfirmDialogComponent],
  templateUrl: './genres-admin.html',
  styleUrls: ['../../shared/profile-table/profile-table.css'],
})
export class GenresAdminComponent implements OnInit {
  genres: GenreDTO[] = [];
  loading = false;
  showCreateModal = false;
  newGenreName = '';
  newGenreDescription = '';
  creating = false;
  createError: string | null = null;
  isEditMode = false;
  editingId: number | null = null;
  showDeleteModal = false;
  deleteTarget: GenreDTO | null = null;
  deleting = false;
  deleteMessage = '';
  deleteError: string | null = null;

  constructor(
    private genreService: GenreService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.loading = true;
    this.genreService.getAll().subscribe({
      next: (g) => {
        this.zone.run(() => {
          this.genres = g || [];
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
    this.newGenreName = '';
    this.newGenreDescription = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.creating) return;
    this.showCreateModal = false;
    this.createError = null;
  }
  openEditModal(g: GenreDTO): void {
    this.isEditMode = true;
    this.editingId = g.id || null;
    this.createError = null;
    this.newGenreName = g.name || '';
    this.newGenreDescription = g.description || '';
    this.showCreateModal = true;
  }

  submitCreateOrEdit(): void {
    const name = (this.newGenreName || '').trim();
    if (!name) {
      this.createError = 'El nombre es requerido.';
      return;
    }
    this.creating = true;
    this.createError = null;

    const payload = { name, description: this.newGenreDescription || '' };

    const obs =
      this.isEditMode && this.editingId
        ? this.genreService.update(this.editingId, payload)
        : this.genreService.create(payload);

    obs.subscribe({
      next: () => {
        this.zone.run(() => {
          this.creating = false;
          this.showCreateModal = false;
          this.loadGenres();
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.creating = false;
          this.createError = err?.error?.message || 'Error al crear/editar género.';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  deleteGenre(g: GenreDTO): void {
    this.deleteTarget = g;
    this.deleteMessage = `¿Estás seguro que deseas eliminar el género "${g.name}"?`;
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
    this.genreService.delete(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.zone.run(() => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.deleteTarget = null;
            this.loadGenres();
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
            this.deleteError = 'El género tiene libros y no se puede eliminar.';
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
