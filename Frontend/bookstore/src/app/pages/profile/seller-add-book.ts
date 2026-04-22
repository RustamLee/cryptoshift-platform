import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { AuthorService, AuthorDTO } from '../../services/author.service';
import { GenreService, GenreDTO } from '../../services/genre.service';
import { BookFormComponent } from '../../shared/book-form/book-form';

@Component({
  selector: 'app-seller-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule, BookFormComponent],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <h2>Agregar libro</h2>
        <div class="admin-actions">
          <button class="btn-primary" (click)="openCreateModal()">Crear</button>
        </div>
      </header>

      <div class="admin-container">
        <div class="author-table">
          <div class="empty">Pulsa "Crear" para agregar un nuevo libro.</div>
        </div>
      </div>

      @if (showCreateModal) {
      <app-book-form
        [visible]="showCreateModal"
        [book]="null"
        [authors]="authors"
        [genres]="genres"
        [saving]="creating"
        (save)="onFormSave($event)"
        (cancel)="closeCreateModal()"
      ></app-book-form>
      }
    </section>
  `,
})
export class SellerAddBookComponent implements OnInit {
  authors: AuthorDTO[] = [];
  genres: GenreDTO[] = [];

  showCreateModal = false;
  name = '';
  description = '';
  imageUrl = '';
  price: number | null = null;
  stock: number | null = null;
  authorId: number | null = null;
  genreIds: number[] = [];
  creating = false;
  createError: string | null = null;

  constructor(
    private authorService: AuthorService,
    private genreService: GenreService,
    private bookService: BookService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAuthors();
    this.loadGenres();
  }

  loadAuthors(): void {
    this.authorService.getAll().subscribe({ next: (a) => (this.authors = a || []) });
  }

  loadGenres(): void {
    this.genreService.getAll().subscribe({ next: (g) => (this.genres = g || []) });
  }

  openCreateModal(): void {
    this.createError = null;
    this.name = '';
    this.description = '';
    this.imageUrl = '';
    this.price = null;
    this.stock = null;
    this.authorId = null;
    this.genreIds = [];
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.creating) return;
    this.showCreateModal = false;
    this.createError = null;
  }

  validForSubmit(): boolean {
    const nameOk = !!this.name && this.name.trim().length >= 1 && this.name.trim().length <= 50;
    const descOk = !this.description || this.description.length <= 200;
    const imageOk =
      !!this.imageUrl && this.imageUrl.trim().length > 0 && this.imageUrl.trim().length <= 2048;
    const priceOk = this.price !== null && this.price >= 0 && this.price <= 1000000;
    const stockOk = this.stock !== null && this.stock >= 0 && this.stock <= 10000;
    const authorOk = !!this.authorId;

    return nameOk && descOk && imageOk && priceOk && stockOk && authorOk;
  }

  submitCreate(): void {
    this.createError = null;
    if (!this.validForSubmit()) {
      this.createError = 'Rellena todos los campos requeridos correctamente.';
      return;
    }
    this.creating = true;

    const authorObj: any = { id: this.authorId };
    const genresObjs = (this.genreIds || []).map((id) => ({ id }));

    const payload: any = {
      name: this.name.trim(),
      description: this.description ? this.description.trim() : '',
      imageUrl: this.imageUrl ? this.imageUrl.trim() : '',
      price: this.price,
      stock: this.stock,
      author: authorObj,
      genres: genresObjs,
    };

    this.bookService.create(payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.creating = false;
          this.showCreateModal = false;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.creating = false;
          this.createError = err?.error?.message || 'Error al crear libro.';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  onFormSave(payload: any): void {
    this.createError = null;
    this.creating = true;

    this.bookService.create(payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.creating = false;
          this.showCreateModal = false;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.creating = false;
          this.createError = err?.error?.message || 'Error al crear libro.';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }
}
