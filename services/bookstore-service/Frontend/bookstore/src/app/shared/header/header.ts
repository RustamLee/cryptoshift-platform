import { Component, ElementRef, HostListener, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { GenreService, GenreDTO } from '../../services/genre.service';
import { AuthorService, AuthorDTO } from '../../services/author.service';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { ProfileToggleService } from '../../pages/profile/profile-toggle.service';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuOpen = false;
  @ViewChild('userMenu', { static: false }) userMenu?: ElementRef<HTMLElement>;
  @ViewChild('genresMenu', { static: false }) genresMenu?: ElementRef<HTMLElement>;
  @ViewChild('authorBox', { static: false }) authorBox?: ElementRef<HTMLElement>;
  cartCount = 0;
  private cartSub?: Subscription;

  isDark = false;

  genres: GenreDTO[] = [];
  authors: AuthorDTO[] = [];
  authorQuery = '';
  showAuthorSuggestions = false;
  // book search query
  searchQuery = '';
  selectedGenres = new Set<number>();
  selectedAuthorId?: number;
  genresOpen = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.setDark(true);
    } else if (saved === 'light') {
      this.setDark(false);
    } else {
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDark(prefersDark);
    }

    try {
      this.cartSub = this.cartService.cart$.subscribe(items => {
        try { this.cartCount = (items || []).length; } catch(e) { this.cartCount = 0; }
        try { this.cd.detectChanges(); } catch (e) {}
      });
    } catch (e) {}

    try {
      this.genreService.getAllPublic().subscribe({
        next: (g) => {
          console.debug('[Header] loaded genres count=', (g || []).length, g);
          this.genres = g || [];
          try { this.cd.detectChanges(); } catch(e){}
        },
        error: (err) => {
          console.error('[Header] failed loading genres', err);
        }
      });
    } catch (e) { console.error('[Header] genres subscribe failed', e); }

    try {
      this.authorService.getAllPublic().subscribe({
        next: (a) => {
          console.debug('[Header] loaded authors count=', (a || []).length, a);
          this.authors = a || [];
          try { this.cd.detectChanges(); } catch(e){}
        },
        error: (err) => {
          console.error('[Header] failed loading authors', err);
        }
      });
    } catch (e) { console.error('[Header] authors subscribe failed', e); }

  }

  constructor(
    private router: Router,
    public auth: AuthService,
    private profileToggle: ProfileToggleService,
    private cartService: CartService,
    private cd: ChangeDetectorRef
    ,
    private genreService: GenreService,
    private authorService: AuthorService,
    private bookService: BookService
  ) {}
  toggleTheme() {
    this.setDark(!this.isDark);
  }

  private setDark(value: boolean) {
    this.isDark = value;
    const body = document.body;
    if (this.isDark) {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  getInitials(nameOrEmail: string | undefined | null) {
    if (!nameOrEmail) return '';
    const local = nameOrEmail.split('@')[0] || nameOrEmail;
    return local.slice(0, 2).toUpperCase();
  }

  toggleUserMenu(e: MouseEvent) {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  toggleGenresMenu(e: MouseEvent) {
    e.stopPropagation();
    this.genresOpen = !this.genresOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    const target = e.target as Node;
    if (this.menuOpen) {
      try {
        if (!this.userMenu || !this.userMenu.nativeElement || !this.userMenu.nativeElement.contains(target)) {
          this.menuOpen = false;
        }
      } catch (err) {
        this.menuOpen = false;
      }
    }

    if (this.genresOpen) {
      try {
        if (!this.genresMenu || !this.genresMenu.nativeElement || !this.genresMenu.nativeElement.contains(target)) {
          this.genresOpen = false;
        }
      } catch (err) {
        this.genresOpen = false;
      }
    }

    if (this.showAuthorSuggestions) {
      try {
        if (!this.authorBox || !this.authorBox.nativeElement || !this.authorBox.nativeElement.contains(target)) {
          this.showAuthorSuggestions = false;
        }
      } catch (err) {
        this.showAuthorSuggestions = false;
      }
    }
  }

  navigateTo(path: string) {
    this.menuOpen = false;
    this.router.navigate([path]);
  }

  selectedGenresHas(id?: number) {
    if (!id) return false;
    return this.selectedGenres.has(id);
  }

  onToggleGenre(id: number | undefined, event: Event) {
    if (!id) return;
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedGenres.add(id);
    else this.selectedGenres.delete(id);
    this.applyFilters();
  }

  onAuthorInput(e: Event) {
    const val = (e.target as HTMLInputElement).value || '';
    this.authorQuery = val;
    this.showAuthorSuggestions = true;
    const found = this.authors.find(x => x.name === val);
    if (found) this.selectedAuthorId = found.id;
    else this.selectedAuthorId = undefined;
    this.cd.detectChanges();
  }

  filteredAuthors(): AuthorDTO[] {
    const q = (this.authorQuery || '').toLowerCase().trim();
    if (!q) return this.authors.slice(0, 6);
    return this.authors.filter(a => (a.name || '').toLowerCase().includes(q)).slice(0, 8);
  }

  selectAuthor(a: AuthorDTO) {
    try {
      this.authorQuery = a.name || '';
      this.selectedAuthorId = a.id;
      this.showAuthorSuggestions = false;
      setTimeout(() => {
        try { this.applyFilters(); } catch (e) {}
        try { this.cd.detectChanges(); } catch (e) {}
      }, 0);
    } catch (e) {}
  }

  onBookInput(e: Event) {
    const val = (e.target as HTMLInputElement).value || '';
    this.searchQuery = val;
  }

  onBookSearch() {
    this.applyFilters();
  }

  applyFilters() {
    const genresArray = Array.from(this.selectedGenres);
    const params: any = {};
    if (genresArray.length) params.genereId = genresArray.map(g => String(g));
    if (this.selectedAuthorId) params.authorId = String(this.selectedAuthorId);
    if (this.searchQuery) params.title = String(this.searchQuery);
    try {
      this.router.navigate(['/'], { queryParams: params });
    } catch (e) {}
  }

  goToProfile() {
    this.menuOpen = false;
    try {
      const active = this.auth.getActiveRole() || null;
      if (active === 'ROLE_ADMIN') {
        this.router.navigate(['/profile', 'admin']);
        return;
      }
      if (active === 'ROLE_SELLER') {
        this.router.navigate(['/profile', 'seller']);
        return;
      }
      if (active === 'ROLE_CLIENT') {
        this.router.navigate(['/profile', 'client']);
        return;
      }
      const user = this.auth.userSignal();
      if (user?.roles?.includes('ROLE_ADMIN')) {
        this.router.navigate(['/profile', 'admin']);
        return;
      }
      if (user?.roles?.includes('ROLE_SELLER')) {
        this.router.navigate(['/profile', 'seller']);
        return;
      }
    } catch (e) {}
    this.router.navigate(['/profile', 'client', 'compras']);
  }

  get profileRoute(): any[] {
    try {
      const active = this.auth.getActiveRole() || null;
      if (active === 'ROLE_ADMIN') return ['/profile', 'admin'];
      if (active === 'ROLE_SELLER') return ['/profile', 'seller'];
      if (active === 'ROLE_CLIENT') return ['/profile', 'client'];
    } catch (e) {}
    const user = this.auth.userSignal();
    try {
      if (user?.roles?.includes('ROLE_ADMIN')) return ['/profile', 'admin'];
      if (user?.roles?.includes('ROLE_SELLER')) return ['/profile', 'seller'];
    } catch (e) {}
    return ['/profile', 'client'];
  }

  debugProfileClick(e: MouseEvent) {
    try {
      console.log('debugProfileClick - userSignal:', this.auth.userSignal());
      console.log('debugProfileClick - profileRoute (computed):', this.profileRoute);
      console.log('debugProfileClick - activeRole:', this.auth.getActiveRole());
    } catch (err) {}
    this.menuOpen = false;
    e.preventDefault();
    try {
      const active = this.auth.getActiveRole();
      if (active === 'ROLE_ADMIN') {
        this.router.navigate(['/profile', 'admin']);
        return;
      }
      if (active === 'ROLE_SELLER') {
        this.router.navigate(['/profile', 'seller']);
        return;
      }
      this.router.navigate(this.profileRoute);
    } catch (err) {
      console.error('Navigation error', err);
      this.router.navigate(['/profile', 'client']);
    }
  }

  get isAdmin(): boolean {
    try {
      const active = this.auth.getActiveRole();
      if (active === 'ROLE_ADMIN') return true;
      const u = this.auth.userSignal();
      if (u && u.roles) return !!u.roles.includes('ROLE_ADMIN');
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        return !!parsed?.roles?.includes('ROLE_ADMIN');
      }
    } catch (e) {}
    return false;
  }

  onAdminBooksClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'admin', 'books']);
  }

  onAdminGenresClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'admin', 'genres']);
  }

  onAdminAuthorsClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'admin', 'authors']);
  }

  onAdminSellerRequestsClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'admin', 'seller-requests']);
  }

  onAdminClientsClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'admin', 'clients']);
  }

  onAdminSellersClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'admin', 'sellers']);
  }

  onSellClick(): void {
    this.menuOpen = false;
    const user = this.auth.userSignal();
      const tokenPresent = (() => {
        try {
          return !!localStorage.getItem('jwtToken');
        } catch (e) {
          return false;
        }
      })();

    if (!user || !tokenPresent) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    const active = this.auth.getActiveRole();
    const isSellerActive = active === 'ROLE_SELLER' || user.roles?.includes('ROLE_SELLER');
    if (isSellerActive) {
      const onProfile = (this.currentUrl || this.router.url || '').includes('/profile');
      if (!onProfile) {
        this.router.navigate(['/profile']).then(() => this.profileToggle.requestToggle());
      } else {
        this.profileToggle.requestToggle();
      }
    } else {
      this.router.navigate(['/profile', 'client'], { queryParams: { openSellerModal: '1' } });
    }
  }

  onPurchasesClick(): void {
    this.menuOpen = false;
    const user = this.auth.userSignal();
      const tokenPresent = (() => {
        try {
          return !!localStorage.getItem('jwtToken');
        } catch (e) {
          return false;
        }
      })();

    if (!user || !tokenPresent) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    this.router.navigate(['/profile', 'client', 'compras']);
  }

  onCardsClick(): void {
    this.menuOpen = false;
    const user = this.auth.userSignal();
      const tokenPresent = (() => {
        try {
          return !!localStorage.getItem('jwtToken');
        } catch (e) {
          return false;
        }
      })();

    if (!user || !tokenPresent) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    this.router.navigate(['/profile', 'client', 'cards']);
  }

  onSellerSalesClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'seller']);
  }

  onSellerCatalogClick(): void {
    this.menuOpen = false;
    this.router.navigate(['/profile', 'seller', 'catalog']);
  }

  onCartClick(){
    this.menuOpen = false
    const user = this.auth.userSignal();
    const tokenPresent = (() => {
      try { return !!localStorage.getItem('jwtToken'); } catch (e) { return false; }
    })();
    if (!user || !tokenPresent) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.router.navigate(['/cart']);
  }

  getLocalPart(value?: string | null) {
    if (!value) return '';
    const idx = value.indexOf('@');
    const local = idx === -1 ? value : value.slice(0, idx);
    return local.length > 20 ? local.slice(0, 17) + '...' : local;
  }

  logout() {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }

  currentUrl = '';

  ngAfterViewInit(): void {
    this.currentUrl = this.router.url || '';
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects || e.url || '';
    });
  }

  ngOnDestroy(): void {
    try { this.cartSub?.unsubscribe(); } catch (e) {}
  }

  get isSellerRoute(): boolean {
    return this.currentUrl.includes('/profile/seller');
  }

  get isSellerActive(): boolean {
    try {
      const active = this.auth.getActiveRole();
      return active === 'ROLE_SELLER';
    } catch (e) {}
    return false;
  }

  get toggleLabel(): string {
    return this.isSellerRoute ? 'Comprar' : 'Vender';
  }

  onHeaderToggle(): void {
    this.menuOpen = false;
    this.profileToggle.requestToggle();
  }
}
