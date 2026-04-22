import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorDTO } from './author.service';
import { GenreDTO } from './genre.service';
import { SellerProfileDTO } from './seller-profile.service';

export interface BookDTO {
  id?: number;
  name: string;
  description: string;
  imageUrl?: string;
  price?: number;
  stock: number;
  author: AuthorDTO;
  genres: GenreDTO[];
  seller: SellerProfileDTO;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private base = '/api/books';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BookDTO[]> {
    return this.http.get<BookDTO[]>(this.base);
  }

  getAllPublic(): Observable<BookDTO[]> {
    const headers = { 'X-Skip-Auth': 'true' } as any;
    return this.http.get<BookDTO[]>(this.base, { headers });
  }

  getById(id: number): Observable<BookDTO> {
    return this.http.get<BookDTO>(`${this.base}/${id}`);
  }

  create(payload: {
    name: string;
    description: string;
    imageUrl?: string;
    stock: number;
    author: AuthorDTO;
    genres: GenreDTO[];
    seller: SellerProfileDTO;
  }): Observable<BookDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<BookDTO>(this.base, payload, headers ? { headers } : {});
  }

  update(
    id: number,
    payload: {
      name: string;
      description: string;
      imageUrl?: string;
      stock: number;
      author: AuthorDTO;
      genres: GenreDTO[];
      seller: SellerProfileDTO;
    }
  ): Observable<BookDTO> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<BookDTO>(`${this.base}/update/${id}`, payload, headers ? { headers } : {});
  }

  delete(id: number): Observable<void> {
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.base}/${id}`, headers ? { headers } : {});
  }

  getBooksByAuthor(authorId: number): Observable<BookDTO[]> {
    return this.http.get<BookDTO[]>(`${this.base}/author/${authorId}`);
  }

  getBooksByGenre(genreId: number): Observable<BookDTO[]> {
    return this.http.get<BookDTO[]>(`${this.base}/genre/${genreId}`);
  }

  getBooksByFilter(payload: { genereId?: string | string[]; authorId?: string }) {
    return this.http.get<BookDTO[]>(`${this.base}/filter`, {
      params: {
        ...(payload.genereId && { genereId: payload.genereId }),
        ...(payload.authorId && { authorId: payload.authorId }),
      }
    });
  }
}
