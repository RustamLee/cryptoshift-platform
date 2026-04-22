import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
    <div class="modal" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" aria-label="Cerrar" (click)="onCancel()">×</button>
        <h3>{{ editMode ? 'Editar Libro' : 'Crear Libro' }}</h3>

        <div class="modal-field">
          <label for="bookName">Nombre</label>
          <input
            id="bookName"
            [(ngModel)]="name"
            minlength="1"
            maxlength="50"
            placeholder="1–50 caracteres."
            (input)="onInput('name')"
            (blur)="onBlur('name')"
            (focus)="onFocus('name')"
          />
          @if (touchedName && (!name || (name && name.trim().length === 0))) {
          <div class="field-hint field-error">Requerido.</div>
          } @if (touchedName && name && name.trim().length > 50) {
          <div class="field-hint field-error">Máximo 50 caracteres.</div>
          }
        </div>

        <div class="modal-field">
          <label for="bookDescription">Descripción</label>
          <input
            id="bookDescription"
            [(ngModel)]="description"
            maxlength="200"
            placeholder="Opcional — máximo 200 caracteres."
            (input)="onInput('description')"
            (blur)="onBlur('description')"
            (focus)="onFocus('description')"
          />
          @if (touchedDescription && description && description.length > 200) {
          <div class="field-hint field-error">Máximo 200 caracteres.</div>
          }
        </div>

        <div class="modal-field">
          <label for="bookImage">URL de la imagen</label>
          <input
            id="bookImage"
            placeholder="https://example.com/cover.jpg"
            [(ngModel)]="imageUrl"
            maxlength="2048"
            (input)="onInput('image')"
            (blur)="onBlur('image')"
            (focus)="onFocus('image')"
          />
          @if (touchedImage && (!imageUrl || (imageUrl && imageUrl.trim().length === 0))) {
          <div class="field-hint field-error">Obligatorio.</div>
          } @if (touchedImage && imageUrl && imageUrl.trim().length > 2048) {
          <div class="field-hint field-error">Máximo 2048 caracteres.</div>
          } @if (imageUrl && imageUrl.trim().length > 0 && imageUrl.trim().length <= 2048) {
          <div class="field-hint">Obligatorio — máximo 2048 caracteres.</div>
          }
        </div>

        <div class="modal-field">
          <label for="bookPrice">Precio</label>
          <input
            id="bookPrice"
            type="number"
            step="0.01"
            [(ngModel)]="price"
            min="0"
            max="1000000"
            placeholder="Máximo 1.000.000."
            (input)="onInput('price')"
            (blur)="onBlur('price')"
            (focus)="onFocus('price')"
          />
          @if (touchedPrice && (price === null || price === undefined)) {
          <div class="field-hint field-error">Requerido.</div>
          } @if (touchedPrice && price !== null && price !== undefined && price > 1000000) {
          <div class="field-hint field-error">Máximo 1.000.000.</div>
          }
        </div>

        <div class="modal-field">
          <label for="bookStock">Stock</label>
          <input
            id="bookStock"
            type="number"
            [(ngModel)]="stock"
            min="0"
            max="10000"
            placeholder="Máximo 10.000."
            (input)="onInput('stock')"
            (blur)="onBlur('stock')"
            (focus)="onFocus('stock')"
          />
          @if (touchedStock && (stock === null || stock === undefined)) {
          <div class="field-hint field-error">Requerido.</div>
          } @if (touchedStock && stock !== null && stock !== undefined && stock > 10000) {
          <div class="field-hint field-error">Máximo 10.000.</div>
          }
        </div>

        <div class="modal-field">
          <label for="bookAuthor">Autor</label>
          <select
            id="bookAuthor"
            [(ngModel)]="authorId"
            (change)="onInput('author')"
            (blur)="onBlur('author')"
            (focus)="onFocus('author')"
          >
            <option [ngValue]="null">-- seleccionar --</option>
            <option *ngFor="let a of authors" [ngValue]="a.id">{{ a.name }}</option>
          </select>
        </div>

        <div class="modal-field">
          <label for="bookGenres">Género</label>
          <select
            id="bookGenres"
            [(ngModel)]="genreId"
            (change)="onInput('genre')"
            (blur)="onBlur('genre')"
            (focus)="onFocus('genre')"
          >
            <option [ngValue]="null">-- seleccionar --</option>
            <option *ngFor="let g of genres" [ngValue]="g.id">{{ g.name }}</option>
          </select>
        </div>

        @if (formError) {
        <div class="error">{{ formError }}</div>
        }

        <div class="modal-actions">
          <button class="btn-primary" (click)="onSubmit()" [disabled]="saving || !validForSubmit()">
            @if (saving) {<span class="spinner" aria-hidden="true"></span>}
            {{ editMode ? 'Guardar' : 'Crear' }}
          </button>
          <button class="btn-secondary" (click)="onCancel()" [disabled]="saving">Cancelar</button>
        </div>
      </div>
    </div>
    }
  `,
})
export class BookFormComponent implements OnChanges {
  @Input() visible = false;
  @Input() book: any = null;
  @Input() authors: any[] = [];
  @Input() genres: any[] = [];
  @Input() saving = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  description = '';
  imageUrl = '';
  price: number | null = null;
  stock: number | null = null;
  authorId: number | null = null;
  genreId: number | null = null;
  formError: string | null = null;
  editMode = false;
  savingLocal = false;
  touchedName = false;
  touchedDescription = false;
  touchedImage = false;
  touchedPrice = false;
  touchedStock = false;
  touchedAuthor = false;

  dirtyName = false;
  dirtyDescription = false;
  dirtyImage = false;
  dirtyPrice = false;
  dirtyStock = false;
  dirtyAuthor = false;
  focusedName = false;
  focusedDescription = false;
  focusedImage = false;
  focusedPrice = false;
  focusedStock = false;
  focusedAuthor = false;
  touchedGenre = false;
  dirtyGenre = false;
  focusedGenre = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['book']) {
      const b = this.book || null;
      this.editMode = !!b && !!b.id;
      this.name = b?.name || '';
      this.description = b?.description || '';
      this.imageUrl = b?.imageUrl || '';
      this.price = b?.price ?? null;
      this.stock = b?.stock ?? null;
      this.authorId = b?.author?.id ?? null;
      const mapped = (b?.genres || []).map((g: any) => g.id) || [];
      this.genreId = mapped.length > 0 ? mapped[0] : null;
      this.formError = null;
      // reset touched/dirty/focus state when loading a new book
      this.touchedName = this.touchedDescription = this.touchedImage = false;
      this.touchedPrice = this.touchedStock = this.touchedAuthor = false;
      this.dirtyName = this.dirtyDescription = this.dirtyImage = false;
      this.dirtyPrice = this.dirtyStock = this.dirtyAuthor = false;
      this.focusedName = this.focusedDescription = this.focusedImage = false;
      this.focusedPrice = this.focusedStock = this.focusedAuthor = false;
      this.touchedGenre = this.dirtyGenre = this.focusedGenre = false;
    }
    if (changes['saving']) {
      this.savingLocal = !!this.saving;
    }
  }

  onInput(field: string): void {
    switch (field) {
      case 'name':
        this.dirtyName = true;
        break;
      case 'description':
        this.dirtyDescription = true;
        break;
      case 'image':
        this.dirtyImage = true;
        break;
      case 'price':
        this.dirtyPrice = true;
        break;
      case 'stock':
        this.dirtyStock = true;
        break;
      case 'author':
        this.dirtyAuthor = true;
        break;
      case 'genre':
        this.dirtyGenre = true;
        break;
    }
  }

  onBlur(field: string): void {
    switch (field) {
      case 'name':
        if (this.dirtyName || this.focusedName) this.touchedName = true;
        this.focusedName = false;
        break;
      case 'description':
        if (this.dirtyDescription || this.focusedDescription) this.touchedDescription = true;
        this.focusedDescription = false;
        break;
      case 'image':
        if (this.dirtyImage || this.focusedImage) this.touchedImage = true;
        this.focusedImage = false;
        break;
      case 'price':
        if (this.dirtyPrice || this.focusedPrice) this.touchedPrice = true;
        this.focusedPrice = false;
        break;
      case 'stock':
        if (this.dirtyStock || this.focusedStock) this.touchedStock = true;
        this.focusedStock = false;
        break;
      case 'author':
        if (this.dirtyAuthor || this.focusedAuthor) this.touchedAuthor = true;
        this.focusedAuthor = false;
        break;
      case 'genre':
        if (this.dirtyGenre || this.focusedGenre) this.touchedGenre = true;
        this.focusedGenre = false;
        break;
    }
  }

  onFocus(field: string): void {
    switch (field) {
      case 'name':
        this.focusedName = true;
        break;
      case 'description':
        this.focusedDescription = true;
        break;
      case 'image':
        this.focusedImage = true;
        break;
      case 'price':
        this.focusedPrice = true;
        break;
      case 'stock':
        this.focusedStock = true;
        break;
      case 'author':
        this.focusedAuthor = true;
        break;
      case 'genre':
        this.focusedGenre = true;
        break;
    }
  }

  validForSubmit(): boolean {
    const nameOk = !!this.name && this.name.trim().length >= 1 && this.name.trim().length <= 50;
    const descOk = !this.description || this.description.length <= 200;
    const imageOk =
      !!this.imageUrl && this.imageUrl.trim().length > 0 && this.imageUrl.trim().length <= 2048;
    const priceOk =
      this.price !== null &&
      !isNaN(Number(this.price)) &&
      Number(this.price) > 0 &&
      Number(this.price) <= 1000000;
    const stockOk =
      this.stock !== null &&
      !isNaN(Number(this.stock)) &&
      Number(this.stock) >= 0 &&
      Number(this.stock) <= 10000;
    const authorOk = this.authorId !== null && this.authorId !== undefined;
    const genreOk = this.genreId !== null && this.genreId !== undefined;
    return nameOk && descOk && imageOk && priceOk && stockOk && authorOk && genreOk;
  }

  onSubmit(): void {
    this.formError = null;
    if (!this.validForSubmit()) {
      this.formError = 'Rellena todos los campos requeridos correctamente.';
      return;
    }
    const payload: any = {
      name: this.name.trim(),
      description: this.description ? this.description.trim() : '',
      imageUrl: this.imageUrl ? this.imageUrl.trim() : '',
      price: Number(this.price),
      stock: Number(this.stock),
      author: { id: this.authorId },
      genres: this.genreId ? [{ id: this.genreId }] : [],
    };
    this.save.emit(payload);
  }

  onCancel(): void {
    if (this.savingLocal) return;
    this.cancel.emit();
  }
}
