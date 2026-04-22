import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SellerProfileService, SellerProfileDTOFull } from '../../services/seller-profile.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { AuthorService, AuthorDTO } from '../../services/author.service';
import { GenreService, GenreDTO } from '../../services/genre.service';
import { ProfileTableComponent } from '../../shared/profile-table/profile-table';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { BookFormComponent } from '../../shared/book-form/book-form';

@Component({
  selector: 'app-seller-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProfileTableComponent,
    ConfirmDialogComponent,
    BookFormComponent,
  ],
  styleUrls: ['../../shared/profile-table/profile-table.css'],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <h2>Mi Catálogo</h2>
        <div class="admin-actions">
          <a class="btn-primary" [routerLink]="['/profile', 'seller', 'catalog', 'new']"
            >Agregar libro</a
          >
        </div>
      </header>

      <div class="admin-container">
        <div class="author-table">
          <app-profile-table
            [columns]="['Nombre', 'Autor', 'Precio', 'Stock']"
            [keys]="['name', 'author.name', 'price', 'stock']"
            [rows]="books"
            [actionsTemplate]="catalogActions"
          ></app-profile-table>

          <ng-template #catalogActions let-row>
            <button
              class="btn-small"
              title="Editar"
              (click)="openEditModal(row)"
              [disabled]="creating || deletingId === row.id"
            >
              <i class="ri-pencil-line"></i>
            </button>
            <button
              class="btn-small danger"
              title="Eliminar"
              (click)="deleteBook(row)"
              [disabled]="creating || deletingId === row.id"
            >
              <i *ngIf="deletingId !== row.id" class="ri-delete-bin-line"></i>
              <span *ngIf="deletingId === row.id" class="spinner" aria-hidden="true"></span>
            </button>
          </ng-template>

          <div *ngIf="!loading && (!books || books.length === 0)" class="empty">
            No hay libros en tu catálogo.
          </div>
          <div *ngIf="loading" class="empty">Cargando...</div>
        </div>
      </div>

      @if (showCreateModal) {
      <app-book-form
        [visible]="showCreateModal"
        [book]="
          editBookId
            ? {
                id: editBookId,
                name: name,
                description: description,
                imageUrl: imageUrl,
                price: price,
                stock: stock,
                author: { id: authorId },
                genres: genreId ? [{ id: genreId }] : []
              }
            : null
        "
        [authors]="authors"
        [genres]="genres"
        [saving]="creating"
        (save)="onFormSave($event)"
        (cancel)="closeCreateModal()"
      ></app-book-form>
      } @if (showDeleteModal) {
      <app-confirm-dialog
        [visible]="showDeleteModal"
        [title]="'Confirmar eliminación'"
        [message]="deleteMessage"
        [confirmLabel]="'Eliminar'"
        [cancelLabel]="'Cancelar'"
        [loading]="deleting"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()"
      ></app-confirm-dialog>
      }
    </section>
  `,
})
export class SellerCatalogComponent implements OnInit {
  books: any[] = [];
  loading = false;

  authors: AuthorDTO[] = [];
  genres: GenreDTO[] = [];

  showCreateModal = false;

  editBookId: number | null = null;
  name = '';
  description = '';
  imageUrl = '';
  price: number | null = null;
  stock: number | null = null;
  authorId: number | null = null;
  genreId: number | null = null;
  creating = false;
  createError: string | null = null;
  deletingId: number | null = null;

  showDeleteModal = false;
  deleteTarget: any = null;
  deleting = false;
  deleteMessage = '';

  constructor(
    private sellerService: SellerProfileService,
    private auth: AuthService,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private authorService: AuthorService,
    private genreService: GenreService,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInventory();
    this.loadAuthors();
    this.loadGenres();

    try {
      if (this.router.url && this.router.url.includes('/profile/seller/catalog/new')) {
        setTimeout(() => this.openCreateModal(), 50);
      }
    } catch (e) {}
  }

  loadAuthors(): void {
    this.authorService.getAll().subscribe({
      next: (a) => {
        this.zone.run(() => {
          setTimeout(() => {
            this.authors = a || [];
            try {
              this.cd.detectChanges();
            } catch (e) {}
          }, 0);
        });
      },
    });
  }

  loadGenres(): void {
    this.genreService.getAll().subscribe({
      next: (g) => {
        this.zone.run(() => {
          setTimeout(() => {
            this.genres = g || [];
            try {
              this.cd.detectChanges();
            } catch (e) {}
          }, 0);
        });
      },
    });
  }

  openCreateModal(): void {
    this.createError = null;
    this.name = '';
    this.imageUrl = '';
    this.description = '';
    this.price = null;
    this.stock = null;
    this.authorId = null;
    this.genreId = null;
    this.editBookId = null;

    setTimeout(() => {
      this.showCreateModal = true;
      try {
        this.cd.detectChanges();
      } catch (e) {}
    }, 0);
  }

  closeCreateModal(): void {
    if (this.creating) return;
    this.showCreateModal = false;
    this.createError = null;
    this.editBookId = null;

    try {
      if (this.router.url && this.router.url.includes('/profile/seller/catalog/new')) {
        this.router.navigate(['/profile', 'seller', 'catalog']);
      }
    } catch (e) {}
  }

  validForSubmit(): boolean {
    const nameOk =
      typeof this.name === 'string' &&
      this.name.trim().length >= 1 &&
      this.name.trim().length <= 50;
    const descOk = !this.description || this.description.length <= 200;
    const imageOk =
      !!this.imageUrl && this.imageUrl.trim().length > 0 && this.imageUrl.trim().length <= 2048;
    const priceN = Number(this.price);
    const priceOk = this.price !== null && !isNaN(priceN) && priceN > 0 && priceN <= 1000000;
    const stockN = Number(this.stock);
    const stockOk = this.stock !== null && !isNaN(stockN) && stockN >= 0 && stockN <= 10000;
    const authorOk = this.authorId !== null && this.authorId !== undefined;

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
    const genresObjs = this.genreId ? [{ id: this.genreId }] : [];

    const payload: any = {
      name: this.name.trim(),
      description: this.description ? this.description.trim() : '',
      imageUrl: this.imageUrl ? this.imageUrl.trim() : '',
      price: Number(this.price),
      stock: Number(this.stock),
      author: authorObj,
      genres: genresObjs,
    };

    if (this.editBookId) {
      this.bookService.update(this.editBookId, payload).subscribe({
        next: () => this.refreshAfterChange(),
        error: (err) => {
          this.zone.run(() => {
            this.creating = false;
            this.createError = err?.error?.message || 'Error al actualizar libro.';
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        },
      });
    } else {
      this.bookService.create(payload).subscribe({
        next: () => this.refreshAfterChange(),
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

  onFormSave(payload: any): void {
    this.createError = null;
    this.creating = true;
    if (this.editBookId) {
      this.bookService.update(this.editBookId, payload).subscribe({
        next: () => this.refreshAfterChange(),
        error: (err) => {
          this.zone.run(() => {
            this.creating = false;
            this.createError = err?.error?.message || 'Error al actualizar libro.';
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        },
      });
    } else {
      this.bookService.create(payload).subscribe({
        next: () => this.refreshAfterChange(),
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

  private refreshAfterChange(): void {
    this.sellerService.getMySellerProfile().subscribe({
      next: (s) => {
        this.zone.run(() => {
          try {
            const current = this.auth.user;
            if (current) {
              const updated = { ...current, sellerProfile: s } as any;
              this.auth.setCurrentUser(updated);
            }
          } catch (e) {}
          this.books = (s as any).books || (s as any).inventory || [];
          this.creating = false;
          this.showCreateModal = false;
          this.editBookId = null;

          try {
            if (
              this.router &&
              this.router.url &&
              this.router.url.includes('/profile/seller/catalog/new')
            ) {
              this.router.navigate(['/profile', 'seller', 'catalog']);
            }
          } catch (e) {}
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: () => {
        this.zone.run(() => {
          this.creating = false;
          this.showCreateModal = false;
          this.editBookId = null;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  openEditModal(book: any): void {
    this.createError = null;
    this.editBookId = book?.id || null;
    this.name = book?.name || '';
    this.description = book?.description || '';
    this.price = book?.price ?? null;
    this.stock = book?.stock ?? null;
    this.authorId = book?.author?.id ?? null;
    this.genreId = (book?.genres || [])[0]?.id ?? null;

    const id = this.editBookId;
    if (id) {
      this.bookService.getById(id).subscribe({
        next: (full) => {
          this.zone.run(() => {
            this.name = full?.name || this.name;
            this.description = full?.description || this.description;
            this.imageUrl = full?.imageUrl || this.imageUrl || '';
            this.price = full?.price ?? this.price;
            this.stock = full?.stock ?? this.stock;
            this.authorId = full?.author?.id ?? this.authorId;
            this.genreId = (full?.genres || [])[0]?.id ?? this.genreId;

            this.showCreateModal = true;
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        },
        error: () => {
          this.zone.run(() => {
            this.showCreateModal = true;
            try {
              this.cd.detectChanges();
            } catch (e) {}
          });
        },
      });
    } else {
      setTimeout(() => {
        this.showCreateModal = true;
        try {
          this.cd.detectChanges();
        } catch (e) {}
      }, 0);
    }
  }

  deleteBook(book: any): void {
    if (!book || !book.id) return;

    this.deleteTarget = book;
    this.deleteMessage = `¿Estás seguro que deseas eliminar este libro?`;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    if (!this.showDeleteModal) return;
    if (this.deleting) return;
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget || !this.deleteTarget.id) return;
    const id = this.deleteTarget.id;
    this.deleting = true;
    this.deletingId = id;
    this.bookService.delete(id).subscribe({
      next: () => {
        this.sellerService.getMySellerProfile().subscribe({
          next: (s) =>
            this.zone.run(() => {
              try {
                const current = this.auth.user;
                if (current) {
                  const updated = { ...current, sellerProfile: s } as any;
                  this.auth.setCurrentUser(updated);
                }
              } catch (e) {}

              setTimeout(() => {
                this.deleting = false;
                this.deletingId = null;
                this.showDeleteModal = false;
                this.deleteTarget = null;
                this.books = (s as any).books || (s as any).inventory || [];
                try {
                  this.cd.detectChanges();
                } catch (e) {}
              }, 350);
            }),
          error: () =>
            this.zone.run(() => {
              this.deleting = false;
              this.deletingId = null;
              this.showDeleteModal = false;
              this.deleteTarget = null;
              try {
                this.cd.detectChanges();
              } catch (e) {}
            }),
        });
      },
      error: () => {
        this.zone.run(() => {
          this.deleting = false;
          this.deletingId = null;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  loadInventory(): void {
    this.loading = true;

    const user = this.auth.userSignal();
    if (user && user.sellerProfile) {
      const sp = user.sellerProfile as SellerProfileDTOFull;
      const cached = sp.books || sp.inventory;

      const hasValidCache =
        Array.isArray(cached) && cached.length > 0 && cached[0] && cached[0].price != null;
      if (hasValidCache) {
        this.zone.run(() => {
          this.books = cached || [];
          this.loading = false;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
        return;
      }
    }

    this.sellerService.getMySellerProfile().subscribe({
      next: (s) => {
        this.zone.run(() => {
          this.books = (s as any).books || (s as any).inventory || [];
          this.loading = false;

          try {
            const current = this.auth.user;
            if (current) {
              const updated = { ...current, sellerProfile: s } as any;
              this.auth.setCurrentUser(updated);
            }
          } catch (e) {}
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
}
