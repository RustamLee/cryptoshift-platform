import { Component, OnInit, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, BookDTO } from '../../services/book.service';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProfileToggleService } from '../../pages/profile/profile-toggle.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css'],
})
export class BookListComponent implements OnInit {
  books: BookDTO[] = [];
  loading = false;
  errorMessage: string | null = null;
  selectedBook: BookDTO | null = null;

  constructor(
    private bookService: BookService,
    private cart: CartService,
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private profileToggle: ProfileToggleService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const authorId = params['authorId'];
      const title = params['title'];
      const genereId = params['genereId'];
      if (title) {
        this.loadBooksByTitle(String(title));
      } else if (authorId || genereId) {
        this.loadBooksWithFilters({ authorId, genereId });
      } else {
        this.loadBooks();
      }
    });
  }

  loadBooksByTitle(title: string) {
    this.loading = true;
    const q = (title || '').toLowerCase().trim();
    this.bookService.getAll().subscribe({
      next: (b) => {
        const filtered = (b || []).filter(book => (book.name || '').toLowerCase().includes(q));
        this.zone.run(() => {
          this.books = this.sortBooks(filtered || []);
          this.loading = false;
          this.errorMessage = null;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      },
      error: (err: any) => {
        const status = err?.status;
        if (status === 401 || status === 403) {
          this.bookService.getAllPublic().subscribe({
            next: (b2) => {
              const filtered = (b2 || []).filter(book => (book.name || '').toLowerCase().includes(q));
              this.zone.run(() => {
                this.books = this.sortBooks(filtered || []);
                this.loading = false;
                this.errorMessage = null;
                try { this.cd.detectChanges(); } catch (e) {}
              });
            },
            error: (err2) => {
              console.error('Public fetch also failed', err2);
              this.zone.run(() => {
                this.loading = false;
                this.errorMessage = 'Error al cargar libros. Ver consola para más detalles.';
                try { this.cd.detectChanges(); } catch (e) {}
              });
            }
          });
          return;
        }
        console.error('Failed to load books for title search', err);
        this.zone.run(() => {
          this.loading = false;
          this.errorMessage = 'Error al buscar libros por título.';
          try { this.cd.detectChanges(); } catch (e) {}
        });
      }
    });
  }

  private sortBooks(books: BookDTO[]): BookDTO[] {
    if (!books || books.length === 0) return books;
    const inStock: BookDTO[] = [];
    const outStock: BookDTO[] = [];
    for (const b of books) {
      if (b && b.stock != null && b.stock <= 0) outStock.push(b);
      else inStock.push(b);
    }
    return [...inStock, ...outStock];
  }

  openDetails(book: BookDTO): void {
    this.selectedBook = book;
  }

  closeDetails(): void {
    this.selectedBook = null;
  }

  @HostListener('document:keydown', ['$event'])
  handleEscape(event: Event) {
    const ke = event as KeyboardEvent;
    if (ke.key === 'Escape' && this.selectedBook) {
      this.closeDetails();
    }
  }

  addToCart(bookId: number|undefined){
    if (!bookId) return;
    try {
      const tokenPresent = (() => { try { return !!this.auth.getAuthToken(); } catch (e) { try { return !!localStorage.getItem('jwtToken'); } catch (e2) { return false; } } })();
      const user = this.auth.userSignal ? this.auth.userSignal() : null;
      if (!user || !tokenPresent) {
        try { this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } }); } catch (e) {}
        return;
      }
    } catch (e) {}

    const book = this.books.find(x => x.id === bookId);
    if (book && (book.stock === 0 || book.stock <= 0)) {
      return;
    }
    try {
      const active = this.auth.getActiveRole();
      if (active === 'ROLE_SELLER') {
        const payload = {
          target: 'client' as const,
          title: 'Cambiar a perfil de cliente',
          message: 'Estás en modo Vendedor. Para comprar debes cambiar a perfil de cliente. ¿Deseas continuar?',
          onConfirm: () => {
            try {
              this.auth.setActiveRole('ROLE_CLIENT');
            } catch (e) {}
            try {
              this.cart.addToCart(bookId, 1).subscribe({
                next: () => {},
                error: (err) => console.error('Error agregando al carrito', err)
              });
            } catch (e) {}
            try { this.router.navigate(['/']); } catch (e) {}
          },
        };

        this.profileToggle.requestToggle(payload);
        return;
      }
    } catch (e) {}
    this.cart.addToCart(bookId, 1).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error('Error agregando al carrito', err);
      }
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getAll().subscribe({
      next: (b) => {
        this.zone.run(() => {
          this.books = this.sortBooks(b || []);
          this.loading = false;
          this.errorMessage = null;
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
      error: (err: any) => {
        console.error('Failed to load books (authenticated). Retrying public fetch', err);
        const status = err?.status;
        if (status === 401 || status === 403) {
          this.bookService.getAllPublic().subscribe({
            next: (b2) => {
              this.zone.run(() => {
                this.books = this.sortBooks(b2 || []);
                this.loading = false;
                this.errorMessage = null;
                try {
                  this.cd.detectChanges();
                } catch (e) {}
              });
            },
            error: (err2) => {
              console.error('Public fetch also failed', err2);
              this.zone.run(() => {
                this.loading = false;
                this.errorMessage = 'Error al cargar libros. Ver consola para más detalles.';
                try {
                  this.cd.detectChanges();
                } catch (e) {}
              });
            },
          });
          return;
        }
        this.zone.run(() => {
          this.loading = false;
          this.errorMessage = 'Error al cargar libros. Ver consola para más detalles.';
          try {
            this.cd.detectChanges();
          } catch (e) {}
        });
      },
    });
  }

  loadBooksWithFilters(params: { authorId?: string; genereId?: string }) {
    this.loading = true;

    const gid = params.genereId as any;
    const isMultiple = Array.isArray(gid) && gid.length > 1 || (typeof gid === 'string' && String(gid).includes(','));
    if (isMultiple) {
      this.bookService.getAllPublic().subscribe({
        next: (all) => {
          try {
            const sel = gid;
            let selectedIds: string[] = [];
            if (Array.isArray(sel)) selectedIds = sel.map((s: any) => String(s));
            else selectedIds = String(sel).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            const filtered = (all || []).filter(book => {
              let ok = true;
              if (selectedIds.length) {
                ok = ok && Array.isArray(book.genres) && book.genres.some(g => selectedIds.includes(String(g.id)));
              }
              if (params.authorId) {
                ok = ok && book.author && String(book.author.id) === String(params.authorId);
              }
              return ok;
            });
            this.zone.run(() => {
              this.books = this.sortBooks(filtered || []);
              this.loading = false;
              this.errorMessage = null;
              try { this.cd.detectChanges(); } catch (e) {}
            });
          } catch (e) {
            console.error('Error filtering public books (multi-genres)', e);
            this.zone.run(() => { this.loading = false; this.errorMessage = 'Error al cargar libros filtrados.'; });
          }
        },
        error: (err2) => {
          console.error('Public fetch failed (multi-genres)', err2);
          this.zone.run(() => { this.loading = false; this.errorMessage = 'Error al cargar libros filtrados.'; });
        }
      });
      return;
    }

    try {
      const token = this.auth.getAuthToken ? this.auth.getAuthToken() : null;
      if (!token) {
        this.bookService.getAllPublic().subscribe({
          next: (all) => {
            try {
              const filtered = (all || []).filter(book => {
                let ok = true;
                if (params.genereId) {
                  const sel = params.genereId;
                  let selectedIds: string[] = [];
                  if (Array.isArray(sel)) selectedIds = sel.map(s => String(s));
                  else selectedIds = String(sel).split(',').map(s => s.trim()).filter(s => s.length > 0);
                  ok = ok && Array.isArray(book.genres) && book.genres.some(g => selectedIds.includes(String(g.id)));
                }
                if (params.authorId) {
                  ok = ok && book.author && String(book.author.id) === String(params.authorId);
                }
                return ok;
              });
              this.zone.run(() => {
                this.books = this.sortBooks(filtered || []);
                this.loading = false;
                this.errorMessage = null;
                try { this.cd.detectChanges(); } catch (e) {}
              });
            } catch (e) {
              console.error('Error filtering public books (no token)', e);
              this.zone.run(() => { this.loading = false; this.errorMessage = 'Error al cargar libros filtrados.'; });
            }
          },
          error: (err2) => {
            console.error('Public fetch failed (no token)', err2);
            this.zone.run(() => { this.loading = false; this.errorMessage = 'Error al cargar libros filtrados.'; });
          }
        });
        return;
      }
    } catch (e) {}

    this.bookService.getBooksByFilter({
      ...(params.genereId && { genereId: params.genereId }),
      ...(params.authorId && { authorId: params.authorId }),
    }).subscribe({
      next: (b) => {
        this.zone.run(() => {
          this.books = this.sortBooks(b || []);
          this.loading = false;
          this.errorMessage = null;
          try { this.cd.detectChanges(); } catch (e) {}
        });
      },
      error: (err: any) => {
        const status = err?.status;

        if (status !== 401 && status !== 403) {
          console.error('Failed to load filtered books', err);
        } else {
          console.debug('Filtered books endpoint returned', status);
        }

        if (status === 401 || status === 403) {
          this.bookService.getAllPublic().subscribe({
            next: (all) => {
              try {
                const filtered = (all || []).filter(book => {
                  let ok = true;
                  if (params.genereId) {
                    const sel = params.genereId;
                    let selectedIds: string[] = [];
                    if (Array.isArray(sel)) selectedIds = sel.map(s => String(s));
                    else selectedIds = String(sel).split(',').map(s => s.trim()).filter(s => s.length > 0);
                    ok = ok && Array.isArray(book.genres) && book.genres.some(g => selectedIds.includes(String(g.id)));
                  }
                  if (params.authorId) {
                    ok = ok && book.author && String(book.author.id) === String(params.authorId);
                  }
                  return ok;
                });
                this.zone.run(() => {
                  this.books = this.sortBooks(filtered || []);
                  this.loading = false;
                  this.errorMessage = null;
                  try { this.cd.detectChanges(); } catch (e) {}
                });
              } catch (e) {
                console.error('Error filtering public books', e);
                this.zone.run(() => { this.loading = false; this.errorMessage = 'Error al cargar libros filtrados.'; });
              }
            },
            error: (err2) => {
              console.error('Public fetch also failed', err2);
              this.zone.run(() => {
                this.loading = false;
                this.errorMessage = 'Error al cargar libros filtrados.';
              });
            }
          });
          return;
        }
        this.zone.run(() => {
          this.loading = false;
          this.errorMessage = 'Error al cargar libros filtrados.';
        });
      }
    });
  }
}
